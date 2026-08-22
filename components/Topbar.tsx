"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Check, LogOut, Settings, User, Plus, FileText, Scan, FileSpreadsheet, Sparkles, Sun, Moon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import QuickInvoiceModal from "@/components/QuickInvoiceModal";
import ScannerModal from "@/components/ScannerModal";
import SpreadsheetImportModal from "@/components/SpreadsheetImportModal";

export default function Topbar() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<"lang" | "bell" | "profile" | "actions" | null>(null);
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);



  useEffect(() => {
    fetchStockAlerts();
  }, []);

  const fetchStockAlerts = async () => {
    try {
      const res = await fetchAPI("api/products/");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        
        // Filter track_inventory and quantity < 10 for stock alerts
        const alerts = list
          .filter((p: any) => p.track_inventory && (p.quantity ?? 0) < 10)
          .map((p: any) => ({
            id: p.id,
            title: p.quantity === 0 ? `Rupture : ${p.name}` : `Stock bas : ${p.name}`,
            description: p.quantity === 0 
              ? `Ce produit est complètement épuisé dans vos stocks.` 
              : `Il ne reste que ${p.quantity} unité(s) en stock (Alerte critique).`,
            time: "Alerte de stock",
            type: "danger",
            unread: true
          }));
          
        // Add a friendly system default notification if no alerts exist
        if (alerts.length === 0) {
          alerts.push({
            id: "system-ok",
            title: "Système Prêt",
            description: "Votre application Fawatir est opérationnelle.",
            time: "Info",
            type: "info",
            unread: false
          });
        }
        
        setNotifications(alerts);
        setUnreadCount(alerts.filter((n: any) => n.unread).length);
      }
    } catch (err) {
      console.error("Error fetching stock alerts", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl px-6 py-3.5 z-40 relative">
        {/* Command Search Bar */}
        <div className="flex flex-1 items-center max-w-md">
          <div className="relative w-full group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={14} className="text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-slate-800/80 bg-slate-900/90 py-2 pl-9 pr-3 text-[12.5px] text-slate-100 placeholder:text-slate-500 transition-all focus:border-indigo-500/80 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              placeholder="Rechercher facture, client, devis, commande... (⌘K)"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-300 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* System Status Badge */}
        <div className="hidden lg:flex items-center gap-2.5 rounded-full bg-slate-900/80 px-3.5 py-1.5 border border-slate-800/80 text-[11.5px] font-medium text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-200 font-semibold">Système Actif</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-emerald-400 font-bold">En ligne</span>
        </div>

        {/* Right Section */}
        <div ref={ref} className="flex shrink-0 items-center gap-2.5 relative">
          
          {/* Global Quick Action Hub Button */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "actions" ? null : "actions")}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all ring-1 ring-white/20"
            >
              <Plus size={15} />
              <span>Nouveau</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${openDropdown === "actions" ? "rotate-180" : ""}`} />
            </button>

            {openDropdown === "actions" && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 z-50">
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    setIsInvoiceModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
                    <FileText size={15} />
                  </div>
                  Facture Rapide
                </button>
              </div>
            )}
          </div>



          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setOpenDropdown(openDropdown === "bell" ? null : "bell")}
              className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95 shadow-xs"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>
            
            {openDropdown === "bell" && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 z-50 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                  <h3 className="font-bold text-white text-[13px]">Alertes & Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, unread: false })));
                        setUnreadCount(0);
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <p className="text-[12px] text-slate-500 text-center py-6">Aucune alerte active.</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
                          setUnreadCount(prev => Math.max(0, prev - (n.unread ? 1 : 0)));
                        }}
                        className={`flex gap-3 p-2.5 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors ${!n.unread ? 'opacity-60' : ''}`}
                      >
                        {n.unread && (
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-[12.5px] text-white font-semibold">{n.title}</p>
                          <p className="text-[11.5px] text-slate-400 mt-0.5 leading-relaxed">{n.description}</p>
                          <p className="text-[10px] text-indigo-400 mt-1 font-bold">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1 pr-2.5 hover:bg-slate-800 shadow-xs active:scale-95 transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold text-white shadow-xs">
                FD
              </div>
              <span className="hidden text-[12.5px] font-semibold text-slate-200 md:block">
                Fawatir Demo
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>
            
            {openDropdown === "profile" && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 z-50">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-[13px] font-bold text-white">Fawatir Demo</p>
                  <p className="text-[11px] text-slate-400">demo@fawatir.ma</p>
                </div>
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    router.push("/entreprise");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <User size={15} /> Mon Profil
                </button>
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    router.push("/parametres");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Settings size={15} /> Paramètres
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    router.push("/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} /> Déconnexion
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Global Modals triggered from Topbar */}
      <QuickInvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
      <ScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} targetType="factures" />
      <SpreadsheetImportModal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} />
    </>
  );
}
