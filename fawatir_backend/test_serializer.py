import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fawatir_backend.settings')
django.setup()

from api.models import User, Role, Organization
from api.serializers import UserSerializer

from api.models import User, Role, Organization
from api.serializers import UserSerializer
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
import requests

org, _ = Organization.objects.get_or_create(name="Test Org")
role_admin, _ = Role.objects.get_or_create(organisation=org, display_name="Administrateur", system_name="administrateur")
role_lecteur, _ = Role.objects.get_or_create(organisation=org, display_name="Lecteur", system_name="lecteur")

from api.models import User, Role, Organization
from api.serializers import UserSerializer
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient
import json

from api.models import User, Role, Organization, Client
from api.serializers import UserSerializer
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient
import json

org, _ = Organization.objects.get_or_create(name="Test Org")
role_lecteur, _ = Role.objects.get_or_create(organisation=org, display_name="Lecteur", system_name="lecteur")

emp_user, _ = User.objects.get_or_create(email="emp2@test.com", defaults={"organisation": org, "role": role_lecteur, "is_active": True})

from api.jwt_auth import get_or_create_django_auth_user
django_emp = get_or_create_django_auth_user(emp_user)
refresh = RefreshToken.for_user(django_emp)
access_token = str(refresh.access_token)

print(f"Employee Token: {access_token}")
print(f"Employee Role: {emp_user.role.system_name}")
print(f"Is Staff: {django_emp.is_staff}")

client_test = APIClient()
client_test.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
response = client_test.post('/api/clients/', data=json.dumps({"company_name": "Test Client"}), content_type='application/json')
print(f"HTTP Status: {response.status_code}")
print(f"HTTP Response: {response.data}")

