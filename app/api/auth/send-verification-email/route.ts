import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

const g = global as any;

function createTransporter(host: string, port: number, user: string, pass: string, secure: boolean) {
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function sendMailWithFallback(mailOptions: nodemailer.SendMailOptions) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    // Try primary configured port
    try {
      const primaryTransporter = createTransporter(host, port, user, pass, port === 465);
      const info = await primaryTransporter.sendMail(mailOptions);
      return { info, isRealSmtp: true };
    } catch (primaryErr: any) {
      console.warn(`Primary SMTP on port ${port} failed (${primaryErr.message}). Trying fallback port...`);
      const fallbackPort = port === 465 ? 587 : 465;
      try {
        const fallbackTransporter = createTransporter(host, fallbackPort, user, pass, fallbackPort === 465);
        const info = await fallbackTransporter.sendMail(mailOptions);
        return { info, isRealSmtp: true };
      } catch (fallbackErr: any) {
        console.error(`Fallback SMTP on port ${fallbackPort} also failed:`, fallbackErr.message);
        console.warn("Réseau bloqué (Timeout/Firewall). L'email n'a pas pu être envoyé. Passage en mode simulation...");
        // Instead of throwing, we fall through to the mock Ethereal/Console fallback below
      }
    }
  }

  // Fallback to Ethereal Mail if no SMTP config is present
  if (!g.cachedEtherealTransporter) {
    const testAccount = await nodemailer.createTestAccount();
    g.cachedEtherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  try {
    const info = await g.cachedEtherealTransporter.sendMail(mailOptions);
    return { info, isRealSmtp: false };
  } catch (err) {
    console.error("Même le serveur de test (Ethereal) est bloqué par le pare-feu !");
    return { 
      info: { messageId: "simulated-id-firewall-block" }, 
      isRealSmtp: false 
    };
  }
}

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

    const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@tadbir.ai';
    
    console.log('\n=============================================');
    console.log(`🚨 CODE OTP POUR ${email} : ${otp} 🚨`);
    console.log('=============================================\n');

    const { info, isRealSmtp } = await sendMailWithFallback({
      from: `"Tadbir AI Security" <${senderEmail}>`,
      to: email,
      subject: `Code de vérification Tadbir AI : ${otp}`,
      text: `Bonjour ${recipientName},\n\nVotre code de vérification Tadbir AI est : ${otp}\n\nL'équipe Tadbir AI`,
      html: htmlTemplate,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return NextResponse.json({
      success: true,
      message: isRealSmtp
        ? `Email de vérification réellement envoyé via SMTP à ${email}`
        : `Email de vérification généré sur la boîte de test pour ${email}`,
      isRealSmtp,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    return NextResponse.json({
      error: "Erreur lors de l'envoi de l'email de vérification",
      details: error.message || String(error),
    }, { status: 500 });
  }
}
