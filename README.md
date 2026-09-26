# Tadbir AI — Frontend & UI/UX

Rebuild of the Tadbir AI feature set (same 15 modules, same sidebar/IA) with a more
professional visual system. Built with Next.js (App Router) + Tailwind, per the
cahier des charges.

## Setup

```bash
npm install
npm run dev
```

## Production persistence and rollback

Production uses Django with `DATABASE_URL` (Postgres) as the only source of truth.
Set `API_URL`, `NEXT_PUBLIC_API_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`,
`CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` before deployment. Requests
fail with a visible 503 when Django is unavailable.

Deploy the backend migration before the frontend. Roll back by restoring the
previous application release; database migrations in this change are additive
only. Never roll back by deleting production data.

## Production data contract

The Django API and its `DATABASE_URL` are the production source of truth. Set
`API_URL` on the Next.js service to the Django service URL, and configure Django
with `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and
`CSRF_TRUSTED_ORIGINS`. Startup intentionally fails when the required Django
host or secret configuration is missing.

There is no JSON persistence fallback. If Django is unavailable, requests return
503 and no local copy is written. Rolling back this release means redeploying
the previous application version.

Password reset and account verification use single-use codes that expire after
10 minutes and are delivered by the backend email service.

## Railway service configuration

Environment variables must be added to the Railway service that uses them;
values in a local `.env` file or GitHub are not copied to Railway automatically.

Next.js/frontend service:

```env
API_URL=https://YOUR-DJANGO-SERVICE.up.railway.app
NEXT_PUBLIC_API_URL=https://YOUR-DJANGO-SERVICE.up.railway.app
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER=your-verified-sender@example.com
BREVO_SENDER_NAME=Tadbir AI
```

Django/backend service:

```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-long-random-secret
ALLOWED_HOSTS=YOUR-DJANGO-SERVICE.up.railway.app
CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND-SERVICE.up.railway.app
CSRF_TRUSTED_ORIGINS=https://YOUR-FRONTEND-SERVICE.up.railway.app
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER=your-verified-sender@example.com
BREVO_SENDER_NAME=Tadbir AI
```

`BREVO_SENDER` must be a sender or domain verified in Brevo. SMTP variables are
optional fallback settings; a Brevo API key is not an SMTP password.

### Environment Configuration (.env.local)
To enable Gemini AI features (Chatbot, Document OCR, Spreadsheet Analyzer), ensure both services contain:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

Open http://localhost:3000 — you'll see the Dashboard (Tableau de bord) fully built.

## What's in here

```
app/
  layout.tsx        → page shell: Sidebar + Topbar wrap every page
  globals.css        → design tokens as CSS utilities (.ledger-card, .figure, focus states)
  page.tsx            → Dashboard (Tableau de bord) — reference implementation
components/
  Sidebar.tsx         → same nav groups/order as the original: Documents / Gestion / Compte
  Topbar.tsx           → search, language, notifications, profile
  StatusChip.tsx       → status pill (payée / en attente / en retard / brouillon)
lib/
  mock-data.ts         → placeholder data shaped like what Zineb's state layer will return
