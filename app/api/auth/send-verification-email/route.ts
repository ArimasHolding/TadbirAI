import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, name } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Adresse email et code OTP requis" }, { status: 400 });
    }

    const recipientName = name || email.split('@')[0];

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 30px; }
            .card { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
            .logo { font-size: 22px; font-weight: 900; color: #ffffff; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
            .logo span { color: #6366f1; }
            .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; text-align: center; }
            .subtitle { font-size: 13px; color: #94a3b8; margin-bottom: 24px; text-align: center; line-height: 1.5; }
            .otp-box { background: #0f172a; border: 2px solid #6366f1; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 24px; }
            .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #818cf8; }
            .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; border-t: 1px solid #334155; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">Tadbir <span>AI</span></div>
            <div class="title">Vérification de votre compte</div>
            <div class="subtitle">Bonjour ${recipientName},<br/>Voici votre code de sécurité unique pour valider votre inscription sur la plateforme <strong>Tadbir AI</strong>.</div>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>

            <p style="font-size: 12px; color: #cbd5e1; text-align: center;">Ce code est valable pendant 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet e-mail.</p>

            <div class="footer">
              © 2026 Tadbir AI OS · Système de Gestion Financière Intelligente
            </div>
          </div>
        </body>
      </html>
    `;

    // We use the Brevo API key from the environment variables for security.
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
      console.error("BREVO_API_KEY is missing!");
      return NextResponse.json({ error: "Configuration email manquante" }, { status: 500 });
    }
    
    // We send from the Gmail address you verified in Brevo
    const senderEmail = process.env.EMAIL_USER || 'ichrimya@gmail.com';

    const brevoPayload = {
      sender: {
        name: "Tadbir AI Security",
        email: senderEmail
      },
      to: [
        {
          email: email,
          name: recipientName
        }
      ],
      subject: `Code de vérification Tadbir AI : ${otp}`,
      htmlContent: htmlTemplate,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(brevoPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
      throw new Error(`Erreur API Brevo: ${errorData.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Email de vérification réellement envoyé via Brevo API à ${email}`,
      isRealSmtp: true,
      messageId: `brevo-${Date.now()}`,
    });

  } catch (error: any) {
    console.error("Brevo API delivery error:", error.message);
    // Graceful fallback: Still allow user to register via the UI fallback code
    return NextResponse.json({
      success: true,
      message: "Code OTP prêt pour validation (Mode de secours réseau)",
      isRealSmtp: false,
      simulated: true,
      messageId: `fallback-${Date.now()}`,
      notice: "Échec de l'envoi via Brevo. Le code OTP généré ci-dessous permet de valider votre compte.",
    });
  }
}
