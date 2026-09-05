"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "ar" | "en";

interface LanguageContextType {
  langue: Language;
  setLangue: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation Groups
    "nav.group.overview": "Vue d'ensemble",
    "nav.group.sales": "Ventes & Clients",
    "nav.group.purchases": "Achats & Fournisseurs",
    "nav.group.operations": "Opérations & Stocks",
    "nav.group.hr": "Ressources Humaines",
    "nav.group.system": "System & Support",

    // Navigation Items
    "nav.apercu": "Aperçu",
    "nav.rapports": "Rapports & KPIs",
    "nav.factures": "Factures",
    "nav.devis": "Devis",
    "nav.avoirs": "Avoirs",
    "nav.clients": "Clients",
    "nav.bons_commande": "Bons Cde",
    "nav.depenses": "Dépenses",
    "nav.fournisseurs": "Fournisseurs",
    "nav.stocks": "Stocks",
    "nav.pos": "Point de Vente",
    "nav.banque": "Banque",
    "nav.employes": "Employés",
    "nav.equipe": "Équipe",
    "nav.bulletins_paie": "Fiches de paie",
    "nav.parametres": "Paramètres",
    "nav.whatsapp": "WhatsApp Config",
    "nav.abonnement": "Abonnement",
    "nav.entreprise": "Mon Entreprise",
    "nav.modeles": "Modèles",
    "nav.support": "Support",

    // Topbar
    "topbar.search_placeholder": "Rechercher facture, client, devis, commande... (⌘K)",
    "topbar.system_active": "Système Actif",
    "topbar.online": "En ligne",
    "topbar.new": "Nouveau",
    "topbar.quick_invoice": "Facture Rapide",
    "topbar.scan_invoice": "Scanner Facture (+Stock)",
    "topbar.import_excel": "Importer Excel / CSV",
    "topbar.alerts": "Alertes & Notifications",
    "topbar.mark_all_read": "Tout marquer lu",
    "topbar.no_alerts": "Aucune alerte active.",
    "topbar.my_profile": "Mon Profil",
    "topbar.settings": "Paramètres",
    "topbar.logout": "Déconnexion",

    // Settings (Paramètres)
    "settings.title": "Paramètres Globaux",
    "settings.subtitle": "Personnalisez vos préférences d'application, sécurité et notifications",
    "settings.save": "Enregistrer les modifications",
    "settings.saved_toast": "Paramètres enregistrés et appliqués à toute l'application !",
    "settings.tab.general": "Général & Apparence",
    "settings.tab.notifications": "Notifications & Alertes",
    "settings.tab.security": "Sécurité & Accès",
    "settings.tab.integrations": "Raccourcis & Modules",
    "settings.theme_title": "Thème & Apparence",
    "settings.theme_mode": "Mode d'affichage (Thème)",
    "settings.theme_dark": "Mode Sombre",
    "settings.theme_light": "Mode Clair",
    "settings.theme_system": "Système",
    "settings.region_title": "Langue & Région",
    "settings.lang_label": "Langue de l'interface",
    "settings.currency_label": "Devise par défaut",
    "settings.date_format_label": "Format de Date",
    "settings.notif_title": "Préférences d'Alertes",
    "settings.email_alerts": "Alertes de Stock Bas par E-mail",
    "settings.email_alerts_desc": "Recevez un e-mail dès qu'un produit passe en dessous du seuil critique.",
    "settings.whatsapp_alerts": "Relances Factures via WhatsApp",
    "settings.whatsapp_alerts_desc": "Activer l'envoi de rappels automatiques aux clients ayant des factures en retard.",
    "settings.weekly_report": "Rapport Financier Hebdomadaire",
    "settings.weekly_report_desc": "Résumé chaque lundi matin avec le chiffre d'affaires et la trésorerie.",
    "settings.browser_notif": "Notifications dans le Navigateur",
    "settings.browser_notif_desc": "Affiche une pastille rouge en haut à droite lors d'une nouvelle notification.",
    "settings.security_title": "Sécurité de Compte",
    "settings.change_password": "Modifier le mot de passe",
    "settings.current_password": "Mot de passe actuel",
    "settings.new_password": "Nouveau mot de passe",
    "settings.two_factor": "Authentification à deux facteurs (2FA)",
    "settings.two_factor_desc": "Exiger un code de vérification SMS/Application lors de la connexion.",
    "settings.session_timeout": "Expiration automatique de la session",
    "settings.modules_title": "Accès & Intégrations Spécialisées",
    "settings.company_card": "Fiche Entreprise & Fiscalité",
    "settings.company_card_desc": "Gérez le nom, adresse, ICE, IF, RIB et paramètres d'impression des factures.",
    "settings.whatsapp_card": "WhatsApp & Twilio API",
    "settings.whatsapp_card_desc": "Configurez les comptes Twilio, les numéros d'envoi et les modèles de messages.",
    "settings.team_card": "Utilisateurs & Permissions",
    "settings.team_card_desc": "Invitez vos collaborateurs et définissez les accès (Comptable, Commercial...)",
    "settings.subscription_card": "Abonnement & Licence",
    "settings.subscription_card_desc": "Supervisez votre plan actuel, consultez vos factures d'abonnement Tadbir AI.",
    "settings.dedicated_modules": "Modules Dédiés",

