# Software Architecture & Detailed Design Document (SAD & SDD)

**Project:** Tadbir AI (Intelligent ERP, CRM, & Invoicing System)  
**Version:** 2.5.0  
**Date:** September 2026  

---

## 1. Executive Summary

**Tadbir AI** is an enterprise-grade Resource Planning (ERP) and Customer Relationship Management (CRM) platform engineered specifically for modern Moroccan businesses and enterprises. The platform seamlessly unifies core operational modules—Accounting, Inventory Management, Human Resources & Payroll, Point of Sale (POS), and CRM—with cutting-edge Artificial Intelligence and Multi-Channel Communication.

Key advancements in Version 2.5.0 include a robust, fine-grained **Role-Based Access Control (RBAC)** security architecture, multi-tenant company data isolation, interactive team permission management, automated dual-channel document dispatches (WhatsApp API & Email), dynamic client-side event bus synchronization (`dataUpdated`), and an AI intent-parsing engine with automatic fallback to Gemini LLM models.

---

## 2. Software Architecture Design (SAD)

### 2.1 Architectural Patterns

The system is constructed on a high-performance **Decoupled Client-Server Architecture** utilizing RESTful API contracts over HTTPS:

1. **Frontend Subsystem (Presentation Layer):** A Server-Side Rendered (SSR) & Client-Side Hydrated Component Architecture built on **Next.js 14** (React) with the App Router paradigm. Uses **Zustand** for lightweight reactive global state management and **TailwindCSS** for responsive Bento-Grid design aesthetics.
2. **Security & Protection Layer:** A declarative frontend route-guard framework (`ProtectedRoute.tsx`) combined with backend token verification and permission guards. Enforces strict Role-Based Access Control (RBAC) across client routes and backend API endpoints.
3. **Backend Subsystem (Application Layer):** Follows the Model-View-Template (MVT) pattern via **Django 6.x** and **Django REST Framework (DRF)**. Manages business logic, database transactions, multi-tenancy, and RESTful routing via `rest_framework.routers.DefaultRouter`.
4. **AI & ML Subsystem (Intelligence Layer):** Operates a hybrid execution pattern: local fast-path regex/fuzzy French business intent matcher combined with asynchronous fallback calls to **Google Gemini LLM** API for complex natural language queries and OCR document extraction.
5. **Event-Driven UI Subsystem:** Utilizes a custom DOM event bus (`dataUpdated`) enabling asynchronous background tasks (such as AI chatbot entity creation or team permission updates) to trigger real-time table re-renders across open client views without page reloads.
6. **Persistence Layer:** Relational database storage powered by **PostgreSQL** in production environments (managed via Django ORM) with **SQLite3** support for isolated local development and automated CI testing.

---

### 2.2 High-Level Architecture Diagram

```mermaid
graph TD
    User["User / Client"] -->|HTTPS / Next.js Router| AuthGuard{"RBAC Guard: ProtectedRoute"}
    
    subgraph "Frontend Subsystem (Next.js 14 App Router)"
        AuthGuard -->|403 Forbidden| DeniedUI["Access Denied 403 Screen"]
        AuthGuard -->|200 Authorized| AppShell["App Shell & Views"]
        AppShell --> Store["Zustand Auth & Data Store"]
        AppShell --> EventBus["DOM Event Bus: dataUpdated"]
        AppShell --> ChatWidget["AssistantWidget AI Chat"]
    end
    
    subgraph "Railway Production Environment"
        AppShell -->|HTTPS + Bearer Token| Django["Backend: Django REST Framework API"]
        ChatWidget -->|Fallback API| Django
        
        Django -->|ORM Queries| DB[("PostgreSQL Relational DB")]
        
        subgraph "AI & Intelligence Subsystem"
            Django -->|OCR Invoice Upload| OCR["OCR Engine - Pillow / PyTesseract"]
            Django -->|Prompt Engine| LLM["Google Gemini 1.5/2.0 API"]
            Django -->|Sales Forecasting| Prophet["Facebook Prophet Forecaster"]
        end
        
        subgraph "Communication & Messaging Subsystem"
            Django -->|REST Request| Twilio["WhatsApp API / Twilio Gateway"]
            Django -->|SMTP Mail| Email["Email Dispatcher"]
        end
    end
    
    Twilio -->|WhatsApp Message| ClientPhone(("Client WhatsApp"))
    Email -->|Invoice PDF Email| ClientEmail(("Client Inbox"))

    classDef frontend fill:#1E293B,stroke:#6366F1,stroke-width:2px,color:#fff;
    classDef security fill:#881337,stroke:#F43F5E,stroke-width:2px,color:#fff;
    classDef backend fill:#064E3B,stroke:#10B981,stroke-width:2px,color:#fff;
    classDef db fill:#1E3A8A,stroke:#3B82F6,stroke-width:2px,color:#fff;
    classDef ai fill:#4338CA,stroke:#818CF8,stroke-width:2px,color:#fff;
    classDef msg fill:#701A75,stroke:#E879F9,stroke-width:2px,color:#fff;
    
    class AppShell,Store,EventBus,ChatWidget frontend;
    class AuthGuard,DeniedUI security;
    class Django backend;
    class DB db;
    class OCR,LLM,Prophet ai;
    class Twilio,Email msg;
```

