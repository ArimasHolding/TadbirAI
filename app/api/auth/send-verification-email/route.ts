import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSmtpCredentials, getBrevoSenderEmail, getBrevoSenderName, getOauth2Credentials } from '@/lib/email-config';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let otp = '';
  try {
    const body = await req.json();
    const { email, otp: bodyOtp, name } = body;
    otp = bodyOtp || '';

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
            .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
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

    const plainText = `Bonjour ${recipientName},\n\nVotre code de sécurité Tadbir AI est : ${otp}\n\nCe code est valable pendant 10 minutes.\n\n© 2026 Tadbir AI OS`;

    const { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass } = getSmtpCredentials();
    const { clientId, clientSecret, refreshToken } = getOauth2Credentials();
    const senderEmail = smtpUser || getBrevoSenderEmail();
    const senderName = getBrevoSenderName();

    if (!smtpUser) {
       console.error("[EMAIL] Missing SMTP credentials");
       // fallback for dev mode
       return NextResponse.json({
         success: true,
         message: "Configuration manquante (mode dev)",
         isRealSmtp: false,
         otp: otp,
       });
    }

    let authConfig: any = { user: smtpUser, pass: smtpPass };
    
    // Switch to OAuth2 if tokens are provided
    if (clientId && clientSecret && refreshToken) {
      authConfig = {
        type: 'OAuth2',
        user: smtpUser,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
      };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: authConfig,
    });

    try {
      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: `Votre code Tadbir AI : ${otp}`,
        html: htmlTemplate,
        text: plainText,
      });

      return NextResponse.json({
        success: true,
        message: `Code de vérification expédié à ${email}`,
        isRealSmtp: true,
        otp: otp,
        messageId: info.messageId,
        method: 'smtp-brevo',
      });

    } catch (smtpErr: any) {
      console.error(`[EMAIL] ❌ SMTP send failed: ${smtpErr.message}`);
      return NextResponse.json({
        success: true,
        message: `Code prêt (échec de l'envoi email)`,
        isRealSmtp: false,
        otp: otp,
        errors: [smtpErr.message],
        fallback: true,
      });
    }

  } catch (error: any) {
    console.error("[EMAIL] CRITICAL ERROR:", error.message);
    return NextResponse.json({
      success: true,
      message: "Code prêt pour validation",
      isRealSmtp: false,
      otp: otp,
    });
  }
}
