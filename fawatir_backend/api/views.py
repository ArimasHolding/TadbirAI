from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.core.mail import send_mail, EmailMessage
from django.core.mail.backends.smtp import EmailBackend
from django.conf import settings
from twilio.rest import Client
import os
from . import models, serializers

class TenantIsolationMixin:    
    def get_queryset(self):
        # Retrieve the tenant user via the email bridge
        tenant_user = models.User.objects.filter(email=self.request.user.email).first()
        user_org = tenant_user.organisation_id if tenant_user else None
        
        # Return the actively filtered queryset
        return super().get_queryset().filter(organisation_id=user_org)

    def perform_create(self, serializer):
        # Apply the exact same bridge for POST requests
        tenant_user = models.User.objects.filter(email=self.request.user.email).first()
        user_org = tenant_user.organisation_id if tenant_user else None
        
        serializer.save(organisation_id=user_org)
        
class IsAdminRoleOnly(permissions.BasePermission):
    """
    Custom permission to ensure only users with 'Admin' or 'Administrateur' role can modify roles/IAM.
    Returns 403 Forbidden if unauthorized.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user_role = getattr(getattr(request.user, 'role', None), 'system_name', None) or getattr(request.user, 'role_name', '')
        if user_role and str(user_role).lower() not in ['admin', 'administrateur']:
            raise PermissionDenied(detail="Unauthorized: Only Admin users can modify roles (HTTP 403).")
        return True

# # foundation
# class CompanyViewSet(viewsets.ModelViewSet):
#     queryset, serializer_class = models.Company.objects.all(), serializers.CompanySerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = models.Organization.objects.all()
    serializer_class = serializers.OrganizationSerializer

class RoleViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Role.objects.all(), serializers.RoleSerializer
    permission_classes = [IsAdminRoleOnly]

class UserViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.User.objects.all(), serializers.UserSerializer
    permission_classes = [IsAdminRoleOnly]

class PermissionViewSet(viewsets.ModelViewSet):
    queryset, serializer_class = models.Permission.objects.all(), serializers.PermissionSerializer
    permission_classes = [IsAdminRoleOnly]

class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset, serializer_class = models.RolePermission.objects.all(), serializers.RolePermissionSerializer
    permission_classes = [IsAdminRoleOnly]

# class CompanySettingViewSet(viewsets.ModelViewSet):
#     queryset, serializer_class = models.CompanySetting.objects.all(), serializers.CompanySettingSerializer

class OrganizationSettingViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset = models.OrganizationSetting.objects.all()
    serializer_class = serializers.OrganizationSettingSerializer

class AuditLogViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AuditLog.objects.all(), serializers.AuditLogSerializer

class UserPreferenceViewSet(viewsets.ModelViewSet):
    queryset, serializer_class = models.UserPreference.objects.all(), serializers.UserPreferenceSerializer

class UserSessionViewSet(viewsets.ModelViewSet):
    queryset, serializer_class = models.UserSession.objects.all(), serializers.UserSessionSerializer

class PasswordResetViewSet(viewsets.ModelViewSet):
    queryset, serializer_class = models.PasswordReset.objects.all(), serializers.PasswordResetSerializer

class EmailVerificationViewSet(viewsets.ModelViewSet):
    queryset, serializer_class = models.EmailVerification.objects.all(), serializers.EmailVerificationSerializer

class ActivityLogViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.ActivityLog.objects.all(), serializers.ActivityLogSerializer

class NotificationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Notification.objects.all(), serializers.NotificationSerializer

class PdfTemplateViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.PdfTemplate.objects.all(), serializers.PdfTemplateSerializer

# CRM
class ClientViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Client.objects.all(), serializers.ClientSerializer

    @action(detail=False, methods=['post'])
    def clear(self, request):
        self.get_queryset().delete()
        return Response({"status": "cleared"})
        
class SupplierViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Supplier.objects.all(), serializers.SupplierSerializer

    @action(detail=False, methods=['post'])
    def clear(self, request):
        self.get_queryset().delete()
        return Response({"status": "cleared"})

class MarketingCampaignViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.MarketingCampaign.objects.all(), serializers.MarketingCampaignSerializer

class ClientContactViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.ClientContact.objects.all(), serializers.ClientContactSerializer

class CustomerAddressViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.CustomerAddress.objects.all(), serializers.CustomerAddressSerializer

class CustomerPortalViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.CustomerPortal.objects.all(), serializers.CustomerPortalSerializer

class SupplierContactViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.SupplierContact.objects.all(), serializers.SupplierContactSerializer

class SupplierAddressViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.SupplierAddress.objects.all(), serializers.SupplierAddressSerializer

class WhatsappMessageViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.WhatsappMessage.objects.all(), serializers.WhatsappMessageSerializer

class MarketingAdViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.MarketingAd.objects.all(), serializers.MarketingAdSerializer

class MarketingMetricViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.MarketingMetric.objects.all(), serializers.MarketingMetricSerializer

# Inventory
class CategoryViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Category.objects.all(), serializers.CategorySerializer

class ProductViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Product.objects.all(), serializers.ProductSerializer

    @action(detail=False, methods=['post'])
    def clear(self, request):
        self.get_queryset().delete()
        return Response({"status": "cleared"})

class ProductVariantViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.ProductVariant.objects.all(), serializers.ProductVariantSerializer

class InventoryViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Inventory.objects.all(), serializers.InventorySerializer

class StockMovementViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.StockMovement.objects.all(), serializers.StockMovementSerializer

class SupplierProductViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.SupplierProduct.objects.all(), serializers.SupplierProductSerializer
# Accounting 
class InvoiceViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Invoice.objects.all(), serializers.InvoiceSerializer

    # --- TAD-3 Tenant Isolation ---
    def get_queryset(self):
        # FIXED: organization_id -> organisation_id
        user_org = self.request.user.organisation_id
        return super().get_queryset().filter(organisation_id=user_org)

    def perform_create(self, serializer):
        # FIXED: organization_id -> organisation_id
        serializer.save(organisation_id=self.request.user.organisation_id)
    # ------------------------------

    @action(detail=False, methods=['post'])
    def clear(self, request):
        self.get_queryset().delete()
        return Response({"status": "cleared"})

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        invoice = self.get_object()
        client_email = invoice.client.email if invoice.client else request.data.get('email')
        
        if not client_email:
            return Response({"error": "No email address provided or found for this client."}, status=400)

        subject = f"Invoice {invoice.invoice_number} from {invoice.company.name if invoice.company else 'Tadbir AI'}"
        message = f"Hello,\n\nPlease find attached the details for Invoice {invoice.invoice_number}.\nTotal Amount: {invoice.total_amount}\n\nThank you!"
        
        settings_obj = invoice.company.settings.first() if invoice.company else None
        
        try:
            if settings_obj and getattr(settings_obj, 'smtp_host', None) and getattr(settings_obj, 'smtp_user', None) and getattr(settings_obj, 'smtp_password', None):
                # Use dynamic backend
                backend = EmailBackend(
                    host=settings_obj.smtp_host,
                    port=getattr(settings_obj, 'smtp_port', 587),
                    username=settings_obj.smtp_user,
                    password=settings_obj.smtp_password,
                    use_tls=True
                )
                email = EmailMessage(
                    subject=subject,
                    body=message,
                    from_email=settings_obj.smtp_user,
                    to=[client_email],
                    connection=backend
                )
                email.send()
            else:
                # Use default fallback backend
                send_mail(
                    subject,
                    message,
                    settings.EMAIL_HOST_USER or 'noreply@tadbir.ai',
                    [client_email],
                    fail_silently=False,
                )
            return Response({"status": "Email sent successfully!"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['post'])
    def send_whatsapp(self, request, pk=None):
        invoice = self.get_object()
        client_phone = invoice.client.phone if invoice.client else request.data.get('phone')
        
        if not client_phone:
            return Response({"error": "No phone number provided or found for this client."}, status=400)

        settings_obj = invoice.company.settings.first() if invoice.company else None
        account_sid = (getattr(settings_obj, 'twilio_account_sid', None) if settings_obj else None) or os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = (getattr(settings_obj, 'twilio_auth_token', None) if settings_obj else None) or os.environ.get('TWILIO_AUTH_TOKEN')
        twilio_number = (getattr(settings_obj, 'twilio_phone_number', None) if settings_obj else None) or os.environ.get('TWILIO_WHATSAPP_NUMBER')

        if not all([account_sid, auth_token, twilio_number]):
            return Response({"error": "Twilio credentials are not configured on the server or in the company settings."}, status=500)

        try:
            from twilio.rest import Client # Ensure this import exists at the top of your file
            client = Client(account_sid, auth_token)
            whatsapp_message = client.messages.create(
                body=f"Hello, your invoice {invoice.invoice_number} for {invoice.total_amount} MAD is ready.",
                from_=twilio_number,
                to=f"whatsapp:{client_phone}" if not client_phone.startswith('whatsapp:') else client_phone
            )
            return Response({"status": "WhatsApp message sent successfully!", "sid": whatsapp_message.sid})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class InvoiceItemViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.InvoiceItem.objects.all(), serializers.InvoiceItemSerializer

class PaymentViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Payment.objects.all(), serializers.PaymentSerializer

class BankAccountViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.BankAccount.objects.all(), serializers.BankAccountSerializer

class RecurringInvoiceViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.RecurringInvoice.objects.all(), serializers.RecurringInvoiceSerializer

class BankTransactionViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.BankTransaction.objects.all(), serializers.BankTransactionSerializer

class BankReconciliationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.BankReconciliation.objects.all(), serializers.BankReconciliationSerializer

#Quotation
class QuotationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Quotation.objects.all(), serializers.QuotationSerializer

    @action(detail=False, methods=['post'])
    def clear(self, request):
        self.get_queryset().delete()
        return Response({"status": "cleared"})

class QuotationItemViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.QuotationItem.objects.all(), serializers.QuotationItemSerializer

# Purchase Orders
class PurchaseOrderViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.PurchaseOrder.objects.all(), serializers.PurchaseOrderSerializer

class PurchaseOrderItemViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.PurchaseOrderItem.objects.all(), serializers.PurchaseOrderItemSerializer

#Pos
class PosSessionViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.PosSession.objects.all(), serializers.PosSessionSerializer

class PosSaleViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.PosSale.objects.all(), serializers.PosSaleSerializer

class PosSaleItemViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.PosSaleItem.objects.all(), serializers.PosSaleItemSerializer

#HR
class DepartmentViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Department.objects.all(), serializers.DepartmentSerializer

class EmployeeViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Employee.objects.all(), serializers.EmployeeSerializer

class PayrollViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Payroll.objects.all(), serializers.PayrollSerializer

class PayrollItemViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.PayrollItem.objects.all(), serializers.PayrollItemSerializer

#AI 
class AiConversationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AiConversation.objects.all(), serializers.AiConversationSerializer

class OcrDocumentViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.OcrDocument.objects.all(), serializers.OcrDocumentSerializer

class AiMessageViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AiMessage.objects.all(), serializers.AiMessageSerializer

class AiTaskViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AiTask.objects.all(), serializers.AiTaskSerializer

class AiRecommendationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AiRecommendation.objects.all(), serializers.AiRecommendationSerializer

class AiAutomationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AiAutomation.objects.all(), serializers.AiAutomationSerializer

class AiNotificationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AiNotification.objects.all(), serializers.AiNotificationSerializer

class AiAdGenerationViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.AiAdGeneration.objects.all(), serializers.AiAdGenerationSerializer

# Support
class TicketViewSet(TenantIsolationMixin, viewsets.ModelViewSet):
    queryset, serializer_class = models.Ticket.objects.all(), serializers.TicketSerializer