---

### 2.3 Containerization & Deployment Architecture

The infrastructure is orchestrated for cloud deployment on **Railway** utilizing a monorepo setup:

- **Frontend Subsystem (Nixpacks Engine):** Deployed from repository root. Railway's Nixpacks builder detects `package.json`, installs Node.js dependencies, and executes `next build` producing a standalone SSR server.
- **Backend Subsystem (Docker Container):** Located under `fawatir_backend/Dockerfile`. Uses a light Python 3.12 Alpine container with Gunicorn WSGI server handling high-concurrency REST endpoints.
- **Root Health Check & Documentation Route:** The root backend path (`/`) dynamically redirects to Swagger OpenAPI documentation (`/api/docs/`) or returns JSON health metrics (`/health_check/`) to keep Docker and Railway health monitors active.
- **Continuous Integration (CI/CD):** GitHub Actions workflows execute automated backend test suites (`pytest` / `django.test`) and validate TypeScript compilation prior to production deployment.

---

### 2.4 Architectural Security Subsystem & Role-Based Access Control (RBAC)

Version 2.5.0 introduces a comprehensive multi-layered security architecture designed to enforce principle of least privilege, multi-tenant isolation, and route protection.

```mermaid
graph LR
    subgraph "Authentication & State Hydration"
        Login["User Login / Token Exchange"] --> LocalStorage["localStorage: access_token, user"]
        LocalStorage --> StoreHydrate["authStore.hydrate"]
        StoreHydrate --> UserState["Zustand: user, role"]
    end

    subgraph "Frontend Security Guard"
        UserState --> RouteCheck{"ProtectedRoute Evaluation"}
        RouteCheck -->|Path in PUBLIC_PATHS| AllowPublic["Render Component"]
        RouteCheck -->|Role Allowed in ROLE_ALLOWED_PATHS| AllowProtected["Render Component"]
        RouteCheck -->|Role Unauthorized| Render403["Render ShieldAlert 403 Screen"]
    end

    subgraph "Backend API Security Guard"
        AllowProtected -->|HTTP Header: Bearer Token| DRFAuth["DRF Authentication Middleware"]
        DRFAuth --> DRFPerm["IsAuthenticated & Role Class Permissions"]
        DRFPerm --> TenantFilter["Filter QuerySet by User.company_id"]
        TenantFilter --> DBExecute["Execute Database Action & Audit Log"]
    end

    classDef auth fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#fff;
    classDef guard fill:#4C1D95,stroke:#A78BFA,stroke-width:2px,color:#fff;
    classDef api fill:#064E3B,stroke:#34D399,stroke-width:2px,color:#fff;
    
    class Login,LocalStorage,StoreHydrate,UserState auth;
    class RouteCheck,AllowPublic,AllowProtected,Render403 guard;
    class DRFAuth,DRFPerm,TenantFilter,DBExecute api;
```

#### 2.4.1 Granular Role & Access Control Matrix

The system categorizes enterprise users into 6 distinct system roles with defined route allowances and operational permissions:

