from rest_framework import serializers
from . import models

class TenantSerializerMixin(serializers.ModelSerializer):
    """Automatically forces 'organisation' to be read-only on any inheriting serializer."""
    def get_fields(self):
        fields = super().get_fields()
        if 'organisation' in fields:
            fields['organisation'].read_only = True
        return fields

# # Foundation
# class CompanySerializer(TenantSerializerMixin):
#     class Meta:
#         model = models.Company
#         fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Organization
        fields = '__all__'

class RoleSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Role
        fields = '__all__'
        read_only_fields = ['organisation']
        
class UserSerializer(TenantSerializerMixin):
    nom = serializers.SerializerMethodField()
    role = serializers.SlugRelatedField(slug_field='display_name', queryset=models.Role.objects.all())
    statut = serializers.SerializerMethodField()

    class Meta:
        model = models.User
        fields = '__all__'

    def get_nom(self, obj):
        first = obj.first_name or ""
        last = obj.last_name or ""
        if not first and not last:
            return "Sans nom"
        return f"{first} {last}".strip()
        
    def get_statut(self, obj):
        if not obj.is_active:
            return "Suspendu"
        if not obj.email_verified:
            return "Invité"
        return "Actif"

class PermissionSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Permission
        fields = '__all__'

class RolePermissionSerializer(TenantSerializerMixin):
    class Meta:
        model = models.RolePermission
        fields = '__all__'

# class CompanySettingSerializer(TenantSerializerMixin):
#     class Meta:
#         model = models.CompanySetting
#         fields = '__all__'

class OrganizationSettingSerializer(TenantSerializerMixin):
    class Meta:
        model = models.OrganizationSetting
        fields = '__all__'

class AuditLogSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AuditLog
        fields = '__all__'

class UserPreferenceSerializer(TenantSerializerMixin):
    class Meta:
        model = models.UserPreference
        fields = '__all__'

class UserSessionSerializer(TenantSerializerMixin):
    class Meta:
        model = models.UserSession
        fields = '__all__'

class PasswordResetSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PasswordReset
        fields = '__all__'

class EmailVerificationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.EmailVerification
        fields = '__all__'

class ActivityLogSerializer(TenantSerializerMixin):
    class Meta:
        model = models.ActivityLog
        fields = '__all__'

class NotificationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Notification
        fields = '__all__'

class PdfTemplateSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PdfTemplate
        fields = '__all__'
# CRM 
class ClientSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Client
        fields = '__all__'
        read_only_fields = ['organisation']

class SupplierSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Supplier
        fields = '__all__'

class MarketingCampaignSerializer(TenantSerializerMixin):
    class Meta:
        model = models.MarketingCampaign
        fields = '__all__'

class ClientContactSerializer(TenantSerializerMixin):
    class Meta:
        model = models.ClientContact
        fields = '__all__'

class CustomerAddressSerializer(TenantSerializerMixin):
    class Meta:
        model = models.CustomerAddress
        fields = '__all__'

class CustomerPortalSerializer(TenantSerializerMixin):
    class Meta:
        model = models.CustomerPortal
        fields = '__all__'

class SupplierContactSerializer(TenantSerializerMixin):
    class Meta:
        model = models.SupplierContact
        fields = '__all__'

class SupplierAddressSerializer(TenantSerializerMixin):
    class Meta:
        model = models.SupplierAddress
        fields = '__all__'

class WhatsappMessageSerializer(TenantSerializerMixin):
    class Meta:
        model = models.WhatsappMessage
        fields = '__all__'

class MarketingAdSerializer(TenantSerializerMixin):
    class Meta:
        model = models.MarketingAd
        fields = '__all__'

class MarketingMetricSerializer(TenantSerializerMixin):
    class Meta:
        model = models.MarketingMetric
        fields = '__all__'

# Inventory 
class CategorySerializer(TenantSerializerMixin):
    class Meta:
        model = models.Category
        fields = '__all__'

class ProductSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Product
        fields = '__all__'
        read_only_fields = ['organisation']

class ProductVariantSerializer(TenantSerializerMixin):
    class Meta:
        model = models.ProductVariant
        fields = '__all__'

class InventorySerializer(TenantSerializerMixin):
    class Meta:
        model = models.Inventory
        fields = '__all__'

class StockMovementSerializer(TenantSerializerMixin):
    class Meta:
        model = models.StockMovement
        fields = '__all__'

class SupplierProductSerializer(TenantSerializerMixin):
    class Meta:
        model = models.SupplierProduct
        fields = '__all__'

# Accounting 
class InvoiceSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Invoice
        fields = '__all__'

class InvoiceItemSerializer(TenantSerializerMixin):
    class Meta:
        model = models.InvoiceItem
        fields = '__all__'

class PaymentSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Payment
        fields = '__all__'

class BankAccountSerializer(TenantSerializerMixin):
    class Meta:
        model = models.BankAccount
        fields = '__all__'

class RecurringInvoiceSerializer(TenantSerializerMixin):
    class Meta:
        model = models.RecurringInvoice
        fields = '__all__'

class BankTransactionSerializer(TenantSerializerMixin):
    class Meta:
        model = models.BankTransaction
        fields = '__all__'

class BankReconciliationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.BankReconciliation
        fields = '__all__'

# Quotation
class QuotationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Quotation
        fields = '__all__'

class QuotationItemSerializer(TenantSerializerMixin):
    class Meta:
        model = models.QuotationItem
        fields = '__all__'

# Purchase orders
class PurchaseOrderSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PurchaseOrder
        fields = '__all__'

class PurchaseOrderItemSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PurchaseOrderItem
        fields = '__all__'

# pos
class PosSessionSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PosSession
        fields = '__all__'

class PosSaleSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PosSale
        fields = '__all__'

class PosSaleItemSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PosSaleItem
        fields = '__all__'

# Human Resources Module
class DepartmentSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Department
        fields = '__all__'

class EmployeeSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Employee
        fields = '__all__'

class PayrollSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Payroll
        fields = '__all__'

class PayrollItemSerializer(TenantSerializerMixin):
    class Meta:
        model = models.PayrollItem
        fields = '__all__'

# AI Module
class AiConversationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AiConversation
        fields = '__all__'

class AiMessageSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AiMessage
        fields = '__all__'

class OcrDocumentSerializer(TenantSerializerMixin):
    class Meta:
        model = models.OcrDocument
        fields = '__all__'

class AiTaskSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AiTask
        fields = '__all__'

class AiRecommendationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AiRecommendation
        fields = '__all__'

class AiAutomationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AiAutomation
        fields = '__all__'

class AiNotificationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AiNotification
        fields = '__all__'

class AiAdGenerationSerializer(TenantSerializerMixin):
    class Meta:
        model = models.AiAdGeneration
        fields = '__all__'

# Support Module
class TicketSerializer(TenantSerializerMixin):
    class Meta:
        model = models.Ticket
        fields = '__all__'
