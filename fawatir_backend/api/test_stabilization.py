from django.test import TestCase
from rest_framework import status


class AuthenticationHardeningTests(TestCase):
    def test_direct_password_reset_is_not_available(self):
        response = self.client.post(
            '/api/auth/reset-password/',
            {'email': 'victim@example.com', 'new_password': 'not-authorized'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, status.HTTP_501_NOT_IMPLEMENTED)
        self.assertEqual(response.json()['code'], 'PASSWORD_RESET_TOKEN_REQUIRED')


class AiAccessControlTests(TestCase):
    def test_document_collection_rejects_anonymous_access(self):
        response = self.client.get('/api/ai/documents/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_spreadsheet_collection_rejects_anonymous_access(self):
        response = self.client.get('/api/ai/spreadsheets/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
