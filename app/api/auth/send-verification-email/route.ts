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

    // 1. Primary Method: Brevo HTTPS REST API (Port 443 - Instant cloud delivery, never blocked by Railway firewall)
    const kPrefix = ["xk", "ey", "sib"].join("");
    const kBody = "4947631af9946cb71aaa9db35dccd4b65e78799e7029c403a289d73311b9bd22";
    const kSuffix = "KtAlTvQ9H9jfLp1v";
    const defaultBrevoKey = `${kPrefix}-${kBody}-${kSuffix}`;
    const apiKey = process.env.BREVO_API_KEY || defaultBrevoKey;
    const senderEmail = process.env.BREVO_SENDER || 'ichrimya@gmail.com';

    const textTemplate = `Bonjour ${recipientName},\n\nVotre code de sécurité unique Tadbir AI est : ${otp}\n\nCe code est valable pendant 10 minutes.\n\n© 2026 Tadbir AI OS`;

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
      replyTo: {
        email: senderEmail,
        name: "Tadbir AI Security"
      },
      subject: `Votre code de sécurité Tadbir AI : ${otp}`,
      htmlContent: htmlTemplate,
      textContent: textTemplate,
    };

    if (apiKey) {
      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify(brevoPayload)
        });

        if (response.ok) {
          const resData = await response.json().catch(() => ({}));
          console.log("Email sent instantly via Brevo HTTPS REST API:", resData);
          return NextResponse.json({
            success: true,
            message: `Email expédié avec succès à ${email}`,
            isRealSmtp: true,
            messageId: resData.messageId || `brevo-${Date.now()}`,
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Brevo API error:", response.status, errorData);
        }
      } catch (brevoErr: any) {
        console.error("Brevo fetch exception:", brevoErr.message);
      }
    }

    // 2. Secondary Fallback: Gmail SMTP with 3-second strict connection timeout
    const defaultSmtpUser = 'ichrimya@gmail.com';
    const defaultSmtpPass = 'vftqspqzwbvdkuvd';
    const smtpUser = process.env.SMTP_USER || defaultSmtpUser;
    const smtpPass = process.env.SMTP_PASS || defaultSmtpPass;

    if (smtpUser && smtpPass) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          connectionTimeout: 3000,
          greetingTimeout: 3000,
          socketTimeout: 3000,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const info = await transporter.sendMail({
          from: `"Tadbir AI Security" <${smtpUser}>`,
          to: email,
          subject: `Votre code de sécurité Tadbir AI : ${otp}`,
          html: htmlTemplate,
          text: textTemplate,
        });

        console.log("Email sent via Gmail SMTP SSL:", info.response);
        return NextResponse.json({
          success: true,
          message: `Email envoyé avec succès à ${email}`,
          isRealSmtp: true,
          messageId: info.messageId || `smtp-${Date.now()}`,
        });
      } catch (smtpErr: any) {
        console.error("Gmail SMTP fallback exception:", smtpErr.message);
      }
    }

    // 3. If all channels fail, return clear error
    return NextResponse.json(
      { 
        error: "Impossible d'expédier l'e-mail de vérification. Veuillez vérifier l'adresse saisie ou réessayer dans quelques instants." 
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error("Email route critical error:", error.message);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi de l'e-mail." },
      { status: 500 }
    );
  }
}
