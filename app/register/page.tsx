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

  const [role, setRole] = useState("Administrateur");
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("892019");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      // Query team DB to check if email was pre-invited with a specific role
      let assignedRole = role;
      try {
        const eqRes = await fetch(`/api/equipe?t=${Date.now()}`);
        if (eqRes.ok) {
          const teamList: any[] = await eqRes.json();
          const found = teamList.find(
            (m) => m.email?.toLowerCase().trim() === email.toLowerCase().trim()
          );
          if (found) {
            assignedRole = found.role || assignedRole;
          }
        }
      } catch (e) {}

      // Prompt email verification step
      setShowVerificationStep(true);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors de l'inscription");
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() !== generatedOtp) {
      setError("Code OTP incorrect. Utilisez le code 892019");
      return;
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      email,
      nom,
      role: role,
      company: "Tadbir AI Enterprise",
      emailVerified: true,
    };

    login(newUser);
    router.push("/");
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
            <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Rôle attribué</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="Administrateur">Administrateur (Accès Complet)</option>
              <option value="Comptable">Comptable (Factures, Dépenses, Banque)</option>
              <option value="Commercial">Commercial (Devis, Clients, POS)</option>
              <option value="Lecteur">Lecteur (Consultation Seule)</option>
            </select>
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
            {loading ? "Création du compte..." : "Continuer vers la vérification d'email"}
          </button>

          <p className="text-sm text-center mt-6 text-slate-400">
            Déjà un compte ?{" "}
            <a href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Connectez-vous
            </a>
          </p>
        </form>
      </div>

      {/* OTP Email Verification Step */}
      {showVerificationStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-7 shadow-2xl border border-slate-700/60 text-white space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-1 border border-emerald-500/30">
                ✉️
              </div>
              <h2 className="text-xl font-bold text-white">Vérification de l'adresse e-mail</h2>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                Un code de confirmation à 6 chiffres a été envoyé à <strong>{email}</strong>.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 text-center border border-slate-800">
              <p className="text-[11.5px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Simulation d'Envoi Email OTP</p>
              <p className="text-xl font-mono font-extrabold text-emerald-400 tracking-widest">{generatedOtp}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-300 mb-1">Entrez le code OTP *</label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="892019"
                  className="w-full text-center tracking-widest text-lg font-mono rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs text-red-400 font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationStep(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[13px] font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95"
                >
                  Valider l'Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