    // Dashboard & Pages Headers
    "dashboard.title": "Tableau de Bord Financier",
    "dashboard.subtitle": "Aperçu en temps réel de votre trésorerie, vos ventes et prévisions AI",
    "dashboard.stat.revenue": "Chiffre d'Affaires",
    "dashboard.stat.paid": "Encaissements Réalisés",
    "dashboard.stat.pending": "En Attente de Règlement",
    "dashboard.stat.overdue": "Factures en Retard",
    "dashboard.recent_invoices": "Factures Récentes",
    "dashboard.all_invoices": "Voir toutes les factures",

    "invoices.title": "Factures de Vente",
    "invoices.subtitle": "Gérez vos factures clients, relances et états de paiement",
    "invoices.new": "Créer une Facture",
    "invoices.search_placeholder": "Rechercher par N° de facture, client...",

    "quotes.title": "Devis Clients",
    "quotes.subtitle": "Créez, envoyez et suivez la conversion de vos propositions commerciales",
    "quotes.new": "Nouveau Devis",
    "quotes.num": "N° Devis",
    "quotes.convert": "Convertir en Facture",

    "credit_notes.title": "Bons d'Avoir",
    "credit_notes.subtitle": "Gérez les retours produits, remises exceptionnelles et avoirs clients",
    "credit_notes.new": "Nouveau Bon d'Avoir",
    "credit_notes.num": "N° Avoir",

    "clients.title": "Gestion des Clients",
    "clients.subtitle": "Répertoire client, historique des achats et encours financier",
    "clients.new": "Ajouter un Client",

    "suppliers.title": "Gestion des Fournisseurs",
    "suppliers.subtitle": "Répertoire des fournisseurs, contacts et achats d'entreprise",
    "suppliers.new": "Nouveau Fournisseur",

    "expenses.title": "Dépenses & Achats",
    "expenses.subtitle": "Suivi des frais généraux, factures d'achats et justificatifs",
    "expenses.new": "Saisir une Dépense",

    "stocks.title": "Gestion des Stocks & Produits",
    "stocks.subtitle": "Catalogue produits, niveaux de stock et mouvements d'inventaire",
    "stocks.new": "Ajouter un Produit",
    "stocks.sku": "Référence / SKU",
    "stocks.stock_level": "Niveau de Stock",
    "stocks.alert_level": "Seuil d'Alerte",

    "employees.title": "Gestion du Personnel",
    "employees.subtitle": "Liste des employés, postes, contrats et fiches de paie",
    "employees.new": "Ajouter un Employé",
    "employees.job": "Poste / Fonction",
    "employees.salary": "Salaire Mensuel",

    "team.title": "Équipe & Rôles",
    "team.subtitle": "Gérez l'accès des collaborateurs et définissez leurs permissions",
    "team.invite": "Inviter un Membre",
    "team.role": "Rôle & Accès",

    "payslips.title": "Fiches de Paie & Salaires",
    "payslips.subtitle": "Générez et éditez les bulletins de salaire mensuels",
    "payslips.generate": "Générer Fiche de Paie",
    "payslips.month": "Mois / Période",

    "pos.title": "Point de Vente (POS)",
    "pos.subtitle": "Caisse enregistreuse rapide, scannage de code-barres et encaissement",
    "pos.cart": "Panier d'achat",
    "pos.checkout": "Encaisser",
    "pos.clear_cart": "Vider le Panier",

    "bank.title": "Rapprochement Bancaire",
    "bank.subtitle": "Synchronisez vos mouvements bancaires avec votre comptabilité",
    "bank.reconcile": "Rapprocher",

    "company.title": "Fiche Entreprise & Fiscalité",
    "company.subtitle": "Informations légales, coordonnées, ICE, IF, RC et RIB bancaire",
    "company.name": "Raison Sociale",
    "company.ice": "N° ICE",
    "company.if": "Identifiant Fiscal (IF)",
    "company.rc": "Registre du Commerce (RC)",
    "company.rib": "RIB Bancaire",

