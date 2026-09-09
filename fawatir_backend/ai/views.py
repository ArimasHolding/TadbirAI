from django.middleware.csrf import get_token
from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView

from .models import Document, SpreadsheetImport
from .serializers import (
    DocumentCorrectionSerializer,
    DocumentSerializer,
    SpreadsheetImportSerializer,
)
from .services.forecast import InsufficientHistoryError, forecast_cashflow
from .services.ocr import OCRExtractionError, extract_invoice
from .services.spreadsheet import (
    SpreadsheetError,
    apply_mapping,
    parse_spreadsheet,
    propose_mapping,
)


def scanner_test_page(request):
    # Forces Django to set the csrftoken cookie on this page, regardless of whether the
    # visitor has ever hit a view that renders {% csrf_token %} (e.g. /admin/) — the page's
    # own JS needs this cookie to send authenticated POST/PATCH requests (see scanner.html).
    get_token(request)
    return render(request, 'ai/scanner.html')


def import_test_page(request):
    get_token(request)
    return render(request, 'ai/import.html')


def ai_hub_page(request):
    get_token(request)
    return render(request, 'ai/hub.html')


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def perform_create(self, serializer):
        document = serializer.save()
        try:
            document.file.seek(0)
            result = extract_invoice(document.file.read(), self._mime_type(document))
        except OCRExtractionError as exc:
            document.status = Document.STATUS_FAILED
            document.error_message = str(exc)
            document.save()
            return

        document.status = Document.STATUS_PROCESSED
        document.extracted_data = result['extracted_data']
        document.field_confidence = result['field_confidence']
        document.needs_review = result['needs_review']
        document.raw_response = result['raw_response']
        document.promote_fields()
        document.save()

    @staticmethod
    def _mime_type(document):
        name = document.file.name.lower()
        if name.endswith('.png'):
            return 'image/png'
        if name.endswith('.webp'):
            return 'image/webp'
        if name.endswith('.pdf'):
            return 'application/pdf'
        return 'image/jpeg'

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = DocumentCorrectionSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        # A human correction closes the review loop for this document.
        serializer.save(needs_review=False)
        instance.promote_fields()
        instance.save()
        return Response(DocumentSerializer(instance).data)


class SpreadsheetImportViewSet(viewsets.ModelViewSet):
    queryset = SpreadsheetImport.objects.all()
    serializer_class = SpreadsheetImportSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def perform_create(self, serializer):
        instance = serializer.save()
        expected_type = self.request.data.get('expected_type')
        try:
            instance.file.seek(0)
            headers, rows = parse_spreadsheet(instance.file.read())
            mapping = propose_mapping(headers, rows[:5], expected_type=expected_type)
        except SpreadsheetError as exc:
            instance.status = SpreadsheetImport.STATUS_FAILED
            instance.error_message = str(exc)
            instance.save()
            return

        instance.status = SpreadsheetImport.STATUS_MAPPED
        instance.data_type = mapping['data_type']
        instance.column_mapping = mapping['columns']
        instance.sample_rows = rows[:5]
        instance.row_count = len(rows)
        instance.save()

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Re-parses the file and applies the (possibly human-corrected) column_mapping
        already stored on the instance — the mapping the user reviewed/edited via PATCH."""
        instance = self.get_object()
        if not instance.column_mapping:
            return Response({'detail': 'No column mapping to confirm'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            instance.file.seek(0)
            _, rows = parse_spreadsheet(instance.file.read())
        except SpreadsheetError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        instance.normalized_rows = apply_mapping(rows, instance.column_mapping)
        
        # Execute the database import
        from .services.import_executor import execute_import
        
        # We need a company. We'll use the company associated with the current user or first company.
        # Since SpreadsheetImport doesn't have a company FK currently, we'll try to find one.
        from api.models import Company
        company = Company.objects.first() # Using first company for simplicity in this hub
        
        if not company:
            return Response({'detail': 'No company found for import.'}, status=status.HTTP_400_BAD_REQUEST)
            
        import_result = execute_import(company, instance.data_type, instance.normalized_rows)
        
        instance.status = SpreadsheetImport.STATUS_CONFIRMED
        instance.needs_review = False
        instance.save()
        
        data = SpreadsheetImportSerializer(instance).data
        data['import_result'] = import_result
        return Response(data)

from rest_framework.parsers import MultiPartParser

class FastSpreadsheetMappingView(APIView):
    """
    Takes an Excel file, reads it, maps it using Gemini, and returns the 
    mapping and sample rows immediately WITHOUT saving anything to the database.
    """
    parser_classes = [MultiPartParser]

    @extend_schema(summary="Fast mapping for spreadsheet columns", responses={200: SpreadsheetImportSerializer})
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            headers, rows = parse_spreadsheet(file_obj.read())
            mapping = propose_mapping(headers, rows[:10])
        except SpreadsheetError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'status': 'mapped',
            'data_type': mapping.get('data_type', 'other'),
            'analysis': mapping.get('analysis', ''),
            'column_mapping': mapping.get('columns', []),
            'sample_rows': rows[:10],
            'row_count': len(rows),
        }, status=status.HTTP_200_OK)


class CashflowForecastView(APIView):
    @extend_schema(summary="Generate cashflow forecast", responses={200: dict})
    def get(self, request):
        history = request.data.get('history')
        company_id = request.data.get('company_id')
        horizon_days = int(request.data.get('horizon_days', 30))

        if not company_id:
            return Response({'detail': 'company_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not history:
            return Response({'detail': 'history is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = forecast_cashflow(history, horizon_days=horizon_days)
        except InsufficientHistoryError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result)
