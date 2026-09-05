import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, name } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Adresse email et code OTP requis" }, { status: 400 });
    }

// Cache transporter globally in Node memory to eliminate 3-second account creation latency
const g = global as any;

async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
    });
  }

  if (!g.cachedEmailTransporter) {
    const testAccount = await nodemailer.createTestAccount();
    g.cachedEmailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return g.cachedEmailTransporter;
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

    const senderEmail = process.env.SMTP_USER || 'no-reply@tadbir.ai';
    const info = await transporter.sendMail({
      from: `"Tadbir AI Security" <${senderEmail}>`,
      to: email,
      subject: `Code de vérification Tadbir AI : ${otp}`,
      text: `Bonjour ${recipientName},\n\nVotre code de vérification Tadbir AI est : ${otp}\n\nL'équipe Tadbir AI`,
      html: htmlTemplate,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return NextResponse.json({
      success: true,
      message: `Email de vérification envoyé avec succès à ${email}`,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    return NextResponse.json({
      error: "Erreur lors de l'envoi de l'email de vérification",
      details: error.message,
    }, { status: 500 });
  }
}