| System Role | Code Keys | Allowed Route Prefixes | Key Capabilities & Functional Boundaries |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `Administrateur`, `Admin` | `*` (All System Routes)<br>`/equipe`, `/parametres`, `/entreprise`, `/abonnement`, `/employes`, `/bulletins-de-paie`, `/rapprochement`, `/rapports`, `/depenses`, `/bons-de-commande`, `/pos`, `/whatsapp`, `/devis`, `/avoirs`, `/modele-facture`, `/profil` | Full operational and administrative domain control. Invites/manages team members, modifies company settings, changes subscriptions, overrides financial ledgers, and views system audit logs. |
| **Comptable** | `Comptable`, `Accountant` | `/bulletins-de-paie`, `/rapprochement`, `/rapports`, `/depenses`, `/bons-de-commande`, `/devis`, `/avoirs`, `/modele-facture`, `/profil` | Full financial & accounting management. Access to payroll ledgers, bank reconciliation, expense validation, balance sheets, tax calculations, invoice templates, and PDF generation. |
| **Commercial** | `Commercial`, `Sales` | `/pos`, `/whatsapp`, `/devis`, `/profil`, `/factures`, `/clients` | Sales, CRM, and customer dispatch operations. Creates and sends quotations/invoices, manages client directories, dispatches WhatsApp/Email communications, executes POS sales. |
| **Ressources Humaines** | `Ressources Humaines`, `HR` | `/employes`, `/bulletins-de-paie`, `/profil` | Human Resources management. Manages employee profiles, department allocations, contracts, attendance tracking, and payslip (`bulletin de paie`) calculations. |
| **Caissier** | `Caissier`, `Cashier` | `/pos`, `/profil` | Direct in-store point of sale terminal operations. Opens/closes POS sessions, scans product barcodes, processes immediate sales cash/card transactions, prints customer receipts. |
| **Lecteur** | `Lecteur`, `Employee` | `/profil`, `/depenses`, `/bons-de-commande`, `/devis`, `/avoirs` | Basic employee / read-only access. Views personal user profile, submits expense claims (`depenses`), views assigned quotes/invoices without edit permissions. |

<div class="page-break"></div>

---

## 3. Software Detailed Design (SDD)

### 3.1 Frontend Subsystem Architecture (Presentation Layer)

The frontend is structured around modular, reusable TSX components adhering to modern React practices.

- **Client Route Protection (`ProtectedRoute.tsx`):** Wraps all application routes. Intercepts navigation attempts, validates `user.role` against `ROLE_ALLOWED_PATHS`, and outputs a polished 403 Forbidden UI displaying the user's current role and target path when permission is denied.
- **Authentication Store (`lib/store/authStore.ts`):** Lightweight Zustand store providing central user state (`user`, `accessToken`, `refreshToken`, `isAuthenticated`), `login()`, `logout()`, `setRole()`, and `hydrate()` methods. Automatically synchronizes session data with `localStorage`.
- **API Fetch Interceptor (`lib/api.ts`):** Centralized HTTP utility that automatically injects `Authorization: Bearer <access_token>` into outbound requests sent to Django backend services.
- **Team Management Interface (`app/equipe/page.tsx`):** Admin dashboard component allowing real-time role delegation, team invitation creation (`handleInvite`), member account deactivation, and instant trigger of `dataUpdated` events across open tabs.
- **AI Assistant Widget (`components/AssistantWidget.tsx`):** Interactive chatbot drawer integrated into the main layout. Features natural language intent recognition, rich markdown rendering (`react-markdown`), dark mode contrast, and auto-dispatch of data synchronization events.

---

### 3.2 Backend Router & API Endpoint Specification

The backend API exposes endpoints structured under `rest_framework.routers.DefaultRouter`:

