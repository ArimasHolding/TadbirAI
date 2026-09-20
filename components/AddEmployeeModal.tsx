"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";
import FormAlert from "./FormAlert";
import { useTranslation } from "@/lib/i18n";

export default function AddEmployeeModal({
  isOpen,
  onClose,
  initialData,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!initialData?.id;

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [cin, setCin] = useState("");
  const [poste, setPoste] = useState("");
  const [departement, setDepartement] = useState("");
  const [salaireBase, setSalaireBase] = useState<number | "">(5000);
  const [dateEmbauche, setDateEmbauche] = useState(new Date().toISOString().split("T")[0]);
  const [statut, setStatut] = useState("Actif");
  const [cnss, setCnss] = useState("");
  const [personnesACharge, setPersonnesACharge] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setPrenom(initialData.prenom || initialData.first_name || "");
      setNom(initialData.nom || initialData.last_name || "");
      setCin(initialData.cin || initialData.employee_number || "");
      setPoste(initialData.metadata?.poste || initialData.poste || "");
      setDepartement(initialData.metadata?.departement || initialData.departement || "");
      setSalaireBase(initialData.salaire_base !== undefined ? initialData.salaire_base : (initialData.salary ?? 5000));
      setDateEmbauche(initialData.metadata?.date_embauche || initialData.date_embauche || new Date().toISOString().split("T")[0]);
      setStatut(initialData.metadata?.statut || initialData.statut || "Actif");
      setCnss(initialData.metadata?.cnss || initialData.cnss || "");
      setPersonnesACharge(initialData.metadata?.personnes_a_charge || initialData.personnes_a_charge || 0);
    } else {
      setPrenom("");
      setNom("");
      setCin("");
      setPoste("");
      setDepartement("");
      setSalaireBase(5000);
      setDateEmbauche(new Date().toISOString().split("T")[0]);
      setStatut("Actif");
      setCnss("");
      setPersonnesACharge(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) {
      setError("Le prénom et le nom sont obligatoires.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = isEdit ? `/api/employes/${initialData.id}` : "/api/employes";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        first_name: prenom,
        last_name: nom,
        employee_number: cin,
        salary: Number(salaireBase) || 0,
        // Also send the French aliases the list table reads, in case the active
        // backend (local mock vs remote Django) expects those field names instead.
        prenom,
        nom,
        cin,
        poste,
        departement,
        salaire_base: Number(salaireBase) || 0,
        date_embauche: dateEmbauche,
        statut,
        cnss,
        personnes_a_charge: personnesACharge,
        metadata: {
          poste,
          departement,
          date_embauche: dateEmbauche,
          statut,
          cnss,
          personnes_a_charge: personnesACharge,
        },
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Échec de la ${isEdit ? "modification" : "création"} de l'employé.`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "employes" } }));
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'enregistrement de l'employé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? `${t("common.edit", "Modifier")} : ${prenom} ${nom}` : t("modals.add_employee_title", "Ajouter un Employé")}>
      <FormAlert error={error} onClose={() => setError(null)} title="Erreur de formulaire" />

      <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">{t("common.name", "Prénom")} *</label>
            <input
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prénom..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">{t("common.name", "Nom")} *</label>
            <input
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom de famille..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">N° CIN / Identifiant</label>
            <input
              value={cin}
              onChange={(e) => setCin(e.target.value)}
              placeholder="ex: AB123456"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] font-mono text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">{t("employees.job", "Poste / Fonction")}</label>
            <input
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              placeholder="ex: Responsable Commercial, Ingénieur..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">Département / Service</label>
            <input
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              placeholder="ex: Ventes, Technique, RH..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">{t("employees.salary", "Salaire de Base Mensuel")}</label>
            <input
              type="number"
              value={salaireBase}
              onChange={(e) => setSalaireBase(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="5000"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] font-mono font-bold text-emerald-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">{t("common.date", "Date d'Embauche")}</label>
            <input
              type="date"
              value={dateEmbauche}
              onChange={(e) => setDateEmbauche(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">{t("common.status", "Statut Employé")}</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] font-semibold text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Actif">✅ Actif</option>
              <option value="Inactif">🚫 Inactif</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">Numéro CNSS</label>
            <input
              value={cnss}
              onChange={(e) => setCnss(e.target.value)}
              placeholder="ex: 123456789"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] font-mono text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12.5px] font-semibold text-slate-300">Enfants / Personnes à charge</label>
            <input
              type="number"
              min="0"
              max="10"
              value={personnesACharge}
              onChange={(e) => setPersonnesACharge(Number(e.target.value))}
              placeholder="0"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {t("common.cancel", "Annuler")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-60 transition-all active:scale-95"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? t("common.save", "Enregistrer les modifications") : t("common.add", "Ajouter l'employé")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
