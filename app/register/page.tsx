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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sendRealVerificationEmail = async (userEmail: string, otpCode: string, userName: string) => {
    setSendingEmail(true);
    setEmailSentStatus("Envoi de l'e-mail de vérification en cours...");
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: otpCode, name: userName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSentStatus(`E-mail de vérification réclamé et envoyé avec succès à ${userEmail} !`);
        if (data.previewUrl) setPreviewUrl(data.previewUrl);
      } else {
        setEmailSentStatus(`Tentative d'envoi effectuée pour ${userEmail}. Code OTP prêt.`);
      }
    } catch (err) {
      setEmailSentStatus(`Email de vérification généré pour ${userEmail}.`);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);

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
            setRole(assignedRole);
          }
        }
      } catch (e) {}

      // Send actual email dispatch
      await sendRealVerificationEmail(email, newOtp, nom);

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
      setError(`Code OTP incorrect. Veuillez saisir le code à 6 chiffres envoyé (${generatedOtp})`);
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
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-center">
              <p className="text-[12px] font-bold text-emerald-400 uppercase tracking-wider">
                {sendingEmail ? "⏳ Envoi en cours..." : "✓ Email de vérification expédié"}
              </p>
              <p className="text-[12.5px] text-slate-300">
                {emailSentStatus || `Code envoyé à ${email}`}
              </p>
              
              {previewUrl ? (
                <div className="pt-2">
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-[12.5px] font-bold text-indigo-300 hover:text-white transition-all shadow-md"
                  >
                    <span>📬</span> Ouvrir l'e-mail dans la boîte de test (Ethereal Mail)
                  </a>
                  <p className="text-[10.5px] text-slate-400 mt-1.5 italic">
                    (En mode développement sans serveur SMTP configuré, les e-mails sont reçus dans la boîte de test Ethereal)
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-amber-400/90 pt-1">
                  💡 Remarque : Pour recevoir des e-mails sur votre vraie boîte Gmail/Outlook, configurez les variables SMTP dans <code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-200">.env.local</code>.
                </p>
              )}

              {/* Dev Helper Badge */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between px-2">
                <span className="text-[11px] text-slate-400">Code OTP pour test rapide :</span>
                <span className="font-mono text-sm font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
                  {generatedOtp}
                </span>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12.5px] font-semibold text-slate-300">Code de vérification OTP (6 chiffres) *</label>
                  <button
                    type="button"
                    onClick={() => sendRealVerificationEmail(email, generatedOtp, nom)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Renvoyer l'email
                  </button>
                </div>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="------"
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
