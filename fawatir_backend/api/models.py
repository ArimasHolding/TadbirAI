from decimal import Decimal
import uuid
from django.db import models


def gen_uuid():
  return str(uuid.uuid4())


# ==========================================
# FOUNDATION MODULE
# ==========================================


class Organization(models.Model):
  id = models.BigAutoField(primary_key=True)
  name = models.CharField(max_length=255, default="")

  def __str__(self):
    return self.name


class Role(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  display_name = models.CharField(max_length=255, default="Role")

  def __str__(self):
    return self.display_name


class Permission(models.Model):
  module = models.CharField(max_length=100, unique=True, default=gen_uuid)
  name = models.CharField(max_length=255, unique=True, default=gen_uuid)
  code = models.CharField(max_length=100, unique=True, default=gen_uuid)


class RolePermission(models.Model):
  role = models.ForeignKey(Role, on_delete=models.CASCADE)
  permission = models.ForeignKey(Permission, on_delete=models.CASCADE)


class User(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  role = models.ForeignKey(
      Role, on_delete=models.SET_NULL, null=True, blank=True
  )
  email = models.EmailField(unique=True, default=gen_uuid)

  def __str__(self):
    return self.email


class OrganizationSetting(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, default=1
  )
  key = models.CharField(max_length=100, default="")
  value = models.TextField(default="")


class AuditLog(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  user = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )
  module = models.CharField(max_length=100, default="")
  action = models.CharField(max_length=100, default="")
  entity = models.CharField(max_length=100, default="")


class UserPreference(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  key = models.CharField(max_length=100, default="general")
  value = models.TextField(default="", blank=True)


class UserSession(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  session_key = models.CharField(max_length=255, default="")


class PasswordReset(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  token = models.CharField(max_length=255, default=gen_uuid)


class EmailVerification(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  token = models.CharField(max_length=255, default=gen_uuid, editable=False)


class ActivityLog(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  user = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )
  description = models.TextField(default="")


class Notification(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  title = models.CharField(max_length=255, default="Notification")
  notification_type = models.CharField(max_length=100, default="general")
  is_read = models.BooleanField(default=False)


class PdfTemplate(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  name = models.CharField(max_length=255, default="Standard Template")


# ==========================================
# CLIENT & SUPPLIER MODULE
# ==========================================


class Client(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  company_name = models.CharField(max_length=255, default="")
  email = models.EmailField(null=True, blank=True)
  customer_code = models.CharField(
      max_length=100, unique=True, null=True, blank=True
  )
  balance = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )

  def __str__(self):
    return self.company_name


class ClientContact(models.Model):
  client = models.ForeignKey(Client, on_delete=models.CASCADE)
  first_name = models.CharField(max_length=255, default="")
  last_name = models.CharField(max_length=255, default="")
  email = models.EmailField(null=True, blank=True)
  is_primary = models.BooleanField(default=False)


class CustomerAddress(models.Model):
  client = models.ForeignKey(Client, on_delete=models.CASCADE)
  address_type = models.CharField(max_length=50, default="")
  city = models.CharField(max_length=100, default="")
  country = models.CharField(max_length=100, default="")


class CustomerPortal(models.Model):
  client = models.ForeignKey(Client, on_delete=models.CASCADE)


class Supplier(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  company_name = models.CharField(max_length=255, default="Unknown Supplier")
  supplier_code = models.CharField(
      max_length=100, unique=True, null=True, blank=True
  )

  def __str__(self):
    return self.company_name


class SupplierContact(models.Model):
  supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
  first_name = models.CharField(max_length=100, default="")
  last_name = models.CharField(max_length=100, default="")


class SupplierAddress(models.Model):
  supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
  address_type = models.CharField(max_length=50, default="main")
  city = models.CharField(max_length=100, default="")


class WhatsappMessage(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  message = models.TextField(default="")


class MarketingCampaign(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  created_by = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )
  campaign_name = models.CharField(max_length=255, default="")
  platform = models.CharField(max_length=100, null=True, blank=True)
  budget = models.DecimalField(
      max_digits=12, decimal_places=2, null=True, blank=True
  )


class MarketingAd(models.Model):
  campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE)
  title = models.CharField(max_length=255, default="Untitled Ad")
  generated_by_ai = models.BooleanField(default=False)


class MarketingMetric(models.Model):
  ad = models.ForeignKey(MarketingAd, on_delete=models.CASCADE)
  impressions = models.IntegerField(default=0)
  clicks = models.IntegerField(default=0)
  conversions = models.IntegerField(default=0)


# ==========================================
# INVENTORY & PRODUCTS MODULE
# ==========================================


class Category(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  name = models.CharField(max_length=255, default="")

  def __str__(self):
    return self.name


class Product(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  category = models.ForeignKey(
      Category, on_delete=models.SET_NULL, null=True, blank=True
  )
  name = models.CharField(max_length=255, default="")
  sku = models.CharField(max_length=100, unique=True, null=True, blank=True)
  purchase_price = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  selling_price = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  is_active = models.BooleanField(default=True)

  def __str__(self):
    return self.name


class ProductVariant(models.Model):
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  sku = models.CharField(max_length=100, default=gen_uuid)
  variant_name = models.CharField(max_length=255, default="Standard")
  selling_price = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class Inventory(models.Model):
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  quantity = models.IntegerField(default=0)
  available_quantity = models.IntegerField(default=0)
  reorder_level = models.IntegerField(default=0)


class StockMovement(models.Model):
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  movement_type = models.CharField(max_length=50, default="adjustment")
  quantity = models.IntegerField(default=0)
  previous_quantity = models.IntegerField(default=0)
  new_quantity = models.IntegerField(default=0)
  created_by = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )


class SupplierProduct(models.Model):
  supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  purchase_price = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  preferred_supplier = models.BooleanField(default=False)


# ==========================================
# INVOICING & POS MODULE
# ==========================================


class Invoice(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  client = models.ForeignKey(
      Client, on_delete=models.CASCADE, null=True, blank=True
  )
  invoice_number = models.CharField(
      max_length=100, unique=True, default=gen_uuid
  )
  subtotal = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  tax_amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  total_amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  balance_due = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  created_by = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )

  def __str__(self):
    return self.invoice_number


class InvoiceItem(models.Model):
  invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  quantity = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("1.00")
  )
  unit_price = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  line_total = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class BankAccount(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  bank_name = models.CharField(max_length=255, default="")
  account_number = models.CharField(max_length=100, null=True, blank=True)
  current_balance = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  is_active = models.BooleanField(default=True)


class Payment(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
  amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  payment_method = models.CharField(max_length=100, null=True, blank=True)
  created_by = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )


class RecurringInvoice(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  client = models.ForeignKey(Client, on_delete=models.CASCADE)
  frequency = models.CharField(max_length=50, default="monthly")


class BankTransaction(models.Model):
  bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE)
  amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  transaction_type = models.CharField(max_length=50, default="")


class BankReconciliation(models.Model):
  bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE)


class Quotation(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  client = models.ForeignKey(
      Client, on_delete=models.CASCADE, null=True, blank=True
  )
  quotation_number = models.CharField(
      max_length=100, unique=True, default=gen_uuid
  )
  total_amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class QuotationItem(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  quantity = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("1.00")
  )
  unit_price = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  line_total = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class PurchaseOrder(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  supplier = models.ForeignKey(
      Supplier, on_delete=models.CASCADE, null=True, blank=True
  )
  purchase_order_number = models.CharField(
      max_length=100, unique=True, default=gen_uuid
  )
  total_amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class PurchaseOrderItem(models.Model):
  purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE)
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  quantity = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("1.00")
  )
  unit_cost = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  line_total = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class PosSession(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  session_number = models.CharField(max_length=100, null=True, blank=True)
  status = models.CharField(max_length=50, default="open")
  created_by = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )


class PosSale(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  session = models.ForeignKey(
      PosSession, on_delete=models.CASCADE, null=True, blank=True
  )
  sale_number = models.CharField(max_length=100, null=True, blank=True)
  total_amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  created_by = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )


class PosSaleItem(models.Model):
  sale = models.ForeignKey(PosSale, on_delete=models.CASCADE)
  product = models.ForeignKey(Product, on_delete=models.CASCADE)
  quantity = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("1.00")
  )
  unit_price = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )
  line_total = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


# ==========================================
# HR & SUPPORT MODULE
# ==========================================


class Department(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  name = models.CharField(max_length=255, default="")


class Employee(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  department = models.ForeignKey(
      Department, on_delete=models.SET_NULL, null=True, blank=True
  )
  first_name = models.CharField(max_length=255, default="")
  last_name = models.CharField(max_length=255, default="")
  employee_number = models.CharField(
      max_length=100, unique=True, default=gen_uuid
  )
  salary = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class Payroll(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
  payroll_number = models.CharField(max_length=100, null=True, blank=True)
  net_salary = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class PayrollItem(models.Model):
  payroll = models.ForeignKey(Payroll, on_delete=models.CASCADE)
  item_name = models.CharField(max_length=255, default="Base Salary")
  item_type = models.CharField(max_length=50, default="earning")
  amount = models.DecimalField(
      max_digits=12, decimal_places=2, default=Decimal("0.00")
  )


class Ticket(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )
  client = models.ForeignKey(
      Client, on_delete=models.CASCADE, null=True, blank=True
  )
  assigned_to = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, blank=True
  )
  ticket_number = models.CharField(max_length=100, unique=True)
  subject = models.CharField(max_length=255, default="")
  priority = models.CharField(max_length=50, default="normal")
  status = models.CharField(max_length=50, default="open")


# ==========================================
# AI MODULE STUBS
# ==========================================


class AiConversation(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )


class AiMessage(models.Model):
  conversation = models.ForeignKey(AiConversation, on_delete=models.CASCADE)


class OcrDocument(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )


class AiTask(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )


class AiRecommendation(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )


class AiAutomation(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )


class AiNotification(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )


class AiAdGeneration(models.Model):
  organisation = models.ForeignKey(
      Organization, on_delete=models.CASCADE, null=True, blank=True
  )