| Subsystem Module | API Route Prefix | DRF ViewSet / Views | Key Operations & Security Scope |
| :--- | :--- | :--- | :--- |
| **Foundation & Auth** | `/api/users/`<br>`/api/roles/`<br>`/api/permissions/`<br>`/api/company-settings/`<br>`/api/audit-logs/` | `UserViewSet`<br>`RoleViewSet`<br>`PermissionViewSet`<br>`CompanySettingViewSet`<br>`AuditLogViewSet` | Authentication, password management, role-permission assignments, company profile configurations, and compliance audit trail logging. |
| **CRM & Messaging** | `/api/clients/`<br>`/api/suppliers/`<br>`/api/whatsapp-messages/`<br>`/api/clients/clear/` | `ClientViewSet`<br>`SupplierViewSet`<br>`WhatsappMessageViewSet`<br>`Custom Action /clear/` | Customer & supplier management. Custom action `/send_whatsapp/` dispatches WhatsApp messages. Custom action `/clear/` purges mock records. |
| **Inventory** | `/api/categories/`<br>`/api/products/`<br>`/api/inventory/`<br>`/api/stock-movements/` | `CategoryViewSet`<br>`ProductViewSet`<br>`InventoryViewSet`<br>`StockMovementViewSet` | Cataloging, SKU generation, stock level monitoring, reorder alerts, and automated stock movement tracking. |
| **Accounting** | `/api/invoices/`<br>`/api/payments/`<br>`/api/bank-accounts/`<br>`/api/bank-reconciliations/` | `InvoiceViewSet`<br>`PaymentViewSet`<br>`BankAccountViewSet`<br>`BankReconciliationViewSet` | Invoice creation, tax calculations, payment registration, bank transaction matching (`reconciliation`), and custom `/send_email/` PDF dispatch. |
| **Quotations & Purchases**| `/api/quotations/`<br>`/api/purchase-orders/` | `QuotationViewSet`<br>`PurchaseOrderViewSet` | Pro-forma invoice / devis creation, status transitions (Draft -> Sent -> Approved -> Invoiced), supplier purchase orders. |
| **Point of Sale** | `/api/pos-sessions/`<br>`/api/pos-sales/` | `PosSessionViewSet`<br>`PosSaleViewSet` | Till session management, opening/closing balances, instant barcode sales, receipt generation. |
| **Human Resources** | `/api/employees/`<br>`/api/departments/`<br>`/api/payrolls/` | `EmployeeViewSet`<br>`DepartmentViewSet`<br>`PayrollViewSet` | Staff management, department trees, salary structures, payslip calculations (`bulletin de paie`). |
| **AI Subsystem** | `/api/ai-conversations/`<br>`/api/ocr-documents/`<br>`/api/ai-tasks/` | `AiConversationViewSet`<br>`OcrDocumentViewSet`<br>`AiTaskViewSet` | Conversational history persistence, OCR document text extraction, background AI task queue. |

---

### 3.3 Database Entity-Relationship (ER) Schema

#### 3.3.1 FOUNDATION & SECURITY MODULE

```mermaid
erDiagram
    Company {
        UUID id PK
        string name
        string legal_name
        string email
        string phone
        string website
        string address
        string city
        string tax_identifier
        string ice
        string rc
        string subscription_plan
        boolean is_active
        datetime created_at
    }
    Role {
        UUID id PK
        UUID company_id FK
        string display_name
        string system_name
        string description
        datetime created_at
    }
    Permission {
        UUID id PK
        string module
        string name
        string code
        string description
    }
    RolePermission {
        UUID id PK
        UUID role_id FK
        UUID permission_id FK
        datetime assigned_at
    }
    User {
        UUID id PK
        UUID company_id FK
        UUID role_id FK
        string first_name
        string last_name
        string email
        string password_hash
        boolean is_active
        datetime last_login
        datetime created_at
    }
    AuditLog {
        UUID id PK
        UUID company_id FK
        UUID user_id FK
        string module
        string action
        string entity
        UUID entity_id
        json old_values
        json new_values
        string ip_address
        datetime created_at
    }
    ActivityLog {
        UUID id PK
        UUID company_id FK
        UUID user_id FK
        string module
        string action
        string description
        datetime created_at
    }

    Company ||--o{ Role : defines
    Company ||--o{ User : employs
    Role ||--o{ User : assigns
    Role ||--o{ RolePermission : grants
    Permission ||--o{ RolePermission : defines
    User ||--o{ AuditLog : performs
    User ||--o{ ActivityLog : logs
```