tailwind.config.js     → design tokens: colors, fonts, shadows, radii
```

## Design system (apply this to every new page)

- **Colors**: `ink-900` (sidebar), `paper` (background), `brass` (single accent —
  don't add more accent colors), `status.*` (muted success/warning/danger/info,
  used only for status chips and small indicators, never as big gradients)
- **Type**: `font-display` (Fraunces) for page titles only, `font-sans` (Inter)
  for everything else, `font-mono` + `.figure` class for every money amount,
  invoice number, percentage, or count — this is what makes it read like a
  ledger instead of a marketing dashboard
- **Cards**: use the `.ledger-card` class (hairline border + brass corner tab)
  instead of the original's colored gradient tiles
- **Never** reintroduce the blue→purple→pink gradient KPI tiles from the
  original — that's the one thing we're deliberately replacing everywhere

## Roadmap — one page per Tadbir AI screen group

Build these next, in the same order as the cartography PDF, reusing Sidebar/Topbar/
StatusChip/ledger-card every time so everything stays visually consistent:

1. ✅ `app/factures/page.tsx` (liste, with statut filter tabs + search) +
   `app/factures/nouvelle/page.tsx` (create, 2-column form + live-computed résumé
   panel) + `app/factures/[id]/page.tsx` (detail, dynamic route by invoice id)
2. ✅ `app/devis/page.tsx` + `app/devis/nouveau/page.tsx` + `app/devis/[id]/page.tsx`
   — same pattern as factures, plus "Convertir en facture" action
3. ✅ `app/clients/page.tsx` (liste) + `app/clients/[id]/page.tsx` (fiche + tabs
   Factures/Devis, live stats computed from linked records) +
   `components/AddClientModal.tsx` (country-aware fiscal fields: IF/ICE/RC for
   Maroc, SIREN/SIRET/RCS/TVA for France) + "Partager le portail" share-link modal
4. ✅ `app/fournisseurs/page.tsx`
5. ✅ `app/bons-de-commande/page.tsx` (liste with progress bars) +
   `app/bons-de-commande/[id]/page.tsx` (detail with réception tracking)
6. ✅ `app/avoirs/page.tsx`, `app/depenses/page.tsx`
7. ✅ `app/rapprochement/page.tsx` — CSV drop zone + empty state
8. ✅ `app/employes/page.tsx` (liste + empty state) +
   `app/employes/nouveau/page.tsx` (CIN/CNSS block, poste, salaire, live IR
   economy preview from personnes à charge)
9. ✅ `app/bulletins-de-paie/page.tsx` — liste + generate-month modal + detail
   panel with the full CNSS/AMO/frais pro/IR breakdown (rates match the
   cartography: CNSS 4.48% plafonné à 6000 MAD, AMO 2.26%)
10. ✅ `app/stocks/page.tsx` (liste with stat cards) + `app/stocks/[id]/page.tsx`
    (fiche with variantes table) + `components/ProductForm.tsx` (shared by
    `nouveau` and `[id]/modifier`, with add/remove variantes)
11. ✅ `app/pos/page.tsx` — full flow: ouvrir session modal → product grid with
    category tabs and live search → cart (qty/remise, remise sur panier, TVA) →
    encaisser modal (exact / montant remis / monnaie à rendre) → reçu with
    imprimer/email/WhatsApp actions and "Nouvelle vente" reset
12. ✅ `app/rapports/page.tsx` — revenue trend, meilleurs clients, revenu par
    catégorie
13. ✅ `app/entreprise/page.tsx` (general/fiscal/bank info, same country-aware
    fiscal fields as the client modal) + `app/modele-facture/page.tsx`
    (numérotation per document type with live preview, accent color picker,
    6 selectable PDF templates)
14. ✅ `app/equipe/page.tsx`, `app/abonnement/page.tsx`, `app/support/page.tsx`
    (empty state + working ticket form)
15. ✅ `components/AssistantWidget.tsx` — floating chat panel on every page
    (mounted once in `app/layout.tsx`), with the same shortcuts and
    conversational flow as the original. Its replies are currently a small
    keyword-matched stand-in — Zineb will swap `fakeAssistantReply()` in that
    file for the real backend call, the UI around it doesn't need to change.

**All 15 modules from the interfaces PDF now have a working page** — every
sidebar link goes somewhere real. From here it's refinement, not new pages:
tightening spacing/edge cases, replacing remaining `lib/mock-data.ts` reads
with Zineb's real state once the backend is ready, and polish passes per page
as you review them against the original screenshots.

## Handoff note for Zineb

Every page currently imports static objects from `lib/mock-data.ts`. When you wire
up state, the field names in those objects are the contract — keep them as-is
(or tell me if the API shape differs) so swapping mock data for real state doesn't
require touching any component markup, just the data source.
