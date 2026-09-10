import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    let emailSent = false;
    let lastMessageId = '';
    let methodUsed = '';
    const errors: string[] = [];

    // ============================================================
    // METHOD 1 (PRIMARY): Brevo REST API over HTTPS
    // This is the most reliable method from cloud environments like Railway.
    // It's a simple HTTPS POST — no SMTP port blocking, no TLS handshake timeouts.
    // ============================================================
    const brevoApiKey = process.env.BREVO_API_KEY || '';
    // IMPORTANT: Brevo only allows sending from verified senders.
    // The verified sender in this Brevo account is: maryamelosmani@gmail.com
    const brevoSenderEmail = process.env.BREVO_SENDER || 'maryamelosmani@gmail.com';

    if (brevoApiKey && !emailSent) {
      try {
        console.log(`[EMAIL] Attempting Brevo API to ${email}...`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            sender: { name: "Tadbir AI", email: brevoSenderEmail },
            to: [{ email: email, name: recipientName }],
            subject: `Votre code Tadbir AI : ${otp}`,
            htmlContent: htmlTemplate,
            textContent: plainText,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        const responseText = await response.text();
        console.log(`[EMAIL] Brevo response status=${response.status} body=${responseText}`);

        if (response.ok) {
          let resData: any = {};
          try { resData = JSON.parse(responseText); } catch {}
          emailSent = true;
          methodUsed = 'brevo-api';
          lastMessageId = resData.messageId || `brevo-${Date.now()}`;
          console.log(`[EMAIL] ✅ Brevo API SUCCESS. messageId=${lastMessageId}`);
        } else {
          errors.push(`Brevo API ${response.status}: ${responseText}`);
          console.error(`[EMAIL] ❌ Brevo API failed: ${response.status} ${responseText}`);
        }
      } catch (brevoErr: any) {
        const errMsg = brevoErr.name === 'AbortError' ? 'Brevo API timeout (15s)' : brevoErr.message;
        errors.push(`Brevo: ${errMsg}`);
        console.error(`[EMAIL] ❌ Brevo API error: ${errMsg}`);
      }
    }

    // ============================================================
    // METHOD 2 (FALLBACK): Gmail SMTP Port 587 (STARTTLS)
    // Increased timeouts to 30s to handle slow cloud DNS/TLS
    // ============================================================
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';

    if (!emailSent && smtpUser && smtpPass) {
      try {
        console.log(`[EMAIL] Attempting Gmail SMTP 587 to ${email}...`);
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: 587,
          secure: false,
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const info = await transporter.sendMail({
          from: `"Tadbir AI" <${smtpUser}>`,
          to: email,
          subject: `Votre code Tadbir AI : ${otp}`,
          html: htmlTemplate,
          text: plainText,
        });

        console.log(`[EMAIL] ✅ Gmail SMTP 587 SUCCESS: ${info.response}`);
        emailSent = true;
        methodUsed = 'smtp-587';
        lastMessageId = info.messageId || `smtp587-${Date.now()}`;
      } catch (smtpErr: any) {
        errors.push(`SMTP 587: ${smtpErr.message}`);
        console.error(`[EMAIL] ❌ Gmail SMTP 587 failed: ${smtpErr.message}`);
      }
    }

    // ============================================================
    // METHOD 3 (LAST RESORT): Gmail SMTP Port 465 (SSL)
    // ============================================================
    if (!emailSent && smtpUser && smtpPass) {
      try {
        console.log(`[EMAIL] Attempting Gmail SMTP 465 SSL to ${email}...`);
        const transporterSSL = nodemailer.createTransport({
          host: smtpHost,
          port: 465,
          secure: true,
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const infoSSL = await transporterSSL.sendMail({
          from: `"Tadbir AI" <${smtpUser}>`,
          to: email,
          subject: `Votre code Tadbir AI : ${otp}`,
          html: htmlTemplate,
          text: plainText,
        });

        console.log(`[EMAIL] ✅ Gmail SMTP 465 SUCCESS: ${infoSSL.response}`);
        emailSent = true;
        methodUsed = 'smtp-465';
        lastMessageId = infoSSL.messageId || `smtp465-${Date.now()}`;
      } catch (sslErr: any) {
        errors.push(`SMTP 465: ${sslErr.message}`);
        console.error(`[EMAIL] ❌ Gmail SMTP 465 failed: ${sslErr.message}`);
      }
    }

    // ============================================================
    // RESPONSE
    // ============================================================
    if (emailSent) {
      console.log(`[EMAIL] ✅ FINAL: Email delivered via ${methodUsed} to ${email}`);
      return NextResponse.json({
        success: true,
        message: `Code de vérification expédié à ${email}`,
        isRealSmtp: true,
        otp: otp,
        messageId: lastMessageId,
        method: methodUsed,
      });
    } else {
      // ALL methods failed — return the OTP anyway so the user isn't blocked,
      // but log clearly that delivery failed
      console.error(`[EMAIL] ❌ ALL METHODS FAILED for ${email}. Errors: ${errors.join(' | ')}`);
      return NextResponse.json({
        success: true,
        message: `Code prêt (utilisez le bouton "Insérer le code" si l'e-mail n'arrive pas)`,
        isRealSmtp: false,
        otp: otp,
        errors: errors,
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
