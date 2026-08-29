"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

export default function RegisterPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchAPI("api/auth/register/", {
        method: "POST",
        body: JSON.stringify({ nom, email, password }),
      });

      if (!res.ok) {
        setError("Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      const data = await res.json();
      login(data.user, data.access, data.refresh);
      router.push("/");
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: "url('/auth-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl flex flex-col items-center">
        
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Bienvenue sur Tadbir AI</h1>
          <p className="text-slate-400 text-sm">Créez votre compte pour gérer vos factures intelligemment.</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Nom complet</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Email professionnel</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
              placeholder="vous@entreprise.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirmer mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl p-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création du compte..." : "S'inscrire et démarrer"}
          </button>

          <p className="text-sm text-center mt-6 text-slate-400">
            Déjà un compte ?{" "}
            <a href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Connectez-vous
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
