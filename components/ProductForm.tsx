"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ImagePlus, Plus, Trash2 } from "lucide-react";
import { UNIVERSAL_UNITS, UNIT_CATEGORIES } from "@/lib/units";
type Variante = { nom: string; sku?: string; prix?: number; stock?: number };
type Produit = {
  id: string;
  nom?: string;
  name?: string;
  description?: string;
  image?: string;
  categorie?: string;
  category_name?: string;
  prixBase?: number;
  prix?: number;
  selling_price?: number;
  sku?: string;
  unite?: string;
  unit?: string;
  suivreStock?: boolean;
  track_inventory?: boolean;
  qteStock?: number;
  quantity?: number;
  alerteStock?: number;
  fournisseur?: string;
  variantes?: Variante[];
};

export default function ProductForm({
  mode,
  produit,
}: {
  mode: "create" | "edit";
  produit?: Produit;
}) {
  const [suivreStock, setSuivreStock] = useState(produit?.suivreStock ?? false);
  const [variantes, setVariantes] = useState<Variante[]>(produit?.variantes ?? []);

  function addVariante() {
    setVariantes((prev) => [...prev, { nom: "", sku: "", prix: 0, stock: 0 }]);
  }
  function updateVariante(idx: number, patch: Partial<Variante>) {
    setVariantes((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }
  function removeVariante(idx: number) {
    setVariantes((prev) => prev.filter((_, i) => i !== idx));
  }

  const backHref = produit ? `/stocks/${produit.id}` : "/stocks";

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-brass/50 hover:text-ink-800"
        >
          <ChevronLeft size={16} />
        </Link>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">
          {mode === "create" ? "Ajouter un produit" : "Modifier le produit"}
        </h1>
      </div>

      <div className="ledger-card space-y-4">
        <div className="flex gap-4">
          <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ink-200 text-ink-400 hover:border-brass/50 hover:text-brass">
            <ImagePlus size={18} />
            <span className="text-[10px]">Ajouter une image</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <div className="flex-1 space-y-3">
            <div>
              <label className="mb-1.5 block text-[12.5px] text-ink-600">Nom</label>
              <input
                defaultValue={produit?.nom}
                placeholder="Nom du produit"
                className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] text-ink-600">Description</label>
              <input
                defaultValue={produit?.description}
                placeholder="Description du produit"
                className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Prix</label>
            <input
              type="number"
              defaultValue={produit?.prix || produit?.prixBase || produit?.selling_price || 0}
              placeholder="0.00"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">SKU</label>
            <input
              defaultValue={produit?.sku || ""}
              placeholder="PRO-001"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Unité Universelle</label>
            <select
              defaultValue={produit?.unite ?? "unité"}
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none cursor-pointer"
            >
              {UNIT_CATEGORIES.map((cat) => (
                <optgroup key={cat.id} label={cat.label} className="font-bold text-indigo-400">
                  {UNIVERSAL_UNITS.filter((u) => u.category === cat.id).map((u) => (
                    <option key={u.value} value={u.value} className="text-ink-900 font-normal">
                      {u.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Catégorie</label>
            <select
              defaultValue={produit?.categorie ?? "Service"}
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option>Service</option>
              <option>Développement</option>
              <option>Design</option>
              <option>Matériel</option>
              <option>Conseil</option>
              <option>Formation</option>
              <option>Infrastructure</option>
              <option>Sécurité</option>
            </select>
          </div>
        </div>

        <label className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
          <span className="text-[13px] text-ink-700">Suivre le stock</span>
          <input
            type="checkbox"
            checked={suivreStock}
            onChange={(e) => setSuivreStock(e.target.checked)}
            className="h-4 w-8 accent-brass"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Fournisseurs</label>
            <select
              defaultValue=""
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option value="">— Optionnel —</option>
              <option>Ali Tahir</option>
              <option>Mohamed Nasser</option>
              <option>Carlos Mendez</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Prix d'achat</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-400">
            Variantes
          </p>
          {variantes.length === 0 ? (
            <p className="mb-2 text-[12.5px] text-ink-400">Aucune variante ajoutée.</p>
          ) : (
            <div className="mb-2 space-y-2">
              {variantes.map((v, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_90px_90px_auto] items-end gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Nom de la variante</label>
                    <input
                      value={v.nom}
                      onChange={(e) => updateVariante(idx, { nom: e.target.value })}
                      className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">SKU</label>
                    <input
                      value={v.sku}
                      onChange={(e) => updateVariante(idx, { sku: e.target.value })}
                      className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Prix</label>
                    <input
                      type="number"
                      value={v.prix}
                      onChange={(e) => updateVariante(idx, { prix: Number(e.target.value) })}
                      className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariante(idx, { stock: Number(e.target.value) })}
                      className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariante(idx)}
                    className="mb-1.5 text-ink-400 hover:text-status-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addVariante}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-ink-200 py-2 text-[12.5px] text-ink-500 hover:border-brass/50 hover:text-brass"
          >
            <Plus size={14} /> Ajouter une variante
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href={backHref}
          className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
        >
          Annuler
        </Link>
        <button className="rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800">
          {mode === "create" ? "Ajouter un produit" : "Mettre à jour le produit"}
        </button>
      </div>
    </div>
  );
}
