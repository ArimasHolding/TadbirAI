"use client";

import { useState, useEffect } from "react";
import { Check, CheckCircle2, Palette, FileText, Layout, Hash } from "lucide-react";

const accentColors = [
  { hex: "#2C4A7C", name: "Bleu Marine" },
  { hex: "#1F8A5F", name: "Vert Émeraude" },
  { hex: "#B8452F", name: "Terracotta" },
  { hex: "#6B4FA0", name: "Violet Royal" },
  { hex: "#B8863B", name: "Doré Luxe" },
  { hex: "#242835", name: "Anthracite" },
  { hex: "#B03B6A", name: "Rose Pourpre" }
];

const templates = [
  { id: "classique", nom: "Classique", desc: "Design épuré avec en-tête structuré et couleurs d'accent." },
  { id: "moderne", nom: "Moderne", desc: "Barre latérale stylisée avec typographie contemporaine." },
  { id: "minimal", nom: "Minimal", desc: "Ultra épuré avec maximisation de l'espace de lecture." },
  { id: "elegant", nom: "Élégant", desc: "Tons indigo riches avec bordures et finitions dorées." },
  { id: "audacieux", nom: "Audacieux", desc: "Contraste fort avec blocs d'accent sombres." },
  { id: "epure", nom: "Épuré", desc: "Fond clair avec lignes nettes et grille épurée." },
];

