import os, django
import sys
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fawatir_backend.settings")
django.setup()
from django.test import Client
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.first()
client = Client()
client.force_login(user)
response = client.get("/api/quotations/")
import json
print(json.dumps(response.json(), indent=2))