#### 3.3.2 CRM & MESSAGING MODULE

```mermaid
erDiagram
    Client {
        UUID id PK
        UUID company_id FK
        string customer_code
        string company_name
        string contact_name
        string email
        string phone
        string tax_identifier
        string ice
        float credit_limit
        float balance
        datetime created_at
    }
    Supplier {
        UUID id PK
        UUID company_id FK
        string supplier_code
        string company_name
        string contact_name
        string email
        string phone
        datetime created_at
    }
    WhatsappMessage {
        UUID id PK
        UUID company_id FK
        UUID client_id FK
        UUID invoice_id FK
        string phone_number
        string message
        string status
        datetime sent_at
    }

    Company ||--o{ Client : owns
    Company ||--o{ Supplier : owns
    Client ||--o{ WhatsappMessage : receives
```

#### 3.3.3 INVENTORY & CATALOG MODULE

```mermaid
erDiagram
    Category {
        UUID id PK
        UUID company_id FK
        string name
        string description
    }
    Product {
        UUID id PK
        UUID company_id FK
        UUID category_id FK
        string sku
        string barcode
        string name
        float purchase_price
        float selling_price
        float tax_rate
        int minimum_stock
        boolean is_active
    }
    Inventory {
        UUID id PK
        UUID product_id FK
        int quantity
        int reserved_quantity
        int available_quantity
        int reorder_level
    }
    StockMovement {
        UUID id PK
        UUID product_id FK
        string movement_type
        int quantity
        string reason
        datetime created_at
    }

    Company ||--o{ Category : contains
    Category ||--o{ Product : classifies
    Product ||--o{ Inventory : tracks
    Product ||--o{ StockMovement : records
```

#### 3.3.4 ACCOUNTING & FINANCIAL LEDGER MODULE

```mermaid
erDiagram
    Invoice {
        UUID id PK
        UUID company_id FK
        UUID client_id FK
        string invoice_number
        date issue_date
        date due_date
        string status
        float subtotal
        float tax_amount
        float discount_amount
        float total_amount
        float balance_due
        string notes
        string terms
        datetime created_at
    }
    InvoiceItem {
        UUID id PK
        UUID invoice_id FK
        UUID product_id FK
        string description
        float quantity
        float unit_price
        float discount
        float tax_rate
        float tax_amount
        float line_total
    }
    Payment {
        UUID id PK
        UUID invoice_id FK
        UUID company_id FK
        UUID bank_account_id FK
        float amount
        datetime payment_date
        string payment_method
        string reference
    }
    BankAccount {
        UUID id PK
        UUID company_id FK
        string bank_name
        string account_number
        float current_balance
    }
    BankReconciliation {
        UUID id PK
        UUID payment_id FK
        UUID bank_account_id FK
        string status
        datetime reconciled_at
    }

    Company ||--o{ Invoice : issues
    Client ||--o{ Invoice : billed_to
    Invoice ||--o{ InvoiceItem : contains
    Invoice ||--o{ Payment : paid_by
    BankAccount ||--o{ Payment : deposits_to
    Payment ||--o{ BankReconciliation : reconciles
```

<div class="page-break"></div>

---

### 3.4 Feature Deep-Dive: RBAC Route Access Verification Flow

The sequence diagram below illustrates the operational flow when a logged-in user navigates to a protected route (e.g. `/equipe` or `/bulletins-de-paie`):

```mermaid
sequenceDiagram
    participant User as User / Browser
    participant Router as Next.js Router
    participant Guard as ProtectedRoute Component
    participant Store as authStore (Zustand)
    participant UI as Page Component / 403 Screen
    
    User->>Router: Navigate to /equipe
    Router->>Guard: Intercept Path & Mount Component
    Guard->>Store: Read state (isAuthenticated, user.role)
    
    alt Not Authenticated
        Guard-->>Router: Redirect to /login
    else Authenticated
        Guard->>Guard: Evaluate ROLE_ALLOWED_PATHS
        alt Role Allowed
            Guard-->>UI: Render Target Page Component
            UI-->>User: Display Authorized Dashboard
        else Role Not Allowed
            Guard-->>UI: Render AccessDenied 403 Component
            UI-->>User: Display ShieldAlert Access Denied UI
        end
    end
```

