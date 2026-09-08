"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  "/profil": ["Administrateur", "Comptable", "Commercial", "Ressources Humaines", "Caissier", "Lecteur"],
  "/equipe": ["Administrateur"],
  "/parametres": ["Administrateur"],
  "/entreprise": ["Administrateur"],
  "/abonnement": ["Administrateur"],
  "/employes": ["Administrateur", "Ressources Humaines"],
  "/bulletins-de-paie": ["Administrateur", "Comptable", "Ressources Humaines"],
  "/rapprochement": ["Administrateur", "Comptable"],
  "/rapports": ["Administrateur", "Comptable"],
  "/depenses": ["Administrateur", "Comptable", "Lecteur"],
  "/bons-de-commande": ["Administrateur", "Comptable", "Lecteur"],
  "/pos": ["Administrateur", "Commercial", "Caissier"],
  "/whatsapp": ["Administrateur", "Commercial"],
  "/devis": ["Administrateur", "Commercial", "Lecteur"],
  "/avoirs": ["Administrateur", "Comptable", "Lecteur"],
  "/modele-facture": ["Administrateur", "Comptable"],
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, hydrate } = useAuthStore();
  const [checked, setChecked] = useState(false);

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    hydrate();
    const timer = setTimeout(() => {
      if (!isAuthenticated && !isPublic) {
        router.push("/login");
      }
      setChecked(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isPublic, router]);

  if (isPublic) return <>{children}</>;
  if (!checked) return null;
  if (!isAuthenticated) return null;

  const activeRole = user?.role || "Administrateur";
  const normalizedRole = activeRole?.trim().toLowerCase().includes("admin") ? "Administrateur" : activeRole;
  
  // Check if current path has specific role restrictions
  const requiredRoles = Object.entries(ROLE_ALLOWED_PATHS).find(([prefix]) =>
    pathname === prefix || (pathname.startsWith(prefix) && prefix !== "/")
  )?.[1];

  if (requiredRoles && !requiredRoles.includes(normalizedRole)) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4 shadow-xl shadow-rose-500/10 animate-in zoom-in-95">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Accès Refusé (403)</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
          Votre compte (rôle : <strong className="text-indigo-400">{activeRole}</strong>) n'a pas les permissions requises pour consulter la page <code className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{pathname}</code>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Retourner à l'Aperçu</span>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}