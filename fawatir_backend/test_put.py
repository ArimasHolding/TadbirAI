import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fawatir_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from api.views import OrganizationSettingViewSet
from api.models import User, Organization, OrganizationSetting

user = User.objects.first()
org = Organization.objects.filter(owner=user).first()
if not org:
    org = Organization.objects.first()

factory = APIRequestFactory()
request = factory.put('/api/company-settings/current/', {
    'nom': 'Test',
    'email': 'test@test.com',
    'pays': 'France',
    'devise': 'EUR',
    'smtp_port': None
}, content_type='application/json')
from rest_framework.test import force_authenticate
force_authenticate(request, user=user)
request.META['HTTP_X_ORGANIZATION_ID'] = str(org.id)

view = OrganizationSettingViewSet.as_view({'put': 'current'})
try:
    response = view(request)
    print("STATUS:", response.status_code)
    print("DATA:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