    "whatsapp.title": "Configuration WhatsApp API",
    "whatsapp.subtitle": "Automatisations d'envoi de factures et rappels de paiement",
    "whatsapp.send_test": "Envoyer un Test",

    "subscription.title": "Abonnement & Licence",
    "subscription.subtitle": "Gérez votre offre Tadbir AI et vos factures de service",
    "subscription.current_plan": "Plan Actuel",
    "subscription.upgrade": "Changer de Formule",

    "support.title": "Support & Assistance",
    "support.subtitle": "Besoin d'aide ? Consultez notre documentation ou contactez notre équipe",
    "support.contact": "Contacter le Support",

    "reports.title": "Rapports & KPIs Financiers",
    "reports.subtitle": "Analyses détaillées de rentabilité, trésorerie et marges",
    "reports.export_pdf": "Exporter PDF",
    "reports.export_excel": "Exporter Excel",

    "bons_commande.title": "Bons de Commande",
    "bons_commande.subtitle": "Gestion des commandes d'achat auprès de vos fournisseurs",
    "bons_commande.new": "Nouveau Bon de Commande",
    "bons_commande.num": "N° Commande",

    // Statuses
    "status.payee": "Payée",
    "status.en_attente": "En attente",
    "status.envoyee": "Envoyée",
    "status.en_retard": "En retard",
    "status.annulee": "Annulée",
    "status.refuse": "Refusé",
    "status.expire": "Expiré",
    "status.brouillon": "Brouillon",
    "status.vue": "Vue",
    "status.accepte": "Accepté",
    "status.converti": "Converti",

    // Common Actions & Headers
    "common.add": "Ajouter",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.cancel": "Annuler",
    "common.confirm": "Confirmer",
    "common.save": "Enregistrer",
    "common.print": "Imprimer",
    "common.export": "Exporter",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.all": "Tous",
    "common.actions": "Actions",
    "common.status": "Statut",
    "common.date": "Date",
    "common.client": "Client",
    "common.supplier": "Fournisseur",
    "common.amount": "Montant",
    "common.total_ttc": "Total TTC",
    "common.total_ht": "Total HT",
    "common.tva": "TVA",
    "common.phone": "Téléphone",
    "common.email": "E-mail",
    "common.address": "Adresse",
    "common.city": "Ville",
    "common.country": "Pays",
    "common.category": "Catégorie",
    "common.quantity": "Quantité",
    "common.price": "Prix Unit. HT",
    "common.total": "Total",
    "common.loading": "Chargement...",
    "common.no_results": "Aucun résultat trouvé.",
    "common.name": "Nom",
    "common.company": "Entreprise",
    "common.notes": "Notes / Remarques",

