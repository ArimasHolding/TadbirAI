"""
TAD-3 (Subtask C) — Tenant Security & IDOR Quality Gate
Skeleton des tests de securite cross-organization.

STATUT : squelette en attente. Le champ `organization` n'existe pas encore
sur les modeles (depend de TAD-2 - Omar). Des que le modele Organization
est disponible, remplacer les TODO ci-dessous.

Comment l'utiliser :
1. Copier ce fichier dans fawatir_backend/api/tests_security.py (ou l'integrer
   a tests.py existant)
2. Une fois qu'Omar publie le modele Organization, completer BaseSecurityTestSetup
3. Au fur et a mesure que Mohammed / FatimaZahra filtrent une ressource, activer
   (decommenter / remplir) le bloc de test correspondant dans la checklist
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Company, Role, User, Client, Invoice  # + imports a completer


class BaseSecurityTestSetup(TestCase):
    """
    Cree DEUX organisations independantes, chacune avec sa propre Company,
    son propre User et ses propres donnees. Toute la suite de securite
    reutilise ce setup pour verifier l'etancheite entre les deux.

    TODO (des qu'Omar a publie le modele Organization) :
        - remplacer/completer avec Organization.objects.create(...)
        - lier company_a / company_b a leurs organizations respectives
        - lier user_a / user_b via le bon champ (organization_id ? company.organization ?)
    """

    def setUp(self):
        # --- Organisation A ---
        self.company_a = Company.objects.create(name="Org A - Company")
        self.role_a = Role.objects.create(company=self.company_a, display_name="Admin")
        self.user_a = User.objects.create(
            company=self.company_a, role=self.role_a, email="usera@org-a.test"
        )
        self.client_a_api = APIClient()
        # TODO: authentifier self.client_a_api en tant que self.user_a (JWT/session)

        # --- Organisation B ---
        self.company_b = Company.objects.create(name="Org B - Company")
        self.role_b = Role.objects.create(company=self.company_b, display_name="Admin")
        self.user_b = User.objects.create(
            company=self.company_b, role=self.role_b, email="userb@org-b.test"
        )
        self.client_b_api = APIClient()
        # TODO: authentifier self.client_b_api en tant que self.user_b

        # Donnee de test appartenant a l'Org A (a dupliquer par ressource)
        self.client_obj_a = Client.objects.create(
            company=self.company_a, company_name="Client confidentiel Org A"
        )
        self.invoice_a = Invoice.objects.create(
            company=self.company_a, client=self.client_obj_a
            # completer les champs obligatoires reels du modele
        )


class ClientCrossOrgSecurityTests(BaseSecurityTestSetup):
    """Gabarit a copier/adapter pour CHAQUE ressource de la checklist."""

    def test_list_excludes_other_organization(self):
        """User Org B ne doit voir aucun client de l'Org A dans la liste."""
        response = self.client_b_api.get("/api/clients/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [item["id"] for item in response.data.get("results", response.data)]
        self.assertNotIn(self.client_obj_a.id, returned_ids)

    def test_detail_idor_blocked(self):
        """User Org B qui appelle l'ID direct d'un client Org A doit etre bloque."""
        response = self.client_b_api.get(f"/api/clients/{self.client_obj_a.id}/")
        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_update_idor_blocked(self):
        """User Org B ne doit pas pouvoir modifier un client Org A via son ID."""
        response = self.client_b_api.patch(
            f"/api/clients/{self.client_obj_a.id}/",
            {"company_name": "Hacked"},
            format="json",
        )
        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_delete_idor_blocked(self):
        """User Org B ne doit pas pouvoir supprimer un client Org A via son ID."""
        response = self.client_b_api.delete(f"/api/clients/{self.client_obj_a.id}/")
        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )


# TODO : dupliquer le pattern ci-dessus pour chaque ressource de la checklist
# (voir TAD-3C-checklist.md), par exemple :
#
# class InvoiceCrossOrgSecurityTests(BaseSecurityTestSetup):
#     ...
#
# class EmployeeCrossOrgSecurityTests(BaseSecurityTestSetup):
#     ...
#
# class PayrollCrossOrgSecurityTests(BaseSecurityTestSetup):
#     ...