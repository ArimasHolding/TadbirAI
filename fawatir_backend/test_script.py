import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fawatir_backend.settings')
django.setup()

from api.models import *
from api.serializers import QuotationSerializer

q = Quotation.objects.last()
print(f"Quotation ID: {q.id}")
print(f"Items count from DB: {q.items.count()}")

serializer = QuotationSerializer(q)
print("Serializer lignes:")
print(serializer.data.get('lignes'))