---

### 3.5 Feature Deep-Dive: AI Chatbot Dual-Engine & Dynamic Data Sync

```mermaid
sequenceDiagram
    participant User
    participant Widget as AssistantWidget TSX
    participant API as Next.js API /app/api/chat
    participant Gemini as Google Gemini LLM
    participant EventBus as DOM CustomEvent (dataUpdated)
    participant TableUI as Invoice / Client Table View

    User->>Widget: Types: Fais moi un client Acme SARL
    Widget->>API: POST /api/chat { prompt }
    
    API->>API: Parse regex for creation intent
    alt Local Intent Matched (Create/Update)
        API->>API: Extract entities & Create record locally
        API-->>Widget: 200 OK with success message & event
        Widget->>EventBus: dispatchEvent dataUpdated
        EventBus->>TableUI: Trigger handleUpdate listener
        TableUI->>TableUI: Re-fetch data & update UI table
    else Read/Query Intent
        API->>Gemini: Prompt Gemini API for conversational response with DB context
        alt Gemini Available
            Gemini-->>API: Return conversational text
        else Gemini Unavailable (Fallback)
            API->>API: Smart DB Parser & Fuzzy Match
            API-->>API: Generate local fallback text
        end
        API-->>Widget: 200 OK with conversational reply
    end
    
    Widget-->>User: Displays AI Response & Updates UI
```

---

### 3.6 Feature Deep-Dive: WhatsApp & Email Document Dispatch Flow

```mermaid
sequenceDiagram
    participant SalesUser as Commercial User
    participant Frontend as Next.js Frontend
    participant Backend as Django API
    participant Twilio as WhatsApp API Gateway
    participant SMTP as Email SMTP Server
    participant EndClient as End Customer

    SalesUser->>Frontend: Clicks Send via WhatsApp on Invoice
    Frontend->>Backend: POST /api/invoices/send_whatsapp/
    Backend->>Backend: Verify User Role Perms & Retrieve Invoice PDF Data
    Backend->>Twilio: HTTP POST API Request (Message SID Generation)
    Twilio->>EndClient: Deliver WhatsApp Message with PDF Link
    Backend-->>Frontend: 200 OK with dispatched status
    Frontend-->>SalesUser: Toast: Facture envoyee avec succes sur WhatsApp

    SalesUser->>Frontend: Clicks Send via Email
    Frontend->>Backend: POST /api/invoices/send_email/
    Backend->>SMTP: Send Email with PDF Attachment
    SMTP->>EndClient: Deliver Email to Client Inbox
    Backend-->>Frontend: 200 OK with email_sent status
```

---

## 4. Technology Stack & Dependencies

### 4.1 Frontend Technologies
- **Framework:** Next.js 14 (App Router), React 18, TypeScript 5
- **Styling & UI:** TailwindCSS, Lucide Icons (`lucide-react`), Bento Grid Utilities
- **State & Data Management:** Zustand 4 (`authStore.ts`), Custom DOM Event Bus (`dataUpdated`)
- **Document Rendering:** `react-markdown`, `remark-gfm` (AI response formatting)
- **Data Export Utilities:** `xlsx` (Excel export), `jspdf` / html2canvas (Print views)

### 4.2 Backend & Infrastructure Technologies
- **Core Framework:** Python 3.12, Django 6.x, Django REST Framework (DRF)
- **Database Systems:** PostgreSQL (Production on Railway), SQLite3 (Local Dev & Testing)
- **AI / Machine Learning Services:** `google-generativeai` (Gemini LLM), PyTesseract / Pillow (OCR), Facebook Prophet (Time-Series Sales Forecasting)
- **Third-Party Messaging APIs:** Twilio SDK (WhatsApp Business API), Django Core Mail (SMTP Email Dispatch)
- **Deployment & Containers:** Railway PaaS, Nixpacks Standalone Frontend Engine, Docker & Gunicorn WSGI Server

---

## 5. Security, Multi-Tenancy & Integrity