export default function ModeleFacturePage() {
  const [separateur, setSeparateur] = useState("A-B");
  const [inclureAnnee, setInclureAnnee] = useState(false);
  const [longueur, setLongueur] = useState(4);
  const [accent, setAccent] = useState(accentColors[4].hex);
  const [template, setTemplate] = useState("moderne");
  const [footerText, setFooterText] = useState("Merci pour votre confiance ! ICE N° 00294829100032 · Capital Social: 100 000 MAD");
  
  const [prefixeFac, setPrefixeFac] = useState("FAC");
  const [prefixeDev, setPrefixeDev] = useState("DEV");
  const [prefixeAv, setPrefixeAv] = useState("AV");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("factureTemplateConfig");
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          if (parsed.separateur) setSeparateur(parsed.separateur);
          if (parsed.inclureAnnee !== undefined) setInclureAnnee(parsed.inclureAnnee);
          if (parsed.longueur) setLongueur(parsed.longueur);
          if (parsed.accent) setAccent(parsed.accent);
          if (parsed.template) setTemplate(parsed.template);
          if (parsed.footerText) setFooterText(parsed.footerText);
          if (parsed.prefixeFac) setPrefixeFac(parsed.prefixeFac);
          if (parsed.prefixeDev) setPrefixeDev(parsed.prefixeDev);
          if (parsed.prefixeAv) setPrefixeAv(parsed.prefixeAv);
        } catch (e) {
          console.error("Error reading template config", e);
        }
      }
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      const config = {
        separateur,
        inclureAnnee,
        longueur,
        accent,
        template,
        footerText,
        prefixeFac,
        prefixeDev,
        prefixeAv
      };
      localStorage.setItem("factureTemplateConfig", JSON.stringify(config));
    }
    setToastMessage("Modèle de facture et numérotation enregistrés avec succès !");
    setTimeout(() => setToastMessage(null), 3500);
  };

  function apercu(prefixe: string, n: number) {
    const num = String(n).padStart(longueur, "0");
    const annee = inclureAnnee ? `${new Date().getFullYear()}-` : "";
    return separateur === "A-B"
      ? `${prefixe}-${annee}${num}`
      : separateur === "A/B"
      ? `${prefixe}/${annee}${num}`
      : separateur === "A.B"
      ? `${prefixe}.${annee}${num}`
      : `${prefixe}${annee}${num}`;
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 text-slate-100 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-4 py-3 text-[13px] font-bold text-white shadow-2xl shadow-emerald-950/50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText size={24} className="text-indigo-400" /> Modèle & Numérotation de Facture
          </h1>
          <p className="text-[13px] text-slate-400">
            Personnalisez le design des PDF, la charte graphique et la séquence automatique des documents
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all self-start sm:self-auto"
        >
          Enregistrer les modifications
        </button>
      </div>

      {/* Section 1: Numérotation des documents */}
      <div className="bento-card space-y-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Hash size={16} className="text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Numérotation Automatique & Séquençage</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[12.5px] font-semibold text-slate-300">Format de Séparateur</p>
              <div className="grid grid-cols-4 gap-2.5">
                {["A-B", "A/B", "A.B", "AB"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeparateur(s)}
                    className={`rounded-xl border py-2.5 text-[13px] font-mono font-bold transition-all ${
                      separateur === s ? "border-indigo-500 bg-indigo-600/20 text-indigo-300 ring-2 ring-indigo-500/40" : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 cursor-pointer">
              <span className="text-[13px] font-semibold text-slate-200">
                Inclure l'année en cours
                <span className="block text-[11.5px] text-slate-400 font-normal">Insère {new Date().getFullYear()} dans le numéro (ex: FAC-{new Date().getFullYear()}-0001)</span>
              </span>
              <input
                type="checkbox"
                checked={inclureAnnee}
                onChange={(e) => setInclureAnnee(e.target.checked)}
                className="h-4 w-8 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <div>
              <p className="mb-2 text-[12.5px] font-semibold text-slate-300">Longueur du séquençage</p>
              <div className="grid grid-cols-4 gap-2.5">
                {[3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLongueur(n)}
                    className={`rounded-xl border py-2.5 text-[13px] font-semibold transition-all ${
                      longueur === n ? "border-indigo-500 bg-indigo-600/20 text-indigo-300 ring-2 ring-indigo-500/40" : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    {n} chiffres
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[12.5px] font-semibold text-slate-300">Préfixes & Aperçu des Nombres</p>
            
            {/* Factures */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="w-20 text-[12.5px] font-bold text-white">Factures</span>
              <input
                value={prefixeFac}
                onChange={(e) => setPrefixeFac(e.target.value)}
                className="w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[12.5px] text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex-1 text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Prochain N°</span>
                <span className="figure text-[13px] font-mono font-bold text-indigo-400">{apercu(prefixeFac, 47)}</span>
              </div>
            </div>

            {/* Devis */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="w-20 text-[12.5px] font-bold text-white">Devis</span>
              <input
                value={prefixeDev}
                onChange={(e) => setPrefixeDev(e.target.value)}
                className="w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[12.5px] text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex-1 text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Prochain N°</span>
                <span className="figure text-[13px] font-mono font-bold text-indigo-400">{apercu(prefixeDev, 19)}</span>
              </div>
            </div>

            {/* Avoirs */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="w-20 text-[12.5px] font-bold text-white">Avoirs</span>
              <input
                value={prefixeAv}
                onChange={(e) => setPrefixeAv(e.target.value)}
                className="w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[12.5px] text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex-1 text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Prochain N°</span>
                <span className="figure text-[13px] font-mono font-bold text-indigo-400">{apercu(prefixeAv, 5)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Couleur d'accent & Pied de page */}
      <div className="bento-card space-y-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Palette size={16} className="text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Couleur d'Accent & Mentions Légales</h2>
        </div>

        <div>
          <label className="text-[12.5px] font-semibold text-slate-300 block mb-2.5">Couleur Principale du PDF</label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setAccent(c.hex)}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all active:scale-95 shadow-md relative group"
                style={{ backgroundColor: c.hex, borderColor: accent === c.hex ? "#FFFFFF" : "transparent" }}
                title={c.name}
              >
                {accent === c.hex && <Check size={18} className="text-white drop-shadow-md" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Texte de pied de page sur le PDF (Mentions bas de page)</label>
          <input
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Section 3: Modèles PDF & Templates */}
      <div className="bento-card space-y-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layout size={16} className="text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Sélection du Modèle PDF (Design Template)</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden ${
                template === t.id ? "border-indigo-500 bg-indigo-600/15 ring-2 ring-indigo-500/40" : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              }`}
            >
              <div
                className="mb-3 flex h-24 items-center justify-center rounded-xl text-[12px] font-bold text-white shadow-md relative overflow-hidden"
                style={{ backgroundColor: accent }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="relative z-10 font-mono tracking-wider uppercase text-[11px] font-black">Aperçu PDF ({t.nom})</span>
              </div>

              <div className="flex items-center justify-between mb-1">
                <p className="text-[13.5px] font-bold text-white">{t.nom}</p>
                {template === t.id && <Check size={16} className="text-indigo-400" />}
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-[13px] font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
