"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, UserX, UserPlus, X, Shield, Search, MoreHorizontal, Check, HelpCircle, Loader2 } from "lucide-react";
import { matchesSearch } from "@/lib/search";

const ROLE_PERMISSIONS: Record<string, string> = {
  Administrateur: "Accès complet: Création, validation, suppression et gestion des paramètres & utilisateurs.",
  Comptable: "Accès financier: Factures, dépenses, avoirs, rapprochement bancaire et export des rapports.",
  Commercial: "Accès vente: Création de devis, gestion des clients et suivi des commandes.",
  Lecteur: "Accès consultation seule: Visualisation des factures et rapports sans modification.",
};

export default function EquipePage() {
  const [mounted, setMounted] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Comptable");
  const [search, setSearch] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchEquipe = async () => {
    try {
      const res = await fetch(`/api/equipe?t=${Date.now()}`);
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipe();
    const handleUpdate = () => fetchEquipe();
    window.addEventListener("dataUpdated", handleUpdate);
    return () => window.removeEventListener("dataUpdated", handleUpdate);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !email) return;

    const newMember = {
      nom,
      email,
      role,
      statut: "Invité" as const,
    };

    try {
      const res = await fetch('/api/equipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        fetchEquipe();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "equipe" } }));
        }
      }
      setIsModalOpen(false);
      setNom("");
      setEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setList((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) => (m?.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleStatusToggle = (memberId: string) => {
    setList((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) =>
        m?.id === memberId
          ? { ...m, statut: m.statut === "Actif" ? ("Suspendu" as any) : ("Actif" as any) }
          : m
      )
    );
  };

  const safeList = Array.isArray(list) ? list : [];

  const filtered = safeList.filter((m) => matchesSearch(m, search));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestion de l'Équipe & Rôles</h1>
          <p className="text-[13px] text-slate-400">Invitez vos collaborateurs et gérez les permissions d'accès</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Inviter un membre
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {Object.entries(ROLE_PERMISSIONS).map(([r, desc]) => {
          const count = safeList.filter((m) => m?.role === r).length;
          return (
            <div key={r} className="bento-card space-y-1.5 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-white">{r}</span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-400 border border-indigo-500/20">
                  {count}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 leading-snug">{desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bento-card !p-5 rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-72 rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <span className="text-[12.5px] font-semibold text-slate-400">
            {safeList.length} membre{safeList.length > 1 ? "s" : ""} au total
          </span>
        </div>

        <div className="overflow-x-auto pb-10 min-h-[300px]">
          <table className="w-full text-[13.5px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Nom</th>
                <th className="py-3 px-3">E-mail</th>
                <th className="py-3 px-3">Rôle (Modifiable)</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((m, idx) => (
                <tr key={m?.id || idx} className="group hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-[12px] font-extrabold text-indigo-300 border border-indigo-500/30">
                        {m?.nom ? m.nom.charAt(0).toUpperCase() : "?"}
                      </span>
                      <span className="font-bold text-white">{m?.nom || "Sans nom"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-mono text-[12.5px]">{m?.email || "-"}</td>
                  <td className="py-3.5 px-3">
                    <select
                      value={m?.role || "Lecteur"}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-[12.5px] font-semibold text-indigo-300 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Administrateur">Administrateur</option>
                      <option value="Comptable">Comptable</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Lecteur">Lecteur</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                        m?.statut === "Actif"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : m?.statut === "Invité"
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {m?.statut || "Actif"}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === m?.id ? null : m?.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {actionMenuOpen === m?.id && (
                      <div className={`absolute right-2 z-50 w-52 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-2 text-left animate-in fade-in zoom-in-95 space-y-1 ${idx >= safeList.length - 2 ? "bottom-10" : "top-10"}`}>
                        <button
                          onClick={() => {
                            if (m?.id) handleStatusToggle(m.id);
                            setActionMenuOpen(null);
                          }}
                          className="flex items-center gap-2 w-full text-left rounded-lg px-2.5 py-2 text-[12.5px] text-slate-200 hover:bg-slate-800 font-medium"
                        >
                          <Shield size={14} className="text-indigo-400" />
                          {m?.statut === "Actif" ? "Suspendre l'accès" : "Activer le compte"}
                        </button>
                        <button
                          onClick={() => {
                            if (m?.id) setList((prev) => (Array.isArray(prev) ? prev : []).filter((item) => item?.id !== m.id));
                            setActionMenuOpen(null);
                          }}
                          className="flex items-center gap-2 w-full text-left rounded-lg px-2.5 py-2 text-[12.5px] text-red-400 hover:bg-red-500/10 font-medium border-t border-slate-800 pt-1.5"
                        >
                          <UserX size={14} className="text-red-400" /> Retirer de l'équipe
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col overflow-y-auto my-auto rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-800 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white">Inviter un membre d'équipe</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Nom complet *</label>
                <input
                  required
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Youssef El Amrani"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">E-mail professionnel *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youssef@entreprise.ma"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Rôle attribué</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Administrateur">Administrateur</option>
                  <option value="Comptable">Comptable</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Lecteur">Lecteur</option>
                </select>
                <p className="mt-1.5 text-[11.5px] text-slate-400 leading-snug">{ROLE_PERMISSIONS[role] || ""}</p>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
                >
                  Envoyer l'invitation
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
