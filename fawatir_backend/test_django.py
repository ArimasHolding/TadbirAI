import json
from api.serializers import QuotationSerializer

data = {
    "quotation_number": "DEV-9999",
    "numero": "DEV-9999",
    "client": "550e8400-e29b-41d4-a716-446655440000",
    "client_name": "Test",
    "status": "Brouillon",
    "statut": "Brouillon",
    "total_amount": 100,
    "montant": 100,
    "date": "2024-01-01",
    "validiteJusquau": "2024-02-01",
    "lignes": []
}

serializer = QuotationSerializer(data=data)
if not serializer.is_valid():
    print("VALIDATION ERROR:", serializer.errors)
else:
    print("VALID!")
