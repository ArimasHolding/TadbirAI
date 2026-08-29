"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2, CheckCircle2, X, Eye } from "lucide-react";
import { mad } from "@/lib/format";
import SpreadsheetImportModal from "@/components/SpreadsheetImportModal";
import EditProductModal from "@/components/EditProductModal";
import ConfirmModal from "@/components/ConfirmModal";
import { matchesSearch } from "@/lib/search";

export default function StocksPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadataKeys, setMetadataKeys] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    const handleDataUpdate = () => fetchProducts();
    window.addEventListener("dataUpdated", handleDataUpdate);
    return () => window.removeEventListener("dataUpdated", handleDataUpdate);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setProducts(list);
      
      const keys = new Set<string>();
      list.forEach((p: any) => {
        if (p.metadata && typeof p.metadata === 'object') {
          Object.keys(p.metadata).forEach((key) => keys.add(key));
        }
      });
      setMetadataKeys(Array.from(keys));
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  // 0ms Optimistic UI Delete Product
  const handleDeleteProduct = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `Supprimer le produit ${name}`,
      message: "Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.",
      onConfirm: () => {
        // 1. INSTANT UI removal (0ms delay)
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(`Produit ${name} supprimé avec succès !`);

        // 2. Asynchronous API sync in background
        fetch(`/api/products/${id}`, { method: "DELETE" }).then(() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "stock" } }));
          }
        }).catch((err) => console.error("Error deleting product:", err));
      }
    });
    setActionMenuOpen(null);
  };

  // 0ms Optimistic UI Clear All
  const handleClearProducts = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Vider les produits",
      message: "Voulez-vous vraiment vider toute la liste des produits ? Cette action est irréversible.",
      onConfirm: () => {
        // 1. INSTANT UI clear (0ms delay)
        setProducts([]);
        showToast("Tous les produits ont été vidés avec succès !");

        // 2. Asynchronous API sync in background
        fetch("/api/products/clear", { method: "DELETE" }).then(() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "stock" } }));
          }
        }).catch((err) => console.error("Error clearing products:", err));
      }
    });
  };

  const filteredProducts = products.filter((p) => matchesSearch(p, searchTerm));

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getQuantity = (p: any): number => {
    if (!p) return 0;
    const raw = p.quantity !== undefined && p.quantity !== null ? p.quantity :
                p.stock !== undefined && p.stock !== null ? p.stock :
                p.qty !== undefined && p.qty !== null ? p.qty :
                p.quantite !== undefined && p.quantite !== null ? p.quantite : 0;
    if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
    const str = String(raw).replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const getPrice = (p: any): number => {
    if (!p) return 0;
    const raw = p.selling_price !== undefined && p.selling_price !== null ? p.selling_price :
                p.prix !== undefined && p.prix !== null ? p.prix :
                p.price !== undefined && p.price !== null ? p.price :
                p.prix_vente !== undefined && p.prix_vente !== null ? p.prix_vente : 0;
    if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
    const str = String(raw).replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const isTracked = (p: any): boolean => {
    if (!p) return true;
    const track = p.track_inventory !== undefined ? p.track_inventory : p.suivi;
    if (track === false || track === "false" || track === "0" || track === 0 || track === "non" || track === "No") return false;
    return true;
  };

  const suivis = products.filter((p) => isTracked(p));
  const enRupture = suivis.filter((p) => getQuantity(p) === 0).length;
  const stockBas = suivis.filter((p) => getQuantity(p) > 0 && getQuantity(p) < 10).length;
  const valeurTotale = suivis.reduce((s, p) => s + (getPrice(p) * getQuantity(p)), 0);

  return (
    <>
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3.5 text-[13px] font-bold text-white shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 rounded-lg p-1 hover:bg-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-[1400px] space-y-5 text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Gestion des stocks & Produits
            </h1>
            <p className="text-[13px] text-slate-400">Gérez vos produits, tarifs et votre inventaire en temps réel</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearProducts}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[12.5px] font-semibold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <Trash2 size={14} /> Vider
            </button>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-[12.5px] font-semibold text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
            >
              Importer
            </button>
            <Link
              href="/stocks/nouveau"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              <Plus size={15} /> Ajouter un produit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bento-card space-y-1">
            <p className="figure text-[22px] font-extrabold text-white">{suivis.length}</p>
            <p className="text-[12px] text-slate-400">Produits suivis · {products.length} total</p>
          </div>
          <div className="bento-card space-y-1 border-l-4 border-l-red-500">
            <p className="figure text-[22px] font-extrabold text-red-400">{enRupture}</p>
            <p className="text-[12px] text-slate-400">En rupture de stock</p>
          </div>
          <div className="bento-card space-y-1 border-l-4 border-l-amber-500">
            <p className="figure text-[22px] font-extrabold text-amber-400">{stockBas}</p>
            <p className="text-[12px] text-slate-400">Stock bas</p>
          </div>
          <div className="bento-card space-y-1">
            <p className="figure text-[22px] font-extrabold text-emerald-400">{mad(valeurTotale)}</p>
            <p className="text-[12px] text-slate-400">Valeur totale du stock</p>
          </div>
        </div>

        <div className="bento-card !p-5 flex flex-col min-h-[500px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher des produits par nom, SKU ou catégorie..."
            className="mb-5 w-80 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {loading ? (
            <div className="flex justify-center py-12 flex-1 items-center">
              <Loader2 className="animate-spin text-indigo-400" size={28} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1 pb-10 min-h-[360px]">
                <table className="w-full text-[13.5px] min-w-max border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Produit</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Prix Vente</th>
                      <th className="py-3 px-3">Unité</th>
                      <th className="py-3 px-3">Catégorie</th>
                      <th className="py-3 px-3">Stock</th>
                      {metadataKeys.map(key => (
                        <th key={key} className="py-3 px-3 text-indigo-400">{key}</th>
                      ))}
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8 + metadataKeys.length} className="py-12 text-center text-slate-500">
                          Aucun produit trouvé.
                        </td>
                      </tr>
                    ) : (
                      displayedProducts.map((p, idx) => (
                        <tr key={`${p.id}-${idx}`} className="group hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-3">
                            <Link href={`/stocks/${p.id}`} className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {p.name || p.nom || 'Sans nom'}
                            </Link>
                          </td>
                          <td className="figure py-3.5 px-3 font-mono text-slate-400">{p.sku}</td>
                          <td className="figure py-3.5 px-3 font-mono font-bold text-white">{mad(getPrice(p))}</td>
                          <td className="py-3.5 px-3 text-slate-400">{p.unit || p.unite || 'unité'}</td>
                          <td className="py-3.5 px-3">
                            <span className="rounded-xl bg-indigo-500/10 px-2.5 py-1 text-[11.5px] font-semibold text-indigo-300 border border-indigo-500/20">
                              {p.category_name || p.categorie || 'Général'}
                            </span>
                          </td>
                          <td className="figure py-3.5 px-3 font-mono font-bold">
                            {isTracked(p) ? (
                              <span className={getQuantity(p) === 0 ? "text-red-400 font-extrabold" : getQuantity(p) < 10 ? "text-amber-400" : "text-emerald-400"}>
                                {getQuantity(p)}
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          
                          {metadataKeys.map(key => (
                            <td key={key} className="py-3.5 px-3 text-slate-400">
                              {p.metadata && p.metadata[key] ? p.metadata[key] : '-'}
                            </td>
                          ))}
                          
                          <td className="py-3.5 px-3">
                            <span
                              className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                                p.is_active !== false
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {p.is_active !== false ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right relative">
                            <button 
                              onClick={() => setActionMenuOpen(actionMenuOpen === p.id ? null : p.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {actionMenuOpen === p.id && (
                              <div className="absolute right-2 top-10 z-50 w-52 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-1.5 text-left animate-in fade-in zoom-in-95 space-y-1">
                                <Link 
                                  href={`/stocks/${p.id}`}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] text-slate-200 hover:bg-slate-800 font-medium"
                                >
                                  <Eye size={14} className="text-indigo-400" /> Voir le produit
                                </Link>
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex items-center gap-2 w-full text-left rounded-lg px-2.5 py-2 text-[12.5px] text-amber-300 hover:bg-slate-800 font-semibold"
                                >
                                  <Pencil size={14} className="text-amber-400" /> Modifier le produit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name || p.nom || p.sku)}
                                  className="flex items-center gap-2 w-full text-left rounded-lg px-2.5 py-2 text-[12.5px] text-red-400 hover:bg-red-500/10 font-medium border-t border-slate-800 pt-1.5"
                                >
                                  <Trash2 size={14} className="text-red-400" /> Supprimer
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[13px] text-slate-400">
                  <span>
                    Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredProducts.length)} sur {filteredProducts.length} produits
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-xl border border-slate-800 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} /> Précédent
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-xl border border-slate-800 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
                    >
                      Suivant <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Product Modal */}
        {editingProduct && (
          <EditProductModal 
            product={editingProduct} 
            onClose={() => setEditingProduct(null)} 
            onSuccess={() => {
              showToast("Produit modifié avec succès dans la base de données !");
              fetchProducts();
            }} 
          />
        )}

        {/* Spreadsheet Import Modal */}
        <SpreadsheetImportModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)} 
          expectedType="stock" 
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
        />
      </div>
    </>
  );
}
