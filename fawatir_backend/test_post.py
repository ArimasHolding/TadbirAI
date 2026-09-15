import os, django
import sys
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fawatir_backend.settings")
django.setup()
from api.models import Organization, QuotationItem, Client, Quotation
from django.test import RequestFactory
from api.views import QuotationViewSet
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.first()
factory = RequestFactory()
client, _ = Client.objects.get_or_create(company_name="Test", organisation=Organization.objects.first())
request = factory.post("/api/quotations/", {"client": client.id, "client_name": "Test", "quotation_number": "DEV-55556", "status": "Payée", "lignes": [{"description": "Test Product", "quantite": 5, "prix_unitaire": 100}]}, content_type="application/json")
request.user = user
setattr(request, '_dont_enforce_csrf_checks', True)
view = QuotationViewSet.as_view({"post": "create"})
response = view(request)
print("Status:", response.status_code)
if response.status_code == 201:
    print("Items Count:", QuotationItem.objects.filter(quotation_id=response.data.get("id")).count())
    print("Lignes returned:", response.data.get("lignes"))
    
    # Simulate GET
    request2 = factory.get("/api/quotations/")
    request2.user = user
    setattr(request2, '_dont_enforce_csrf_checks', True)
    view2 = QuotationViewSet.as_view({"get": "list"})
    response2 = view2(request2)
    for q in response2.data:
        if q['id'] == response.data['id']:
            print("GET Lignes returned:", q.get('lignes'))
else:
    print("Data:", response.data)
