import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  getBrevoApiKey,
  getBrevoSenderEmail,
  getBrevoSenderName,
  getEmailReplyTo,
  getSmtpCredentials,
} from '@/lib/email-config';
import { fetchAPI } from '@/lib/api';

export const dynamic = 'force-dynamic';
const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxyToDjango(req: Request, endpoint: string, method: string = 'GET', customBody?: any) {
  try {
    const url = new URL(req.url);
    const targetUrl = DJANGO_URL + endpoint + url.search;

    const headers = new Headers(req.headers);
    headers.set('host', new URL(DJANGO_URL).host);

    const options: RequestInit = {
      method,
      headers,
      cache: 'no-store',
    };

    if (customBody) {
      options.body = JSON.stringify(customBody);
    } else if (method !== 'GET' && method !== 'HEAD') {
      const clonedReq = req.clone();
      options.body = await clonedReq.arrayBuffer();
    }

    const response = await fetch(targetUrl, options);
    const arrayBuffer = await response.arrayBuffer();
    
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    
    return new NextResponse(arrayBuffer, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error: any) {
    console.error(`[Next.js API Proxy] Error proxying to ${endpoint}:`, error);
    return NextResponse.json(
      { error: "Le serveur backend est injoignable.", details: error.message },
      { status: 503 }
    );
  }
}

export async function GET(req: Request) {
  return proxyToDjango(req, '/api/users/');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Call Django to create the invited user
    let targetUrl = "";
    try {
      targetUrl = new URL("/api/auth/invite/", DJANGO_URL).toString();
    } catch(e) {
      console.error("[EQUIPE] Configuration URL invalide:", DJANGO_URL);
      return NextResponse.json({error: "Vérifiez la variable NEXT_PUBLIC_API_URL: " + DJANGO_URL}, {status:500});
    }
    const headers = new Headers(req.headers);
    headers.set('host', new URL(DJANGO_URL).host);
    headers.set('content-type', 'application/json');

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    // 2. Send invitation email via Brevo REST API or fallback to Nodemailer SMTP
    try {
      const brevoApiKey = getBrevoApiKey();
      const senderEmail = getBrevoSenderEmail();
      const senderName = getBrevoSenderName();
      const replyTo = getEmailReplyTo();
      const memberName = body.nom || body.name || "Collaborateur";
      const memberRole = body.role || "Membre";

      const reqUrl = new URL(req.url);
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || reqUrl.host;
      const proto = req.headers.get("x-forwarded-proto") || (reqUrl.protocol ? reqUrl.protocol.replace(":", "") : "https");
      const baseUrl = req.headers.get("origin") || `${proto}://${host}`;
      const registerUrl = `${baseUrl.replace(/\/$/, "")}/register?email=${encodeURIComponent(body.email)}`;

      if (body.email) {
        const htmlTemplate = `
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>Invitation à rejoindre Tadbir AI</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
                .card { max-width: 550px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
                .logo { font-size: 22px; font-weight: 900; color: #ffffff; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
                .logo span { color: #6366f1; }
                .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 16px; text-align: center; }
                .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
                .btn-container { text-align: center; margin: 30px 0; }
                .btn { background: #6366f1; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; }
                .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="logo">Tadbir <span>AI</span></div>
                <div class="title">Invitation à rejoindre l'équipe</div>
                <p class="text">Bonjour <strong>${memberName}</strong>,</p>
                <p class="text">
                  Vous avez été invité(e) à rejoindre la plateforme <strong>Tadbir AI</strong> avec le rôle de <strong>${memberRole}</strong>.
                </p>
                <p class="text">
                  Pour activer votre compte et définir votre mot de passe personnel, rendez-vous dès maintenant sur la page d'inscription :
                </p>
                <div class="btn-container">
                  <a href="${registerUrl}" class="btn">Créer mon mot de passe</a>
                </div>
                <p style="font-size: 12px; color: #64748b; word-break: break-all;">
                  Lien direct : <a href="${registerUrl}" style="color: #818cf8;">${registerUrl}</a>
                </p>
                <div class="footer">
                  © 2026 Tadbir AI OS · Système de Gestion Financière Intelligente
                </div>
              </div>
            </body>
          </html>
        `;

        const plainText = `Bonjour ${memberName},\n\nVous avez été invité(e) à rejoindre Tadbir AI avec le rôle : ${memberRole}.\n\nVeuillez créer votre compte sur le lien suivant pour définir votre mot de passe personnel :\n${registerUrl}\n\n© 2026 Tadbir AI OS`;

        let emailSent = false;
        let emailMessageId = "";
        let methodUsed = "";
        const deliveryErrors: string[] = [];

        // --- METHOD 1 (PRIMARY): Brevo REST API over HTTPS with 15s timeout ---
        if (brevoApiKey) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          try {
            console.log(`[EQUIPE EMAIL] Attempting Brevo API dispatch to ${body.email}...`);
            const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                "accept": "application/json",
                "api-key": brevoApiKey,
                "content-type": "application/json",
              },
              body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: body.email, name: memberName }],
                replyTo: replyTo,
                subject: `Invitation à rejoindre Tadbir AI (${memberRole})`,
                htmlContent: htmlTemplate,
                textContent: plainText,
                tags: ["team-invitation"],
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const brevoStatus = brevoRes.status;
            const brevoStatusText = brevoRes.statusText;
            const resText = await brevoRes.text();

            if (brevoRes.ok) {
              let resJson: any = {};
              try {
                resJson = JSON.parse(resText);
              } catch {}
              emailSent = true;
              methodUsed = "brevo-api";
              emailMessageId = resJson.messageId || `brevo-${Date.now()}`;
              console.log(
                `[EQUIPE EMAIL] ✅ Brevo API SUCCESS: status=${brevoStatus} recipient=${body.email} messageId=${emailMessageId}`
              );
            } else {
              console.error(
                `[EQUIPE EMAIL] ❌ Brevo API FAILED: status=${brevoStatus} (${brevoStatusText}) recipient=${body.email} body=${resText}`
              );
              deliveryErrors.push(`Brevo API ${brevoStatus}: ${resText}`);
            }
          } catch (brevoErr: any) {
            clearTimeout(timeoutId);
            const errMsg =
              brevoErr.name === "AbortError" ? "Brevo API timeout (15s)" : brevoErr.message;
            console.error(`[EQUIPE EMAIL] ❌ Brevo API exception: recipient=${body.email} error=${errMsg}`);
            deliveryErrors.push(`Brevo: ${errMsg}`);
          }
        }

        // --- METHOD 2 (FALLBACK): Nodemailer SMTP Port 587 (STARTTLS) ---
        const { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass } = getSmtpCredentials();
        if (!emailSent && smtpUser && smtpPass) {
          try {
            console.log(`[EQUIPE EMAIL] Attempting SMTP port 587 fallback to ${body.email}...`);
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
              from: `"${senderName}" <${smtpUser}>`,
              to: body.email,
              replyTo: replyTo.email,
              subject: `Invitation à rejoindre Tadbir AI (${memberRole})`,
              html: htmlTemplate,
              text: plainText,
            });

            emailSent = true;
            methodUsed = "smtp-587";
            emailMessageId = info.messageId || `smtp587-${Date.now()}`;
            console.log(`[EQUIPE EMAIL] ✅ SMTP 587 SUCCESS to ${body.email}: messageId=${emailMessageId}`);
          } catch (smtpErr: any) {
            console.error(`[EQUIPE EMAIL] ❌ SMTP 587 fallback failed for ${body.email}: ${smtpErr.message}`);
            deliveryErrors.push(`SMTP 587: ${smtpErr.message}`);
          }
        }

        // --- METHOD 3 (LAST RESORT): Nodemailer SMTP Port 465 (SSL) ---
        if (!emailSent && smtpUser && smtpPass) {
          try {
            console.log(`[EQUIPE EMAIL] Attempting SMTP port 465 SSL fallback to ${body.email}...`);
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
              from: `"${senderName}" <${smtpUser}>`,
              to: body.email,
              replyTo: replyTo.email,
              subject: `Invitation à rejoindre Tadbir AI (${memberRole})`,
              html: htmlTemplate,
              text: plainText,
            });

            emailSent = true;
            methodUsed = "smtp-465";
            emailMessageId = infoSSL.messageId || `smtp465-${Date.now()}`;
            console.log(`[EQUIPE EMAIL] ✅ SMTP 465 SUCCESS to ${body.email}: messageId=${emailMessageId}`);
          } catch (sslErr: any) {
            console.error(`[EQUIPE EMAIL] ❌ SMTP 465 fallback failed for ${body.email}: ${sslErr.message}`);
            deliveryErrors.push(`SMTP 465: ${sslErr.message}`);
          }
        }

        // --- RESULT REPORTING ---
        if (emailSent) {
          data.email_sent = true;
          data.email_message_id = emailMessageId;
          data.email_method = methodUsed;
        } else {
          data.email_sent = false;
          data.email_error =
            "L'invitation a été enregistrée, mais l'envoi de l'e-mail a échoué après plusieurs tentatives (Brevo et SMTP).";
          data.email_details = deliveryErrors;
        }
      }
    } catch (emailErr: any) {
      console.error("[EQUIPE EMAIL] Unexpected error sending invitation email:", emailErr);
      data.email_sent = false;
      data.email_error =
        "Erreur inattendue lors de l'expédition de l'e-mail d'invitation.";
      data.email_details = [emailErr.message || String(emailErr)];
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'invitation" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    return proxyToDjango(req, `/api/users/${id}/`, 'PUT');
  } else {
    // If ID is in body
    try {
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      if (body.id) {
        return proxyToDjango(req, `/api/users/${body.id}/`, 'PUT', body);
      }
    } catch (e) {}
  }
  return proxyToDjango(req, '/api/users/', 'PUT');
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    return proxyToDjango(req, `/api/users/${id}/`, 'DELETE');
  }
  return NextResponse.json({ error: "ID manquant" }, { status: 400 });
}
