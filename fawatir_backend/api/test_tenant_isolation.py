from django.contrib.auth.models import User as DjangoUser
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from api import models


class TenantIsolationSecurityTestCase(APITestCase):
    """
    TAD-3 (Subtask C) — Tenant Security & IDOR Quality Gate Test Suite.
    Validates strict cross-tenant data isolation and anti-tampering guards
    across Sales, Financial, and HR domains.
    """

    def setUp(self):
        self.client = APIClient()

        # 1. Setup Tenant Alpha
        self.org_alpha = models.Organization.objects.create(
            name="Alpha Corp",
            email="contact@alpha.com",
            currency="MAD",
            country="Maroc"
        )
        self.django_user_alpha = DjangoUser.objects.create_user(
            username="user_alpha",
            email="alpha@corp.com",
            password="SecurePassword123!"
        )
        self.role_alpha = models.Role.objects.create(
            organisation=self.org_alpha,
            display_name="Admin",
            system_name="admin"
        )
        self.api_user_alpha = models.User.objects.create(
            organisation=self.org_alpha,
            role=self.role_alpha,
            email="alpha@corp.com"
        )

        # 2. Setup Tenant Beta
        self.org_beta = models.Organization.objects.create(
            name="Beta Industries",
            email="contact@beta.com",
            currency="EUR",
            country="France"
        )
        self.django_user_beta = DjangoUser.objects.create_user(
            username="user_beta",
            email="beta@industries.com",
            password="SecurePassword123!"
        )
        self.role_beta = models.Role.objects.create(
            organisation=self.org_beta,
            display_name="Admin",
            system_name="admin"
        )
        self.api_user_beta = models.User.objects.create(
            organisation=self.org_beta,
            role=self.role_beta,
            email="beta@industries.com"
        )

        # 3. Seed Tenant Alpha Resources
        self.client_alpha = models.Client.objects.create(
            organisation=self.org_alpha,
            company_name="Client Alpha SA",
            customer_code="CLI-ALPHA-01",
            email="client@alpha.ma"
        )
        self.product_alpha = models.Product.objects.create(
            organisation=self.org_alpha,
            name="Product Alpha",
            sku="SKU-ALPHA-100",
            selling_price=150.00
        )
        self.invoice_alpha = models.Invoice.objects.create(
            organisation=self.org_alpha,
            client=self.client_alpha,
            invoice_number="FAC-ALPHA-001",
            subtotal=150.00,
            total_amount=150.00,
            status="Validée"
        )
        self.bank_alpha = models.BankAccount.objects.create(
            organisation=self.org_alpha,
            account_name="Compte BCP Alpha",
            account_number="RIB-ALPHA-001234",
            current_balance=50000.00
        )
        self.employee_alpha = models.Employee.objects.create(
            organisation=self.org_alpha,
            first_name="Ali",
            last_name="El Mansouri",
            employee_number="EMP-ALPHA-01",
            salary=8500.00
        )

        # 4. Seed Tenant Beta Resources (Target of unauthorized access)
        self.client_beta = models.Client.objects.create(
            organisation=self.org_beta,
            company_name="Client Beta SARL",
            customer_code="CLI-BETA-01",
            email="client@beta.fr"
        )
        self.product_beta = models.Product.objects.create(
            organisation=self.org_beta,
            name="Product Beta Confidential",
            sku="SKU-BETA-999",
            selling_price=999.00
        )
        self.invoice_beta = models.Invoice.objects.create(
            organisation=self.org_beta,
            client=self.client_beta,
            invoice_number="FAC-BETA-SECRET",
            subtotal=999.00,
            total_amount=999.00,
            status="Confidentiel"
        )
        self.bank_beta = models.BankAccount.objects.create(
            organisation=self.org_beta,
            account_name="Compte Attijari Beta",
            account_number="RIB-BETA-987654",
            current_balance=1200000.00
        )
        self.employee_beta = models.Employee.objects.create(
            organisation=self.org_beta,
            first_name="Brahim",
            last_name="Berrada",
            employee_number="EMP-BETA-01",
            salary=25000.00
        )

    # -------------------------------------------------------------
    # 1. SALES & CRM TENANT ISOLATION TESTS
    # -------------------------------------------------------------
    def test_sales_isolation_invoices_list(self):
        """UserAlpha listing invoices must only see Alpha invoices, never Beta."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.get('/api/invoices/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        invoice_ids = [str(item['id']) for item in (data if isinstance(data, list) else data.get('results', []))]
        self.assertIn(str(self.invoice_alpha.id), invoice_ids)
        self.assertNotIn(str(self.invoice_beta.id), invoice_ids)

    def test_sales_isolation_clients_list(self):
        """UserAlpha listing clients must only see Alpha clients, never Beta."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.get('/api/client-contacts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        client_ids = [str(item['id']) for item in (data if isinstance(data, list) else data.get('results', []))]
        self.assertIn(str(self.client_alpha.id), client_ids)
        self.assertNotIn(str(self.client_beta.id), client_ids)

    def test_sales_isolation_products_list(self):
        """UserAlpha listing products must only see Alpha products, never Beta."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        product_ids = [str(item['id']) for item in (data if isinstance(data, list) else data.get('results', []))]
        self.assertIn(str(self.product_alpha.id), product_ids)
        self.assertNotIn(str(self.product_beta.id), product_ids)

    # -------------------------------------------------------------
    # 2. IDOR ACCESS PREVENTION TESTS (READ, UPDATE, DELETE)
    # -------------------------------------------------------------
    def test_idor_direct_get_beta_invoice_returns_404(self):
        """UserAlpha requesting OrgBeta invoice detail directly must receive 404 Not Found."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.get(f'/api/invoices/{self.invoice_beta.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_idor_tampering_update_beta_invoice_returns_404(self):
        """UserAlpha attempting to PATCH OrgBeta invoice must receive 404 and not mutate DB."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.patch(
            f'/api/invoices/{self.invoice_beta.id}/',
            {'total_amount': 1.00, 'status': 'Compromised'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Verify DB remained untouched
        self.invoice_beta.refresh_from_db()
        self.assertEqual(self.invoice_beta.total_amount, 999.00)
        self.assertEqual(self.invoice_beta.status, 'Confidentiel')

    def test_idor_tampering_delete_beta_invoice_returns_404(self):
        """UserAlpha attempting to DELETE OrgBeta invoice must receive 404 and not delete."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.delete(f'/api/invoices/{self.invoice_beta.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Verify object still exists in DB
        self.assertTrue(models.Invoice.objects.filter(id=self.invoice_beta.id).exists())

    # -------------------------------------------------------------
    # 3. FINANCIAL TENANT ISOLATION TESTS
    # -------------------------------------------------------------
    def test_financial_isolation_bank_accounts(self):
        """UserAlpha must only see Alpha bank accounts, Beta accounts must return 404."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.get('/api/bank-accounts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        bank_ids = [str(item['id']) for item in (data if isinstance(data, list) else data.get('results', []))]
        self.assertIn(str(self.bank_alpha.id), bank_ids)
        self.assertNotIn(str(self.bank_beta.id), bank_ids)

        # Direct access to Beta bank account
        detail_res = self.client.get(f'/api/bank-accounts/{self.bank_beta.id}/')
        self.assertEqual(detail_res.status_code, status.HTTP_404_NOT_FOUND)

    # -------------------------------------------------------------
    # 4. HR TENANT ISOLATION TESTS
    # -------------------------------------------------------------
    def test_hr_isolation_employees(self):
        """UserAlpha must only see Alpha employees, Beta employee records must return 404."""
        self.client.force_authenticate(user=self.django_user_alpha)
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        emp_ids = [str(item['id']) for item in (data if isinstance(data, list) else data.get('results', []))]
        self.assertIn(str(self.employee_alpha.id), emp_ids)
        self.assertNotIn(str(self.employee_beta.id), emp_ids)

        # Direct access to Beta employee
        detail_res = self.client.get(f'/api/employees/{self.employee_beta.id}/')
        self.assertEqual(detail_res.status_code, status.HTTP_404_NOT_FOUND)

    # -------------------------------------------------------------
    # 5. IDOR PAYLOAD TAMPERING PREVENTION (POST INJECTION TEST)
    # -------------------------------------------------------------
    def test_idor_payload_tampering_injection_neutralized(self):
        """
        If UserAlpha attempts to create an invoice with payload 'organisation: OrgBeta',
        the server must ignore the injected tenant and assign OrgAlpha.
        """
        self.client.force_authenticate(user=self.django_user_alpha)
        payload = {
            'organisation': str(self.org_beta.id),  # Injected IDOR payload
            'client': str(self.client_alpha.id),
            'invoice_number': 'FAC-ALPHA-TAMPER-TEST',
            'subtotal': 500.00,
            'total_amount': 500.00,
            'status': 'Brouillon'
        }
        response = self.client.post('/api/invoices/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_invoice_id = response.json()['id']
        created_invoice = models.Invoice.objects.get(id=created_invoice_id)

        # Firmly verify that the invoice belongs to OrgAlpha and NOT OrgBeta
        self.assertEqual(created_invoice.organisation_id, self.org_alpha.id)
        self.assertNotEqual(created_invoice.organisation_id, self.org_beta.id)
