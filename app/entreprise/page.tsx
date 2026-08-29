"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ImagePlus, MessageSquare, ChevronRight, CheckCircle2, Mail, Smartphone } from "lucide-react";
import { fetchAPI } from "@/lib/api";

const fieldsByCountry: Record<string, { label: string; placeholder: string }[]> = {
  Maroc: [
    { label: "Identifiant Fiscal (IF)", placeholder: "IF87654321" },
    { label: "ICE", placeholder: "002345678000091" },
    { label: "Registre de Commerce (RC)", placeholder: "RC XXXXX" },
  ],
  France: [
    { label: "SIREN", placeholder: "XXX XXX XXX" },
    { label: "SIRET", placeholder: "XXX XXX XXX XXXXX" },
    { label: "Numéro RCS", placeholder: "RCS Ville XXXXXXXXX" },
    { label: "N° TVA intracommunautaire", placeholder: "FR XX XXX XXX XXX" },
  ],
};

export default function EntreprisePage() {
  const [pays, setPays] = useState("Maroc");
  const [afficherTva, setAfficherTva] = useState(true);
  const [montantLettres, setMontantLettres] = useState(true);
  const [saved, setSaved] = useState(false);
  const fiscalFields = fieldsByCountry[pays] ?? [];

  // Integration settings
  const [settingId, setSettingId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState({
    smtp_host: "", smtp_port: 587, smtp_user: "", smtp_password: "",
    twilio_account_sid: "", twilio_auth_token: "", twilio_phone_number: ""
  });

  useEffect(() => {
    fetchAPI('api/company-settings/')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const s = data[0];
          setSettingId(s.id);
          setIntegrations({
            smtp_host: s.smtp_host || "",
            smtp_port: s.smtp_port || 587,
            smtp_user: s.smtp_user || "",
            smtp_password: s.smtp_password || "",
            twilio_account_sid: s.twilio_account_sid || "",
            twilio_auth_token: s.twilio_auth_token || "",
            twilio_phone_number: s.twilio_phone_number || "",
          });
        }
      });
  }, []);

  const handleSave = async () => {
    if (settingId) {
      await fetchAPI(`api/company-settings/${settingId}/`, {
        method: "PATCH",
        body: JSON.stringify(integrations)
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">
          Détails de l'entreprise
        </h1>
        <p className="text-[13px] text-ink-400">Informations de votre entreprise pour les factures</p>
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
          <Field label="Nom de l'entreprise" defaultValue="Tadbir AI" />
          <Field label="Adresse" defaultValue="45 Bd Mohammed V, Casablanca 20250, Maroc" />
          <Field label="Téléphone" defaultValue="+212 522 987 654" />
          <Field label="E-mail" defaultValue="contact@tadbir.ai" type="email" />
          <Field label="Site web" defaultValue="https://tadbir.ai" />
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Secteur d'activité</label>
            <select
              defaultValue="Autre"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option>Technologie & Services</option>
              <option>Commerce</option>
              <option>Construction</option>
              <option>Santé</option>
              <option>Autre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Informations fiscales et de facturation
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Pays</label>
            <select
              value={pays}
              onChange={(e) => setPays(e.target.value)}
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
          <Field label="TVA %" defaultValue="20" type="number" />
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Devise</label>
            <select className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none">
              <option>MAD - Dirham Marocain</option>
              <option>EUR - Euro</option>
              <option>USD - Dollar</option>
            </select>
          </div>
        </div>

        {fiscalFields.length > 0 && (
          <div className="grid grid-cols-1 gap-4 rounded-md border border-brass/20 bg-brass/5 p-3 sm:grid-cols-3">
            {fiscalFields.map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-[12px] text-ink-600">{f.label}</label>
                <input
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
            checked={afficherTva}
            onChange={(e) => setAfficherTva(e.target.checked)}
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
            checked={montantLettres}
            onChange={(e) => setMontantLettres(e.target.checked)}
            className="h-4 w-8 accent-brass"
          />
        </label>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Coordonnées bancaires
        </p>
        <p className="text-[12px] text-ink-400">
          Ces informations apparaîtront sur vos factures pour permettre à vos clients d'effectuer des
          paiements.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="RIB" placeholder="007 780 0001234567890123 45" />
          <Field label="IBAN" placeholder="MAXX XXXX XXXX XXXX XXXX XXXX" />
          <Field label="Code SWIFT / BIC" placeholder="XXXXXXXX" />
        </div>
      </div>

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
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Serveur SMTP (Hôte)</label>
            <input type="text" value={integrations.smtp_host} onChange={(e) => setIntegrations({...integrations, smtp_host: e.target.value})} placeholder="ex: smtp.gmail.com" className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Port SMTP</label>
            <input type="number" value={integrations.smtp_port} onChange={(e) => setIntegrations({...integrations, smtp_port: parseInt(e.target.value) || 587})} placeholder="ex: 587" className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Adresse Email (Utilisateur)</label>
            <input type="text" value={integrations.smtp_user} onChange={(e) => setIntegrations({...integrations, smtp_user: e.target.value})} placeholder="ex: contact@entreprise.com" className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Mot de Passe (ou Clé d'application)</label>
            <input type="password" value={integrations.smtp_password} onChange={(e) => setIntegrations({...integrations, smtp_password: e.target.value})} placeholder="********" className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-indigo-500 focus:outline-none" />
          </div>
        </div>
      </div>

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
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Account SID</label>
            <input type="text" value={integrations.twilio_account_sid} onChange={(e) => setIntegrations({...integrations, twilio_account_sid: e.target.value})} placeholder="ACXXXXXXXXXXXXXXXX" className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Auth Token</label>
            <input type="password" value={integrations.twilio_auth_token} onChange={(e) => setIntegrations({...integrations, twilio_auth_token: e.target.value})} placeholder="********" className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Numéro WhatsApp Twilio</label>
            <input type="text" value={integrations.twilio_phone_number} onChange={(e) => setIntegrations({...integrations, twilio_phone_number: e.target.value})} placeholder="ex: whatsapp:+123456789" className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-[13px] text-status-success font-medium animate-fade-in">
            ✓ Modifications enregistrées avec succès !
          </span>
        )}
        <button
          onClick={handleSave}
          className="rounded-md bg-ink-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] text-ink-600">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
      />
    </div>
  );
}