    // Modals
    "modals.add_client_title": "Nouveau Client",
    "modals.add_supplier_title": "Nouveau Fournisseur",
    "modals.add_expense_title": "Saisir une Dépense",
    "modals.add_employee_title": "Ajouter un Employé",
    "modals.add_product_title": "Ajouter un Produit",
    "modals.quick_invoice_title": "Facture Rapide",
    "modals.edit_invoice_title": "Modifier la Facture",
  },
  en: {
    // Navigation Groups
    "nav.group.overview": "Overview",
    "nav.group.sales": "Sales & Clients",
    "nav.group.purchases": "Purchases & Vendors",
    "nav.group.operations": "Operations & Inventory",
    "nav.group.hr": "Human Resources",
    "nav.group.system": "System & Support",

    // Navigation Items
    "nav.apercu": "Dashboard",
    "nav.rapports": "Reports & KPIs",
    "nav.factures": "Invoices",
    "nav.devis": "Quotes",
    "nav.avoirs": "Credit Notes",
    "nav.clients": "Clients",
    "nav.bons_commande": "Purchase Orders",
    "nav.depenses": "Expenses",
    "nav.fournisseurs": "Vendors",
    "nav.stocks": "Inventory",
    "nav.pos": "Point of Sale",
    "nav.banque": "Banking",
    "nav.employes": "Employees",
    "nav.equipe": "Team",
    "nav.bulletins_paie": "Payslips",
    "nav.parametres": "Settings",
    "nav.whatsapp": "WhatsApp Config",
    "nav.abonnement": "Subscription",
    "nav.entreprise": "My Company",
    "nav.modeles": "Templates",
    "nav.support": "Support",

    // Topbar
    "topbar.search_placeholder": "Search invoice, client, quote, order... (⌘K)",
    "topbar.system_active": "System Active",
    "topbar.online": "Online",
    "topbar.new": "New",
    "topbar.quick_invoice": "Quick Invoice",
    "topbar.scan_invoice": "Scan Invoice (+Stock)",
    "topbar.import_excel": "Import Excel / CSV",
    "topbar.alerts": "Alerts & Notifications",
    "topbar.mark_all_read": "Mark all as read",
    "topbar.no_alerts": "No active alerts.",
    "topbar.my_profile": "My Profile",
    "topbar.settings": "Settings",
    "topbar.logout": "Log Out",

    // Settings (Paramètres)
    "settings.title": "Global Settings",
    "settings.subtitle": "Customize your app preferences, security, and notifications",
    "settings.save": "Save Changes",
    "settings.saved_toast": "Settings saved and applied across the entire app!",
    "settings.tab.general": "General & Appearance",
    "settings.tab.notifications": "Notifications & Alerts",
    "settings.tab.security": "Security & Access",
    "settings.tab.integrations": "Shortcuts & Modules",
    "settings.theme_title": "Theme & Appearance",
    "settings.theme_mode": "Display Mode (Theme)",
    "settings.theme_dark": "Dark Mode",
    "settings.theme_light": "Light Mode",
    "settings.theme_system": "System",
    "settings.region_title": "Language & Region",
    "settings.lang_label": "Interface Language",
    "settings.currency_label": "Default Currency",
    "settings.date_format_label": "Date Format",
    "settings.notif_title": "Alert Preferences",
    "settings.email_alerts": "Low Stock Email Alerts",
    "settings.email_alerts_desc": "Receive an email whenever a product drops below the critical threshold.",
    "settings.whatsapp_alerts": "WhatsApp Invoice Reminders",
    "settings.whatsapp_alerts_desc": "Enable automatic payment reminders to clients with overdue invoices.",
    "settings.weekly_report": "Weekly Financial Report",
    "settings.weekly_report_desc": "Summary every Monday morning with revenue and cash flow metrics.",
    "settings.browser_notif": "Browser Notifications",
    "settings.browser_notif_desc": "Displays a badge when a new notification arrives.",
    "settings.security_title": "Account Security",
    "settings.change_password": "Change Password",
    "settings.current_password": "Current Password",
    "settings.new_password": "New Password",
    "settings.two_factor": "Two-Factor Authentication (2FA)",
    "settings.two_factor_desc": "Require an SMS or App code during sign in.",
    "settings.session_timeout": "Automatic Session Timeout",
    "settings.modules_title": "Specialized Access & Integrations",
    "settings.company_card": "Company & Tax Details",
    "settings.company_card_desc": "Manage name, address, tax IDs, bank details, and invoice print options.",
    "settings.whatsapp_card": "WhatsApp & Twilio API",
    "settings.whatsapp_card_desc": "Configure Twilio accounts, sender numbers, and message templates.",
    "settings.team_card": "Users & Permissions",
    "settings.team_card_desc": "Invite team members and define access roles (Accountant, Sales...)",
    "settings.subscription_card": "Subscription & License",
    "settings.subscription_card_desc": "Monitor your active plan and view your Tadbir AI subscription bills.",
    "settings.dedicated_modules": "Dedicated Modules",

    // Dashboard & Pages Headers
    "dashboard.title": "Financial Dashboard",
    "dashboard.subtitle": "Real-time overview of your cash flow, sales, and AI forecasts",
    "dashboard.stat.revenue": "Revenue",
    "dashboard.stat.paid": "Collected Payments",
    "dashboard.stat.pending": "Pending Payments",
    "dashboard.stat.overdue": "Overdue Invoices",
    "dashboard.recent_invoices": "Recent Invoices",
    "dashboard.all_invoices": "View all invoices",

    "invoices.title": "Sales Invoices",
    "invoices.subtitle": "Manage client invoices, reminders, and payment statuses",
    "invoices.new": "Create Invoice",
    "invoices.search_placeholder": "Search by invoice #, client...",

    "quotes.title": "Client Quotes",
    "quotes.subtitle": "Create, send, and track conversion of sales proposals",
    "quotes.new": "New Quote",
    "quotes.num": "Quote #",
    "quotes.convert": "Convert to Invoice",

    "credit_notes.title": "Credit Notes",
    "credit_notes.subtitle": "Manage product returns, special discounts, and credit memos",
    "credit_notes.new": "New Credit Note",
    "credit_notes.num": "Credit Note #",

    "clients.title": "Client Management",
    "clients.subtitle": "Client directory, purchase history, and financial balance",
    "clients.new": "Add Client",

    "suppliers.title": "Vendor Management",
    "suppliers.subtitle": "Directory of vendors, contacts, and corporate purchases",
    "suppliers.new": "New Vendor",

    "expenses.title": "Expenses & Purchases",
    "expenses.subtitle": "Track general expenses, purchase invoices, and receipts",
    "expenses.new": "Enter Expense",

    "stocks.title": "Inventory & Products",
    "stocks.subtitle": "Product catalog, stock levels, and inventory movements",
    "stocks.new": "Add Product",
    "stocks.sku": "SKU / Reference",
    "stocks.stock_level": "Stock Level",
    "stocks.alert_level": "Alert Level",

    "employees.title": "Staff Management",
    "employees.subtitle": "List of employees, roles, contracts, and payslips",
    "employees.new": "Add Employee",
    "employees.job": "Job Title / Role",
    "employees.salary": "Monthly Salary",

    "team.title": "Team & Roles",
    "team.subtitle": "Manage team access and configure their permissions",
    "team.invite": "Invite Member",
    "team.role": "Role & Access",

    "payslips.title": "Payslips & Payroll",
    "payslips.subtitle": "Generate and edit monthly salary bulletins",
    "payslips.generate": "Generate Payslip",
    "payslips.month": "Month / Period",

    "pos.title": "Point of Sale (POS)",
    "pos.subtitle": "Fast cash register, barcode scanning, and payment collection",
    "pos.cart": "Shopping Cart",
    "pos.checkout": "Checkout",
    "pos.clear_cart": "Clear Cart",

    "bank.title": "Bank Reconciliation",
    "bank.subtitle": "Synchronize bank transactions with your accounting",
    "bank.reconcile": "Reconcile",

    "company.title": "Company & Tax Profile",
    "company.subtitle": "Legal details, contact info, tax IDs, and bank info",
    "company.name": "Company Name",
    "company.ice": "ICE Tax ID",
    "company.if": "Tax ID (IF)",
    "company.rc": "Commercial Register (RC)",
    "company.rib": "Bank RIB / IBAN",

    "whatsapp.title": "WhatsApp API Configuration",
    "whatsapp.subtitle": "Automate sending invoices and payment reminders",
    "whatsapp.send_test": "Send Test Message",

    "subscription.title": "Subscription & License",
    "subscription.subtitle": "Manage your Tadbir AI plan and view billing invoices",
    "subscription.current_plan": "Current Plan",
    "subscription.upgrade": "Upgrade Plan",

    "support.title": "Support & Help",
    "support.subtitle": "Need assistance? Read our documentation or reach our team",
    "support.contact": "Contact Support",

    "reports.title": "Reports & Financial KPIs",
    "reports.subtitle": "Detailed profitability, cash flow, and margin analysis",
    "reports.export_pdf": "Export PDF",
    "reports.export_excel": "Export Excel",

    "bons_commande.title": "Purchase Orders",
    "bons_commande.subtitle": "Manage purchase orders with your suppliers",
    "bons_commande.new": "New Purchase Order",
    "bons_commande.num": "Order #",

    // Statuses
    "status.payee": "Paid",
    "status.en_attente": "Pending",
    "status.envoyee": "Sent",
    "status.en_retard": "Overdue",
    "status.annulee": "Cancelled",
    "status.refuse": "Rejected",
    "status.expire": "Expired",
    "status.brouillon": "Draft",
    "status.vue": "Viewed",
    "status.accepte": "Accepted",
    "status.converti": "Converted",

    // Common Actions & Headers
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.print": "Print",
    "common.export": "Export",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",
    "common.actions": "Actions",
    "common.status": "Status",
    "common.date": "Date",
    "common.client": "Client",
    "common.supplier": "Vendor",
    "common.amount": "Amount",
    "common.total_ttc": "Total Incl. Tax",
    "common.total_ht": "Total Excl. Tax",
    "common.tva": "VAT",
    "common.phone": "Phone",
    "common.email": "Email",
    "common.address": "Address",
    "common.city": "City",
    "common.country": "Country",
    "common.category": "Category",
    "common.quantity": "Quantity",
    "common.price": "Unit Price (Excl. Tax)",
    "common.total": "Total",
    "common.loading": "Loading...",
    "common.no_results": "No results found.",
    "common.name": "Name",
    "common.company": "Company",
    "common.notes": "Notes / Remarks",

    // Modals
    "modals.add_client_title": "New Client",
    "modals.add_supplier_title": "New Vendor",
    "modals.add_expense_title": "Enter Expense",
    "modals.add_employee_title": "Add Employee",
    "modals.add_product_title": "Add Product",
    "modals.quick_invoice_title": "Quick Invoice",
    "modals.edit_invoice_title": "Edit Invoice",
  },
  ar: {
    // Navigation Groups
    "nav.group.overview": "نظرة عامة",
    "nav.group.sales": "المبيعات والعملاء",
    "nav.group.purchases": "المشتريات والموردون",
    "nav.group.operations": "العمليات والمخزون",
    "nav.group.hr": "الموارد البشرية",
    "nav.group.system": "النظام والدعم",

    // Navigation Items
    "nav.apercu": "لوحة التحكم",
    "nav.rapports": "التقارير والمؤشرات",
    "nav.factures": "الفواتير",
    "nav.devis": "عروض الأسعار",
    "nav.avoirs": "شعارات الخصم",
    "nav.clients": "العملاء",
    "nav.bons_commande": "طلبات الشراء",
    "nav.depenses": "المصاريف",
    "nav.fournisseurs": "الموردون",
    "nav.stocks": "المخزون",
    "nav.pos": "نقطة البيع",
    "nav.banque": "البنك",
    "nav.employes": "الموظفون",
    "nav.equipe": "فريق العمل",
    "nav.bulletins_paie": "كشوف المرتبات",
    "nav.parametres": "الإعدادات",
    "nav.whatsapp": "تهيئة الواتساب",
    "nav.abonnement": "الاشتراك",
    "nav.entreprise": "شركتي",
    "nav.modeles": "النماذج",
    "nav.support": "الدعم الفني",

    // Topbar
    "topbar.search_placeholder": "بحث عن فاتورة، عميل، عرض سعر، طلب... (⌘K)",
    "topbar.system_active": "النظام نشط",
    "topbar.online": "متصل",
    "topbar.new": "جديد",
    "topbar.quick_invoice": "فاتورة سريعة",
    "topbar.scan_invoice": "مسح فاتورة ضوئياً (+المخزون)",
    "topbar.import_excel": "استيراد Excel / CSV",
    "topbar.alerts": "التنبيهات والإشعارات",
    "topbar.mark_all_read": "تحديد الكل كمقروء",
    "topbar.no_alerts": "لا توجد تنبيهات نشطة.",
    "topbar.my_profile": "ملفي الشخصي",
    "topbar.settings": "الإعدادات",
    "topbar.logout": "تسجيل الخروج",

    // Settings (Paramètres)
    "settings.title": "الإعدادات العامة",
    "settings.subtitle": "تخصيص تفضيلات التطبيق والأمان والإشعارات",
    "settings.save": "حفظ التغييرات",
    "settings.saved_toast": "تم حفظ الإعدادات وتطبيقها على جميع أجزاء التطبيق!",
    "settings.tab.general": "عام والمظهر",
    "settings.tab.notifications": "الإشعارات والتنبيهات",
    "settings.tab.security": "الأمان والوصول",
    "settings.tab.integrations": "الاختصارات والوحدات",
    "settings.theme_title": "النمط والمظهر",
    "settings.theme_mode": "وضع العرض (المظهر)",
    "settings.theme_dark": "الوضع الداكن",
    "settings.theme_light": "الوضع الفاتح",
    "settings.theme_system": "حسب النظام",
    "settings.region_title": "اللغة والمنطقة",
    "settings.lang_label": "لغة الواجهة",
    "settings.currency_label": "العملة الافتراضية",
    "settings.date_format_label": "صيغة التاريخ",
    "settings.notif_title": "تفضيلات التنبيهات",
    "settings.email_alerts": "تنبيهات انخفاض المخزون عبر البريد",
    "settings.email_alerts_desc": "استلام بريد إلكتروني فور انخفاض مخزون أي منتج عن الحد الحرج.",
    "settings.whatsapp_alerts": "تذكير الفواتير عبر الواتساب",
    "settings.whatsapp_alerts_desc": "تفعيل التذكير التلقائي للعملاء الذين لديهم فواتير متأخرة.",
    "settings.weekly_report": "التقرير المالي الأسبوعي",
    "settings.weekly_report_desc": "ملخص كل يوم إثنين يتضمن الإيرادات والسيولة النقدية.",
    "settings.browser_notif": "إشعارات المتصفح",
    "settings.browser_notif_desc": "إظهار نقطة حمراء في الأعلى عند وصول إشعار جديد.",
    "settings.security_title": "أمان الحساب",
    "settings.change_password": "تغيير كلمة المرور",
    "settings.current_password": "كلمة المرور الحالية",
    "settings.new_password": "كلمة المرور الجديدة",
    "settings.two_factor": "المصادقة الثنائية (2FA)",
    "settings.two_factor_desc": "طلب رمز التحقق عبر الرسائل أو التطبيق عند الدخول.",
    "settings.session_timeout": "إنهاء الجلسة التلقائي",
    "settings.modules_title": "الوصول والتكامل المتخصص",
    "settings.company_card": "بيانات الشركة والضرائب",
    "settings.company_card_desc": "إدارة الاسم، العنوان، الرقم الضريبي، الحساب البنكي وإعدادات طباعة الفواتير.",
    "settings.whatsapp_card": "واتساب و Twilio API",
    "settings.whatsapp_card_desc": "تهيئة حسابات Twilio، أرقام الإرسال ونماذج الرسائل.",
    "settings.team_card": "المستخدمون والصلاحيات",
    "settings.team_card_desc": "دعوة أعضاء الفريق وتحديد الصلاحيات (محاسب، مبيعات...)",
    "settings.subscription_card": "الاشتراك والترخيص",
    "settings.subscription_card_desc": "متابعة الخطة الحالية واستعراض فواتير اشتراك Tadbir AI.",
    "settings.dedicated_modules": "الوحدات المخصصة",

    // Dashboard & Pages Headers
    "dashboard.title": "لوحة التحكم المالية",
    "dashboard.subtitle": "متابعة فورية للسيولة النقدية والمبيعات والتوقعات الذكية",
    "dashboard.stat.revenue": "إجمالي المبيعات",
    "dashboard.stat.paid": "المدفوعات المحصلة",
    "dashboard.stat.pending": "في انتظار السداد",
    "dashboard.stat.overdue": "فواتير متأخرة",
    "dashboard.recent_invoices": "أحدث الفواتير",
    "dashboard.all_invoices": "عرض كل الفواتير",

    "invoices.title": "فواتير المبيعات",
    "invoices.subtitle": "إدارة فواتير العملاء وتذكير السداد والحالات",
    "invoices.new": "إنشاء فاتورة",
    "invoices.search_placeholder": "بحث برقم الفاتورة أو العميل...",

    "quotes.title": "عروض الأسعار",
    "quotes.subtitle": "إنشاء وإرسال ومتابعة تحويل العروض التجاري",
    "quotes.new": "عرض سعر جديد",
    "quotes.num": "رقم عرض السعر",
    "quotes.convert": "تحويل إلى فاتورة",

    "credit_notes.title": "شعارات الخصم",
    "credit_notes.subtitle": "إدارة المرتجعات والخصومات الخاصة وإشعارات الدائن",
    "credit_notes.new": "إشعار خصم جديد",
    "credit_notes.num": "رقم إشعار الخصم",

    "clients.title": "إدارة العملاء",
    "clients.subtitle": "دليل العملاء، سجل المشتريات والكريديت المالي",
    "clients.new": "إضافة عميل",

    "suppliers.title": "إدارة الموردين",
    "suppliers.subtitle": "دليل الموردين، جهات الاتصال ومشتريات الشركة",
    "suppliers.new": "مورد جديد",

    "expenses.title": "المصاريف والمشتريات",
    "expenses.subtitle": "متابعة المصاريف العامة، فواتير المشتريات والإيصالات",
    "expenses.new": "تسجيل مصروف",

    "stocks.title": "إدارة المخزون والمنتجات",
    "stocks.subtitle": "كتالوج المنتجات، مستويات المخزون وحركات المخزن",
    "stocks.new": "إضافة منتج",
    "stocks.sku": "الرمز المرجعي / SKU",
    "stocks.stock_level": "مستوى المخزون",
    "stocks.alert_level": "حد التنبيه",

    "employees.title": "إدارة الموظفين",
    "employees.subtitle": "قائمة الموظفين، المناصب، العقود وكشوف المرتبات",
    "employees.new": "إضافة موظف",
    "employees.job": "المنصب / الوظيفة",
    "employees.salary": "الراتب الشهري",

    "team.title": "الفريق والصلاحيات",
    "team.subtitle": "إدارة وصول أعضاء الفريق وتحديد أدوارهم",
    "team.invite": "دعوة عضو",
    "team.role": "الدور والصلاحية",

    "payslips.title": "كشوف المرتبات والأجور",
    "payslips.subtitle": "إنشاء وتعديل مسيرات الراتب الشهرية",
    "payslips.generate": "إنشاء كشف راتب",
    "payslips.month": "الشهر / الفترة",

    "pos.title": "نقطة البيع (POS)",
    "pos.subtitle": "كاشير سريع، مسح باركود وتحصيل فوري",
    "pos.cart": "سلة التسوق",
    "pos.checkout": "دفع وتحصيل",
    "pos.clear_cart": "تفريغ السلة",

    "bank.title": "التسوية البنكية",
    "bank.subtitle": "مطابقة المعاملات البنكية مع الحسابات المالية",
    "bank.reconcile": "مطابقة",

    "company.title": "بيانات الشركة والضرائب",
    "company.subtitle": "البيانات القانونية، التلفون، الرقم الضريبي والحساب البنكي",
    "company.name": "اسم الشركة",
    "company.ice": "الرقم التعريف الموحد (ICE)",
    "company.if": "المعرف الضريبي (IF)",
    "company.rc": "السجل التجاري (RC)",
    "company.rib": "الحساب البنكي (RIB)",

    "whatsapp.title": "تهيئة WhatsApp API",
    "whatsapp.subtitle": "أتمتة إرسال الفواتير وتذكيرات السداد",
    "whatsapp.send_test": "إرسال رسالة تجريبية",

    "subscription.title": "الاشتراك والترخيص",
    "subscription.subtitle": "متابعة خطة Tadbir AI واستعراض فواتير الخدمة",
    "subscription.current_plan": "الخطة الحالية",
    "subscription.upgrade": "تغيير الخطة",

    "support.title": "الدعم والمساعدة",
    "support.subtitle": "هل تحتاج مساعدة؟ اقرأ الدليل أو تواصل مع فريقنا",
    "support.contact": "التواصل مع الدعم",

    "reports.title": "التقارير والمؤشرات المالية",
    "reports.subtitle": "تحليلات تفصيلية للربحية، التدفق النقدي والهوامش",
    "reports.export_pdf": "تصدير PDF",
    "reports.export_excel": "تصدير Excel",

    "bons_commande.title": "طلبات الشراء",
    "bons_commande.subtitle": "إدارة طلبات الشراء مع الموردين",
    "bons_commande.new": "طلب شراء جديد",
    "bons_commande.num": "رقم الطلب",

    // Statuses
    "status.payee": "مدفوعة",
    "status.en_attente": "قيد الانتظار",
    "status.envoyee": "مرسلة",
    "status.en_retard": "متأخرة",
    "status.annulee": "ملغاة",
    "status.refuse": "مرفوض",
    "status.expire": "منتهي",
    "status.brouillon": "مسودة",
    "status.vue": "مشاهدة",
    "status.accepte": "مقبول",
    "status.converti": "محول",

    // Common Actions & Headers
    "common.add": "إضافة",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.cancel": "إلغاء",
    "common.confirm": "تأكيد",
    "common.save": "حفظ",
    "common.print": "طباعة",
    "common.export": "تصدير",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.all": "الكل",
    "common.actions": "الإجراءات",
    "common.status": "الحالة",
    "common.date": "التاريخ",
    "common.client": "العميل",
    "common.supplier": "المورد",
    "common.amount": "المبلغ",
    "common.total_ttc": "الإجمالي شامل الضريبة",
    "common.total_ht": "الإجمالي غير شامل الضريبة",
    "common.tva": "الضريبة على القيمة المضافة",
    "common.phone": "الهاتف",
    "common.email": "البريد الإلكتروني",
    "common.address": "العنوان",
    "common.city": "المدينة",
    "common.country": "البلد",
    "common.category": "الفئة",
    "common.quantity": "الكمية",
    "common.price": "سعر الوحدة غير شامل الضريبة",
    "common.total": "الإجمالي",
    "common.loading": "جاري التحميل...",
    "common.no_results": "لم يتم العثور على نتائج.",
    "common.name": "الاسم",
    "common.company": "الشركة",
    "common.notes": "ملاحظات / تعليقات",

    // Modals
    "modals.add_client_title": "عميل جديد",
    "modals.add_supplier_title": "مورد جديد",
    "modals.add_expense_title": "تسجيل مصروف",
    "modals.add_employee_title": "إضافة موظف",
    "modals.add_product_title": "إضافة منتج",
    "modals.quick_invoice_title": "فاتورة سريعة",
    "modals.edit_invoice_title": "تعديل الفاتورة",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  langue: "fr",
  setLangue: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [langue, setLangueState] = useState<Language>("fr");

  const syncSettings = () => {
    if (typeof window !== "undefined") {
      const saved = (localStorage.getItem("langue") as Language) || "fr";
      if (saved === "fr" || saved === "ar" || saved === "en") {
        setLangueState(saved);
        document.documentElement.lang = saved;
        document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      }
    }
  };

  useEffect(() => {
    syncSettings();
    const handleSettingsUpdated = () => syncSettings();
    window.addEventListener("settingsUpdated", handleSettingsUpdated);
    return () => window.removeEventListener("settingsUpdated", handleSettingsUpdated);
  }, []);

  const setLangue = (newLang: Language) => {
    setLangueState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("langue", newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      window.dispatchEvent(new CustomEvent("settingsUpdated"));
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[langue] || translations["fr"];
    if (dict && dict[key]) {
      return dict[key];
    }
    const fallbackDict = translations["fr"];
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ langue, setLangue, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t, langue } = useContext(LanguageContext);
  return { t, langue };
}
