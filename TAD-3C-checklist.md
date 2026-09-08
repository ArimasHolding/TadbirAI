# TAD-3 (Subtask C) — Tenant Security & IDOR Quality Gate
### Checklist — Oumaima

Objectif : vérifier qu'un user de l'Organization A ne peut **jamais** lire, modifier
ou supprimer une donnée appartenant à l'Organization B (peu importe si via la liste,
via l'ID direct, ou via une action custom type `/clear`, `/send_email`, etc.).

Statut actuel du code (vérifié le 08/09/2026) : **aucun filtrage n'existe**, même
au niveau `Company` — tous les ViewSets font `queryset = Model.objects.all()`.
=> tant que Mohammed / FatimaZahra n'ont pas ajouté le filtrage `organization_id`,
ces tests vont échouer (normal, ils documentent le problème en attendant).

Légende : ⬜ pas commencé · 🟡 skeleton écrit (TODO) · ✅ testé et passant

---

## 🔵 Bloc Mohammed (TAD-3 A — Sales & Inventory)
- ⬜ Client — list + detail + create + update + delete
- ⬜ ClientContact / CustomerAddress
- ⬜ Supplier — list + detail + create + update + delete
- ⬜ SupplierContact / SupplierAddress
- ⬜ Category
- ⬜ Product / ProductVariant
- ⬜ Inventory / StockMovement
- ⬜ SupplierProduct
- ⬜ Invoice — list + detail + create + update + delete
- ⬜ InvoiceItem
- ⬜ Quotation / QuotationItem
- ⬜ PurchaseOrder / PurchaseOrderItem
- ⬜ PosSession / PosSale / PosSaleItem
- ⬜ Action custom : `/api/<resource>/clear/`
- ⬜ Action custom : `/api/invoices/<id>/send_email/`, `/send_whatsapp/`

## 🟣 Bloc FatimaZahra (TAD-3 B — HR & Financial)
- ⬜ Employee
- ⬜ Department
- ⬜ Payroll / PayrollItem
- ⬜ BankAccount
- ⬜ Payment
- ⬜ BankTransaction / BankReconciliation
- ⬜ RecurringInvoice
- ⬜ (dépenses / expenses — vérifier le nom exact du modèle une fois ajouté)

## ⚙️ Bloc transverse (déjà existant, à vérifier aussi)
- ⬜ Company / CompanySetting
- ⬜ Role / Permission / RolePermission (déjà protégé par `IsAdminRoleOnly`,
  à re-tester avec l'organization en plus)
- ⬜ User
- ⬜ AuditLog / ActivityLog / Notification
- ⬜ WhatsappMessage / MarketingCampaign / MarketingAd / MarketingMetric

---

## Pour chaque ressource, 3 tests minimum
1. **List** : user Org A ne voit QUE les objets Org A dans `GET /api/<resource>/`
2. **Detail (IDOR)** : user Org A qui appelle `GET /api/<resource>/<id_org_B>/`
   reçoit 403/404, jamais 200
3. **Write (IDOR)** : idem sur `PUT` / `PATCH` / `DELETE` avec un ID Org B

## Prochaine étape
- [ ] Récupérer le nom exact du champ (`organization` ? `organization_id` ?)
      dès qu'Omar publie le modèle
- [ ] Adapter `BaseSecurityTestSetup` dans le skeleton avec le vrai champ
- [ ] Compléter au fur et à mesure que Mohammed / FatimaZahra ajoutent le filtrage