1. **Role-Based Access Control (RBAC):** Strict enforcement of authorization limits at both presentation tier (`ProtectedRoute.tsx`) and application tier (DRF ViewSet permissions).
2. **Multi-Tenant Company Segregation:** All core database entities maintain a non-nullable foreign key `company_id`. ORM querysets are automatically scoped to the user's active company, preventing cross-tenant data leakage.
3. **Audit & Activity Tracking:** Key database mutations (user invitations, role modifications, invoice cancellations, data purges) automatically record an `AuditLog` entry storing actor ID, IP address, timestamp, and pre/post JSON deltas.
4. **Token Security & Storage:** Authentication tokens (`access_token`, `refresh_token`) are handled securely with Bearer header injection via `lib/api.ts`.
5. **CORS & Environment Injection:** API calls are restricted via `django-cors-headers` to verified origin domains. Production secrets (`SECRET_KEY`, `GEMINI_API_KEY`, `TWILIO_AUTH_TOKEN`) are injected strictly through Railway runtime variables.

---

## 6. Frontend State Management & React Architecture

Tadbir AI utilizes a robust, lightweight state management architecture built on **Zustand** combined with React Context and Custom Events. This ensures real-time reactivity without the boilerplate of Redux.

### 6.1 State Management Flow

- **Zustand (`authStore.ts`)**: Manages the global authentication state, storing the JWT tokens, user profile data (email, name, role), and the active session status. It hydrates state from `localStorage` on initial load.
- **Custom DOM Event Bus (`dataUpdated`)**: Used for sibling-to-sibling communication without prop drilling. For example, when the `AssistantWidget` creates an entity via API, it dispatches the `dataUpdated` custom event. Any mounted Table views listening to this event automatically refetch their data to provide a seamless real-time experience.

---

## 7. Deployment & DevOps Architecture

The system is deployed using a decoupled, high-availability architecture via Platform-as-a-Service (PaaS).

```mermaid
graph TD
    Client["Browser / Mobile Client"] -->|HTTPS / WSS| CDN["CDN & Edge Caching"]
    
    subgraph Railway["Railway PaaS Production"]
        NextJS["Next.js SSR Container (Nixpacks)"]
        Django["Django WSGI API Container (Gunicorn)"]
        Postgres[(PostgreSQL 16)]
        
        NextJS -->|REST API Calls| Django
        Django -->|Read/Write| Postgres
    end
    
    CDN --> NextJS
    CDN --> Django
    
    subgraph External["External Cloud Services"]
        Gemini["Google Gemini API"]
        Twilio["Twilio WhatsApp API"]
        SMTP["SMTP Relay (Ethereal/Gmail)"]
    end
    
    Django -->|Inference| Gemini
    Django -->|Messaging| Twilio
    Django -->|Email| SMTP
```

- **Frontend Container**: Packaged via Nixpacks, serving statically optimized pages alongside SSR routes.
- **Backend Container**: Dockerized Django REST Framework running behind Gunicorn workers.
- **Database**: Managed PostgreSQL instance with automated daily backups.

---

## 8. Non-Functional Requirements (NFRs)

To ensure enterprise-grade reliability, Tadbir AI strictly adheres to the following Non-Functional Requirements:

### 8.1 Performance & Scalability
- **Response Time**: 95% of standard API endpoints must respond in under 200ms. AI Fallback endpoints (Gemini) must stream responses within 1.5 seconds.
- **Horizontal Scalability**: The decoupled architecture allows spinning up additional Next.js or Django containers behind a load balancer independently based on traffic spikes.

### 8.2 Security & Integrity
- **Authentication**: Stateless JWT mechanism (Access/Refresh tokens) with short lifespans.
- **Data Isolation**: Strict Row-Level Security enforcement via the `company_id` foreign key ensuring multi-tenant isolation.
- **Encryption**: Passwords hashed using Argon2/PBKDF2. Data transmitted strictly over TLS 1.3 (HTTPS).

### 8.3 Maintainability & Code Quality
- **Strong Typing**: 100% TypeScript coverage on the frontend to eliminate runtime errors.
- **Modular Django Apps**: Backend logic separated into distinct domain-driven apps (`api`, `ai`, `core`).

---
