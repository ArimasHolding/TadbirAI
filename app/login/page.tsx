"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Forgot Password States
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetOtp, setResetOtp] = useState("");
  const [generatedResetOtp, setGeneratedResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Identifiants invalides.");
        setLoading(false);
        return;
      }

      if (!data.user.emailVerified) {
        setError("Votre compte n'est pas encore vérifié.");
        setLoading(false);
        return;
      }

      login(data.user, "session_token", "session_refresh");
      router.push("/");
    } catch {
      setError("Erreur de connexion au serveur.");
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const cleanEmail = email.trim().toLowerCase();
      // Check if user exists
      const userRes = await fetch(`/api/auth/check-user?email=${encodeURIComponent(cleanEmail)}`);
      if (!userRes.ok) {
        setError("Aucun compte trouvé pour cet e-mail.");
        setLoading(false);
        return;
      }
      
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedResetOtp(newOtp);
      
      // Send email (Fallback or real, handled by the endpoint)
      await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: newOtp, name: "Utilisateur Tadbir AI" }),
      });
      
      setResetStep(2);
      setLoading(false);
    } catch (err) {
      setError("Erreur réseau.");
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (resetOtp.trim() !== generatedResetOtp) {
      setError("Code OTP incorrect.");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la réinitialisation.");
        setLoading(false);
        return;
      }
      
      alert("Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.");
      setIsForgotPasswordMode(false);
      setResetStep(1);
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError("");
      setLoading(false);
    } catch {
      setError("Erreur réseau.");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isForgotPasswordMode ? "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"} />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {isForgotPasswordMode ? "Réinitialisation" : "Bon retour"}
          </h1>
          <p className="text-slate-400 text-sm">
            {isForgotPasswordMode 
              ? (resetStep === 1 ? "Entrez votre email pour recevoir un code de sécurité." : "Créez votre nouveau mot de passe.") 
              : "Connectez-vous pour accéder à votre tableau de bord."}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 w-full bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        {/* FORGOT PASSWORD MODE */}
        {isForgotPasswordMode ? (
          <form onSubmit={resetStep === 1 ? handleResetRequest : handlePasswordReset} className="w-full space-y-4">
            
            {resetStep === 1 && (
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email professionnel
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
                  placeholder="vous@entreprise.com"
                  required
                />
              </div>
            )}

            {resetStep === 2 && (
              <>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Code OTP reçu par email
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white text-center font-mono tracking-widest text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="------"
                    required
                  />
                  <p className="mt-1 text-xs text-amber-400 text-center font-semibold">
                    (Vérifiez vos courriers indésirables / spams)
                  </p>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Confirmer nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl p-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Chargement..." : resetStep === 1 ? "Envoyer le code" : "Modifier le mot de passe"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPasswordMode(false);
                setResetStep(1);
                setError("");
              }}
              className="w-full text-sm text-center mt-4 text-slate-400 hover:text-white transition-colors"
            >
              Retour à la connexion
            </button>
          </form>

        ) : (

          /* LOGIN MODE */
          <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email professionnel
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
                placeholder="vous@entreprise.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mot de passe
                </label>
                <button 
                  type="button"
                  onClick={() => setIsForgotPasswordMode(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl p-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <p className="text-sm text-center mt-6 text-slate-400">
              Pas encore de compte?{" "}
              <a href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Créer un compte
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
