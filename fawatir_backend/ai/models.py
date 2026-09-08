import uuid
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.db import models

from api.models import Organization


class Document(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PROCESSED = 'processed'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PROCESSED, 'Processed'),
        (STATUS_FAILED, 'Failed'),
    ]

    DOC_TYPE_INVOICE = 'invoice'
    DOC_TYPE_SHIPPING = 'shipping'
    DOC_TYPE_RECEIPT = 'receipt'
    DOC_TYPE_OTHER = 'other'
    DOC_TYPE_CHOICES = [
        (DOC_TYPE_INVOICE, 'Invoice'),
        (DOC_TYPE_SHIPPING, 'Shipping'),
        (DOC_TYPE_RECEIPT, 'Receipt'),
        (DOC_TYPE_OTHER, 'Other'),
    ]

    LANGUE_FR = 'fr'
    LANGUE_EN = 'en'
    LANGUE_AR = 'ar'
    LANGUE_AUTRE = 'autre'
    LANGUE_CHOICES = [
        (LANGUE_FR, 'Français'),
        (LANGUE_EN, 'English'),
        (LANGUE_AR, 'العربية'),
        (LANGUE_AUTRE, 'Autre'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/%Y/%m/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    # Promoted from extracted_data: the fields every document type shares, so the rest of the
    # app can query/filter on them (e.g. "all invoices over 1000 DH") without reaching into
    # JSON. Type-specific fields (montant_ht, montant_tva, lignes, ...) stay in extracted_data —
    # they don't apply to every doc_type and don't earn a column of their own.
    doc_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES, null=True, blank=True, db_index=True)
    langue = models.CharField(max_length=10, choices=LANGUE_CHOICES, null=True, blank=True)
    fournisseur = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    numero = models.CharField(max_length=100, null=True, blank=True)
    montant_ttc = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    # Raw model output, kept for debugging/audit even if parsing later fails.
    raw_response = models.JSONField(null=True, blank=True)

    # Full parsed payload: fournisseur, date, numero, montant_ht, montant_tva, montant_ttc,
    # lignes — the fields above are copies of a subset of this, promoted to real columns.
    extracted_data = models.JSONField(null=True, blank=True)
    # Per-field confidence score (0-1) as reported/derived for each extracted field.
    field_confidence = models.JSONField(null=True, blank=True)
    # True if any field is below the confidence threshold or fails arithmetic validation.
    needs_review = models.BooleanField(default=False)

    error_message = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Document {self.id} ({self.status})'

    def promote_fields(self):
        """Copies the shared fields out of extracted_data into their own columns, converting
        types safely — an unparseable date or amount just stays null rather than raising, since
        extracted_data (and needs_review) already carries the "this needs a human look" signal.

        Called after extraction (perform_create) and after a human correction (partial_update),
        so the columns never drift out of sync with extracted_data.
        """
        data = self.extracted_data or {}
        valid_doc_types = {choice[0] for choice in self.DOC_TYPE_CHOICES}
        valid_langues = {choice[0] for choice in self.LANGUE_CHOICES}

        doc_type = data.get('doc_type')
        self.doc_type = doc_type if doc_type in valid_doc_types else None

        langue = data.get('langue')
        self.langue = langue if langue in valid_langues else None

        self.fournisseur = data.get('fournisseur') or None
        self.numero = data.get('numero') or None

        self.date = None
        raw_date = data.get('date')
        if raw_date:
            try:
                self.date = datetime.strptime(raw_date, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                pass

        self.montant_ttc = None
        raw_ttc = data.get('montant_ttc')
        if raw_ttc is not None:
            try:
                self.montant_ttc = Decimal(str(raw_ttc))
            except (InvalidOperation, ValueError, TypeError):
                pass


class SpreadsheetImport(models.Model):
    """A company's Excel file (products, suppliers, or anything else) with an AI-proposed
    column mapping, reviewed and confirmed by a human before the data is finalized.

    No target Django model exists yet for this data (that's a future Product/Supplier model),
    so this is intentionally self-contained: column_mapping and normalized_rows are JSON, not
    foreign keys into another app's schema. Once a real target model exists, promoting
    normalized_rows into it follows the same pattern as Document.promote_fields().
    """

    STATUS_PENDING = 'pending'
    STATUS_MAPPED = 'mapped'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_MAPPED, 'Mapped'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_FAILED, 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='spreadsheet_imports')
    file = models.FileField(upload_to='spreadsheets/%Y/%m/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    # Free-text classification of what this data represents (e.g. "products", "suppliers") —
    # not a fixed enum, since we don't know all the shapes a company might upload.
    data_type = models.CharField(max_length=50, null=True, blank=True)

    # List of {"source_column": str, "field_name": str|None, "label": str}. field_name is the
    # AI-proposed (or human-corrected) canonical snake_case name; null means "ignore this column".
    column_mapping = models.JSONField(null=True, blank=True)
    # First few raw rows (original column names), shown in the review UI for context.
    sample_rows = models.JSONField(null=True, blank=True)
    # Full dataset with column_mapping applied — populated only once confirmed.
    normalized_rows = models.JSONField(null=True, blank=True)
    row_count = models.IntegerField(null=True, blank=True)

    # True until the human explicitly confirms the mapping — there's no arithmetic cross-check
    # to lean on here (unlike Document), so review is an explicit required gate, not a heuristic.
    needs_review = models.BooleanField(default=True)
    error_message = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'SpreadsheetImport {self.id} ({self.status})'
