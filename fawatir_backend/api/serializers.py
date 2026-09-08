from rest_framework import serializers
from . import models

# # Foundation
# class CompanySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = models.Company
#         fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Organization
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Permission
        fields = '__all__'

class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RolePermission
        fields = '__all__'

class CompanySettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CompanySetting
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AuditLog
        fields = '__all__'

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserPreference
        fields = '__all__'

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserSession
        fields = '__all__'

class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PasswordReset
        fields = '__all__'

class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.EmailVerification
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ActivityLog
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Notification
        fields = '__all__'

class PdfTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PdfTemplate
        fields = '__all__'
# CRM 
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Client
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Supplier
        fields = '__all__'

class MarketingCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MarketingCampaign
        fields = '__all__'

class ClientContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ClientContact
        fields = '__all__'

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CustomerAddress
        fields = '__all__'

class CustomerPortalSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CustomerPortal
        fields = '__all__'

class SupplierContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SupplierContact
        fields = '__all__'

class SupplierAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SupplierAddress
        fields = '__all__'

class WhatsappMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.WhatsappMessage
        fields = '__all__'

class MarketingAdSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MarketingAd
        fields = '__all__'

class MarketingMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MarketingMetric
        fields = '__all__'

# Inventory 
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ProductVariant
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Inventory
        fields = '__all__'

class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.StockMovement
        fields = '__all__'

class SupplierProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SupplierProduct
        fields = '__all__'

# Accounting 
class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Invoice
        fields = '__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InvoiceItem
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Payment
        fields = '__all__'

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.BankAccount
        fields = '__all__'

class RecurringInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecurringInvoice
        fields = '__all__'

class BankTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.BankTransaction
        fields = '__all__'

class BankReconciliationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.BankReconciliation
        fields = '__all__'

# Quotation
class QuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Quotation
        fields = '__all__'

class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.QuotationItem
        fields = '__all__'

# Purchase orders
class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PurchaseOrder
        fields = '__all__'

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PurchaseOrderItem
        fields = '__all__'

# pos
class PosSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PosSession
        fields = '__all__'

class PosSaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PosSale
        fields = '__all__'

class PosSaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PosSaleItem
        fields = '__all__'

# Human Resources Module
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Department
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Employee
        fields = '__all__'

class PayrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Payroll
        fields = '__all__'

class PayrollItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PayrollItem
        fields = '__all__'

# AI Module
class AiConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AiConversation
        fields = '__all__'

class AiMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AiMessage
        fields = '__all__'

class OcrDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.OcrDocument
        fields = '__all__'

class AiTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AiTask
        fields = '__all__'

class AiRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AiRecommendation
        fields = '__all__'

class AiAutomationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AiAutomation
        fields = '__all__'

class AiNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AiNotification
        fields = '__all__'

class AiAdGenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AiAdGeneration
        fields = '__all__'

# Support Module
class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Ticket
        fields = '__all__'
