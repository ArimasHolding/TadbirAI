from django.contrib.auth.hashers import check_password, make_password
from django.core import mail
from django.test import TestCase, override_settings
from rest_framework import status
from unittest.mock import patch
from api import models


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AuthenticationHardeningTests(TestCase):
    def setUp(self):
        self.org = models.Organization.objects.create(name='Secure Corp')
        self.role = models.Role.objects.create(
            organisation=self.org,
            display_name='Administrateur',
            system_name='admin',
        )

    @patch('api.jwt_auth._security_code', return_value='123456')
    def test_invited_account_activates_only_after_server_code(self, _mock_code):
        user = models.User.objects.create(
            organisation=self.org,
            role=self.role,
            email='invite@example.com',
            password_hash='INVITED',
            is_active=False,
            email_verified=False,
        )

        requested = self.client.post(
            '/api/auth/register/',
            {'email': user.email, 'action': 'request'},
            content_type='application/json',
        )
        self.assertEqual(requested.status_code, status.HTTP_202_ACCEPTED)
        user.refresh_from_db()
        self.assertFalse(user.is_active)
        self.assertFalse(user.email_verified)
        self.assertNotIn('123456', requested.content.decode())
        self.assertEqual(len(mail.outbox), 1)

        rejected = self.client.post(
            '/api/auth/register/',
            {'email': user.email, 'action': 'verify', 'code': '000000', 'password': 'SecurePassword123!', 'nom': 'Invited User'},
            content_type='application/json',
        )
        self.assertEqual(rejected.status_code, status.HTTP_400_BAD_REQUEST)

        verified = self.client.post(
            '/api/auth/register/',
            {'email': user.email, 'action': 'verify', 'code': '123456', 'password': 'SecurePassword123!', 'nom': 'Invited User'},
            content_type='application/json',
        )
        self.assertEqual(verified.status_code, status.HTTP_200_OK)
        self.assertIn('access', verified.json())
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verified)

    @patch('api.jwt_auth._security_code', return_value='654321')
    def test_password_reset_requires_unexpired_server_code(self, _mock_code):
        user = models.User.objects.create(
            organisation=self.org,
            role=self.role,
            email='active@example.com',
            password_hash=make_password('OldPassword123!'),
            is_active=True,
            email_verified=True,
        )

        response = self.client.post(
            '/api/auth/reset-password/',
            {'email': user.email, 'action': 'request'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('654321', response.content.decode())

        invalid = self.client.post(
            '/api/auth/reset-password/',
            {'email': user.email, 'action': 'confirm', 'code': '000000', 'newPassword': 'NewPassword123!'},
            content_type='application/json',
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)

        confirmed = self.client.post(
            '/api/auth/reset-password/',
            {'email': user.email, 'action': 'confirm', 'code': '654321', 'newPassword': 'NewPassword123!'},
            content_type='application/json',
        )
        self.assertEqual(confirmed.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(check_password('NewPassword123!', user.password_hash))

        replay = self.client.post(
            '/api/auth/reset-password/',
            {'email': user.email, 'action': 'confirm', 'code': '654321', 'newPassword': 'AnotherPassword123!'},
            content_type='application/json',
        )
        self.assertEqual(replay.status_code, status.HTTP_400_BAD_REQUEST)


class AiAccessControlTests(TestCase):
    def test_document_collection_rejects_anonymous_access(self):
        response = self.client.get('/api/ai/documents/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_spreadsheet_collection_rejects_anonymous_access(self):
        response = self.client.get('/api/ai/spreadsheets/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
