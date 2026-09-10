"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ImagePlus, MessageSquare, ChevronRight, CheckCircle2, Mail, Smartphone, Save, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const fiscalFieldsByCountry: Record<string, { label: string; placeholder: string; key: string }[]> = {
  Maroc: [
    { label: "Identifiant Fiscal (IF)", placeholder: "IF87654321", key: "identifiant_fiscal" },
    { label: "ICE", placeholder: "002345678000091", key: "ice" },
    { label: "Registre de Commerce (RC)", placeholder: "RC XXXXX", key: "registre_commerce" },
  ],
  France: [
    { label: "SIREN", placeholder: "XXX XXX XXX", key: "siren" },
    { label: "SIRET", placeholder: "XXX XXX XXX XXXXX", key: "siret" },
    { label: "Numéro RCS", placeholder: "RCS Ville XXXXXXXXX", key: "rcs" },
    { label: "N° TVA intracommunautaire", placeholder: "FR XX XXX XXX XXX", key: "tva_intra" },
  ],
};

export default function EntreprisePage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // All company fields — synced to DB
  const [settings, setSettings] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    site_web: "",
    secteur: "Technologie & Services",
    pays: "Maroc",
    devise: "MAD - Dirham Marocain",
    tva_rate: "20",
    afficher_tva: true,
    montant_lettres: true,
    // Fiscal
    identifiant_fiscal: "",
    ice: "",
    registre_commerce: "",
    siren: "",
    siret: "",
    rcs: "",
    tva_intra: "",
    // Bank
    rib: "",
    iban: "",
    swift: "",
    // SMTP
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
    // Twilio
    twilio_account_sid: "",
    twilio_auth_token: "",
    twilio_phone_number: "",
  });

  // Load settings from DB on mount
  useEffect(() => {
    fetch(`/api/company-settings?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object" && !data.error) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Failed to load company settings:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const update = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/company-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const fiscalFields = fiscalFieldsByCountry[settings.pays] ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">
          {t("company.title", "Fiche Entreprise & Fiscalité")}
        </h1>
        <p className="text-[13px] text-ink-400">{t("company.subtitle", "Informations de votre entreprise pour les factures")}</p>
      </div>

      {/* WhatsApp Configuration Banner */}
      <div className="ledger-card border-emerald-500/30 bg-emerald-950/20 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white flex items-center gap-2">
                Configuration WhatsApp
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/30">
                  Prêt à l'emploi
                </span>
              </p>
              <p className="text-[12px] text-slate-300">
                Gérez votre numéro d'entreprise, testez l'envoi direct et personnalisez les modèles de factures/relances.
              </p>
            </div>
          </div>
          <Link
            href="/whatsapp"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all shrink-0 self-start sm:self-auto"
          >
            Configurer WhatsApp <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Company Identity */}
      <div className="ledger-card space-y-4">
        <div className="flex items-center gap-3">
          <label className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ink-200 text-ink-400 hover:border-brass/50 hover:text-brass">
            <ImagePlus size={16} />
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <div>
            <p className="text-[13px] font-medium text-ink-800">Logo de l'entreprise</p>
            <p className="text-[11.5px] text-ink-400">Affiché sur vos factures. JPG, PNG ou SVG. Max 5 Mo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ControlledField label="Nom de l'entreprise" value={settings.nom} onChange={(v) => update("nom", v)} placeholder="Nom de votre entreprise" />
          <ControlledField label="Adresse" value={settings.adresse} onChange={(v) => update("adresse", v)} placeholder="Adresse complète" />
          <ControlledField label="Téléphone" value={settings.telephone} onChange={(v) => update("telephone", v)} placeholder="+212 5XX XXX XXX" />
          <ControlledField label="E-mail" value={settings.email} onChange={(v) => update("email", v)} placeholder="contact@entreprise.ma" type="email" />
          <ControlledField label="Site web" value={settings.site_web} onChange={(v) => update("site_web", v)} placeholder="https://entreprise.ma" />
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Secteur d'activité</label>
            <select
              value={settings.secteur}
              onChange={(e) => update("secteur", e.target.value)}
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option>Technologie & Services</option>
              <option>Commerce</option>
              <option>Construction</option>
              <option>Santé</option>
              <option>Industrie</option>
              <option>Agriculture</option>
              <option>Transport & Logistique</option>
              <option>Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fiscal & Billing */}
      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Informations fiscales et de facturation
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Pays</label>
            <select
              value={settings.pays}
              onChange={(e) => update("pays", e.target.value)}
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option>Maroc</option>
              <option>France</option>
              <option>Belgique</option>
              <option>Allemagne</option>
              <option>Espagne</option>
              <option>Autre pays</option>
            </select>
          </div>
          <ControlledField label="TVA %" value={settings.tva_rate} onChange={(v) => update("tva_rate", v)} type="number" placeholder="20" />
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Devise</label>
            <select
              value={settings.devise}
              onChange={(e) => update("devise", e.target.value)}
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option>MAD - Dirham Marocain</option>
              <option>EUR - Euro</option>
              <option>USD - Dollar</option>
            </select>
          </div>
        </div>

        {fiscalFields.length > 0 && (
          <div className="grid grid-cols-1 gap-4 rounded-md border border-brass/20 bg-brass/5 p-3 sm:grid-cols-3">
            {fiscalFields.map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-[12px] text-ink-600">{f.label}</label>
                <input
                  value={(settings as any)[f.key] || ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-md border border-ink-200 bg-paper-card px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
          <span className="text-[13px] text-ink-700">
            Afficher la TVA sur les factures
            <span className="block text-[11.5px] text-ink-400">
              Si désactivé, la TVA sera masquée sur toutes les factures et les PDF.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.afficher_tva}
            onChange={(e) => update("afficher_tva", e.target.checked)}
            className="h-4 w-8 accent-brass"
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
          <span className="text-[13px] text-ink-700">
            Montant en lettres
            <span className="block text-[11.5px] text-ink-400">
              Affiche le total en toutes lettres sous le montant TTC.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.montant_lettres}
            onChange={(e) => update("montant_lettres", e.target.checked)}
            className="h-4 w-8 accent-brass"
          />
        </label>
      </div>

      {/* Bank Info */}
      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Coordonnées bancaires
        </p>
        <p className="text-[12px] text-ink-400">
          Ces informations apparaîtront sur vos factures pour permettre à vos clients d'effectuer des
          paiements.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ControlledField label="RIB" value={settings.rib} onChange={(v) => update("rib", v)} placeholder="007 780 0001234567890123 45" />
          <ControlledField label="IBAN" value={settings.iban} onChange={(v) => update("iban", v)} placeholder="MAXX XXXX XXXX XXXX XXXX XXXX" />
          <ControlledField label="Code SWIFT / BIC" value={settings.swift} onChange={(v) => update("swift", v)} placeholder="XXXXXXXX" />
        </div>
      </div>

      {/* SMTP Config */}
      <div className="ledger-card space-y-4">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-indigo-500" />
          <p className="text-[12px] font-medium uppercase tracking-wide text-indigo-500">
            Configuration Email (SMTP)
          </p>
        </div>
        <p className="text-[12px] text-ink-400">
          Entrez vos identifiants SMTP pour que vos reçus soient envoyés depuis votre propre adresse email.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ControlledField label="Serveur SMTP (Hôte)" value={settings.smtp_host} onChange={(v) => update("smtp_host", v)} placeholder="ex: smtp.gmail.com" />
          <ControlledField label="Port SMTP" value={String(settings.smtp_port)} onChange={(v) => update("smtp_port", parseInt(v) || 587)} placeholder="587" type="number" />
          <ControlledField label="Adresse Email (Utilisateur)" value={settings.smtp_user} onChange={(v) => update("smtp_user", v)} placeholder="contact@entreprise.com" />
          <ControlledField label="Mot de Passe (ou Clé d'application)" value={settings.smtp_password} onChange={(v) => update("smtp_password", v)} placeholder="********" type="password" />
        </div>
      </div>

      {/* Twilio/WhatsApp Config */}
      <div className="ledger-card space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-emerald-500" />
          <p className="text-[12px] font-medium uppercase tracking-wide text-emerald-500">
            Configuration WhatsApp (Twilio API)
          </p>
        </div>
        <p className="text-[12px] text-ink-400">
          Entrez vos identifiants Twilio pour que le système puisse automatiser l'envoi WhatsApp en arrière-plan.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ControlledField label="Account SID" value={settings.twilio_account_sid} onChange={(v) => update("twilio_account_sid", v)} placeholder="ACXXXXXXXXXXXXXXXX" />
          <ControlledField label="Auth Token" value={settings.twilio_auth_token} onChange={(v) => update("twilio_auth_token", v)} placeholder="********" type="password" />
          <div className="sm:col-span-2">
            <ControlledField label="Numéro WhatsApp Twilio" value={settings.twilio_phone_number} onChange={(v) => update("twilio_phone_number", v)} placeholder="ex: whatsapp:+123456789" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-[13px] text-status-success font-medium animate-fade-in flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Modifications enregistrées avec succès !
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-md bg-ink-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink-800 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function ControlledField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] text-ink-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
      />
    </div>
  );
}
