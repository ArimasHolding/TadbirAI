"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Box, 
  Settings,
  CreditCard,
  Building2,
  Receipt,
  Truck,
  Undo2,
  ShoppingCart,
  Calculator,
  UserSquare2,
  Users2,
  Store,
  BarChart3,
  Landmark,
  HelpCircle,
  Palette,
  Sparkles,
  Layers,
  MessageSquare
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface NavGroup {
  groupKey: string;
  defaultGroupName: string;
  items: { href: string; itemKey: string; defaultLabel: string; icon: any }[];
}

const navGroups: NavGroup[] = [
  {
    groupKey: "nav.group.overview",
    defaultGroupName: "Vue d'ensemble",
    items: [
      { href: "/", itemKey: "nav.apercu", defaultLabel: "Aperçu", icon: LayoutDashboard },
      { href: "/rapports", itemKey: "nav.rapports", defaultLabel: "Rapports & KPIs", icon: BarChart3 },
    ]
  },
  {
    groupKey: "nav.group.sales",
    defaultGroupName: "Ventes & Clients",
    items: [
      { href: "/factures", itemKey: "nav.factures", defaultLabel: "Factures", icon: FileText },
      { href: "/devis", itemKey: "nav.devis", defaultLabel: "Devis", icon: FileText },
      { href: "/avoirs", itemKey: "nav.avoirs", defaultLabel: "Avoirs", icon: Undo2 },
      { href: "/clients", itemKey: "nav.clients", defaultLabel: "Clients", icon: Users },
    ]
  },
  {
    groupKey: "nav.group.purchases",
    defaultGroupName: "Achats & Fournisseurs",
    items: [
      { href: "/bons-de-commande", itemKey: "nav.bons_commande", defaultLabel: "Bons Cde", icon: ShoppingCart },
      { href: "/depenses", itemKey: "nav.depenses", defaultLabel: "Dépenses", icon: Receipt },
      { href: "/fournisseurs", itemKey: "nav.fournisseurs", defaultLabel: "Fournisseurs", icon: Truck },
    ]
  },
  {
    groupKey: "nav.group.operations",
    defaultGroupName: "Opérations & Stocks",
    items: [
      { href: "/stocks", itemKey: "nav.stocks", defaultLabel: "Stocks", icon: Box },
      { href: "/pos", itemKey: "nav.pos", defaultLabel: "Point de Vente", icon: Store },
      { href: "/rapprochement", itemKey: "nav.banque", defaultLabel: "Banque", icon: Landmark },
    ]
  },
  {
    groupKey: "nav.group.hr",
    defaultGroupName: "Ressources Humaines",
    items: [
      { href: "/employes", itemKey: "nav.employes", defaultLabel: "Employés", icon: UserSquare2 },
      { href: "/equipe", itemKey: "nav.equipe", defaultLabel: "Équipe", icon: Users2 },
      { href: "/bulletins-de-paie", itemKey: "nav.bulletins_paie", defaultLabel: "Fiches de paie", icon: Calculator },
    ]
  }
];

const bottomNavItems = [
  { href: "/parametres", itemKey: "nav.parametres", defaultLabel: "Paramètres", icon: Settings },
  { href: "/whatsapp", itemKey: "nav.whatsapp", defaultLabel: "WhatsApp Config", icon: MessageSquare },
  { href: "/abonnement", itemKey: "nav.abonnement", defaultLabel: "Abonnement", icon: CreditCard },
  { href: "/entreprise", itemKey: "nav.entreprise", defaultLabel: "Mon Entreprise", icon: Building2 },
  { href: "/modele-facture", itemKey: "nav.modeles", defaultLabel: "Modèles", icon: Palette },
  { href: "/support", itemKey: "nav.support", defaultLabel: "Support", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="w-[240px] h-full flex flex-col relative z-20 overflow-hidden border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl">
      {/* Brand */}
      <div className="mb-4 px-4 mt-4 shrink-0">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02] active:scale-95">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <span className="font-sans text-[17px] font-black text-white">T</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-[17px] font-bold tracking-tight text-white block leading-none">
                  Tadbir AI
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[9.5px] font-extrabold text-indigo-400 tracking-wider uppercase mt-1 block">
                AI Financial OS
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Navigation (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-3 pb-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.groupKey}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t(group.groupKey, group.defaultGroupName)}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold ring-1 ring-indigo-500/40 shadow-sm"
                        : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={15} className={isActive ? "text-indigo-400" : "text-slate-500"} />
                      <span>{t(item.itemKey, item.defaultLabel)}</span>
                    </div>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Bottom Navigation */}
        <div className="border-t border-slate-800/80 pt-3">
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t("nav.group.system", "System & Support")}
          </p>
          <nav className="space-y-0.5">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 font-semibold ring-1 ring-indigo-500/40 shadow-sm"
                      : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={15} className={isActive ? "text-indigo-400" : "text-slate-500"} />
                    <span>{t(item.itemKey, item.defaultLabel)}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <Link href="/entreprise" className="shrink-0 group flex items-center gap-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 p-2.5 m-3 mt-0 hover:border-slate-700 transition-all">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] ring-1 ring-indigo-500/30">
          TA
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-[12px] font-bold text-slate-200 leading-tight">Tadbir AI Demo</p>
          <p className="text-[10px] text-slate-400 font-medium">Enterprise • Pro</p>
        </div>
      </Link>
    </aside>
  );
}
