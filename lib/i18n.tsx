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
    "common.print": "Imprimer",
    "common.export": "Exporter",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.actions": "Actions",
    "common.status": "Statut",
    "common.date": "Date",
    "common.client": "Client",
    "common.supplier": "Fournisseur",
    "common.amount": "Montant",
    "common.total_ttc": "Total TTC",
    "common.total_ht": "Total HT",
    "common.tva": "TVA",
    "common.loading": "Chargement...",
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
    "common.print": "Print",
    "common.export": "Export",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.actions": "Actions",
    "common.status": "Status",
    "common.date": "Date",
    "common.client": "Client",
    "common.supplier": "Vendor",
    "common.amount": "Amount",
    "common.total_ttc": "Total Incl. Tax",
    "common.total_ht": "Total Excl. Tax",
    "common.tva": "VAT",
    "common.loading": "Loading...",
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
    "common.print": "طباعة",
    "common.export": "تصدير",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.actions": "الإجراءات",
    "common.status": "الحالة",
    "common.date": "التاريخ",
    "common.client": "العميل",
    "common.supplier": "المورد",
    "common.amount": "المبلغ",
    "common.total_ttc": "الإجمالي شامل الضريبة",
    "common.total_ht": "الإجمالي غير شامل الضريبة",
    "common.tva": "الضريبة على القيمة المضافة",
    "common.loading": "جاري التحميل...",
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
