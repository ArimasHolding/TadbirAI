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
  const [emailErrorDetails, setEmailErrorDetails] = useState<string | null>(null);
  const [isRealSmtp, setIsRealSmtp] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const sendRealVerificationEmail = async (userEmail: string, otpCode: string, userName: string) => {
    setSendingEmail(true);
    setEmailSentStatus("Envoi de l'e-mail de vérification en cours...");
    setEmailErrorDetails(null);
    setIsRealSmtp(null);
    setPreviewUrl(null);

    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: otpCode, name: userName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsRealSmtp(!!data.isRealSmtp);
        if (data.isRealSmtp) {
          setEmailSentStatus(`E-mail réellement expédié via Gmail SMTP à ${userEmail}`);
        } else {
          setEmailSentStatus(`Email de test généré pour ${userEmail} (Serveur Ethereal Mail)`);
        }
        if (data.previewUrl) setPreviewUrl(data.previewUrl);
      } else {
        setEmailErrorDetails(data.details || data.error || "Échec de l'envoi de l'email.");
        setEmailSentStatus(`Erreur lors de l'envoi à ${userEmail}`);
      }
    } catch (err: any) {
      setEmailErrorDetails(err.message || "Impossible de contacter le serveur d'envoi.");
      setEmailSentStatus("Erreur réseau lors de l'envoi de l'email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleAutofillOtp = () => {
    setOtpInput(generatedOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
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
      // 1. Verify email uniqueness and role assignment with backend API
      const regCheck = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nom }),
      });
      const regData = await regCheck.json();

      if (!regCheck.ok || regData.error) {
        setError(regData.error || "Erreur lors de la validation de l'adresse e-mail");
        setLoading(false);
        return;
      }

      const assignedRole = regData.user?.role || "Lecteur";
      setRole(assignedRole);

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);

      // Send actual email dispatch
      await sendRealVerificationEmail(email, newOtp, nom);

      setShowVerificationStep(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Inscription Fermée</h1>
          <p className="text-slate-400 text-sm mb-6">La création de compte publique est désactivée pour des raisons de sécurité.</p>
          
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left mb-6">
            <p className="text-indigo-300 text-sm leading-relaxed">
              <strong>Vous êtes membre de l'entreprise ?</strong><br />
              Veuillez demander à votre Administrateur de vous créer un profil depuis l'onglet <em>Équipe & Rôles</em>. Vous recevrez ensuite un lien d'accès par e-mail avec vos identifiants.
            </p>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl p-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            Retourner à la connexion
          </button>
        </div>
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

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3.5 text-center">
              <div>
                <p className={`text-[12px] font-bold uppercase tracking-wider ${emailErrorDetails ? "text-red-400" : isRealSmtp ? "text-emerald-400" : "text-amber-400"}`}>
                  {sendingEmail 
                    ? "⏳ Envoi de l'email en cours..." 
                    : emailErrorDetails 
                    ? "⚠️ Échec de l'envoi de l'email" 
                    : isRealSmtp 
                    ? "✓ E-mail réellement envoyé via Gmail" 
                    : "ℹ️ E-mail de test généré (Ethereal)"}
                </p>
                <p className="text-[12.5px] text-slate-300 mt-1">
                  {emailSentStatus || `Code envoyé à ${email}`}
                </p>
              </div>

              {emailErrorDetails && (
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-[11px] text-red-300 text-left space-y-1">
                  <p className="font-semibold text-red-200">Détail de l'erreur :</p>
                  <p className="font-mono text-[10.5px] opacity-90 break-words">{emailErrorDetails}</p>
                </div>
              )}

              {isRealSmtp && !emailErrorDetails && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[11.5px] text-emerald-200 text-left flex items-start gap-2">
                  <span className="text-base">📌</span>
                  <div>
                    <span className="font-semibold">Vérifiez vos Spams !</span> Si l'e-mail n'apparaît pas dans votre boîte de réception principale d'ici 1 minute, consultez le dossier <strong>Courriers Indésirables / Spams</strong> ou <strong>Promotions</strong>.
                  </div>
                </div>
              )}

              {previewUrl && (
                <div className="pt-1">
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-[12.5px] font-bold text-indigo-300 hover:text-white transition-all shadow-md"
                  >
                    <span>📬</span> Ouvrir la boîte de réception virtuelle (Ethereal)
                  </a>
                </div>
              )}

              {/* Quick Dev / Test Helper Badge */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-1">
                <div className="text-left">
                  <span className="text-[10.5px] text-slate-400 block">Code OTP généré :</span>
                  <span className="font-mono text-sm font-black text-amber-400">
                    {generatedOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillOtp}
                  className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-[11px] font-semibold text-amber-300 transition-all flex items-center gap-1.5"
                >
                  {copiedOtp ? "✓ Rempli !" : "⚡ Remplir automatiquement"}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12.5px] font-semibold text-slate-300">Code de vérification OTP (6 chiffres) *</label>
                  <button
                    type="button"
                    disabled={sendingEmail}
                    onClick={() => sendRealVerificationEmail(email, generatedOtp, nom)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                  >
                    {sendingEmail ? "Envoi..." : "Renvoyer l'email"}
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
