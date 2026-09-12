import { NextResponse } from 'next/server';
import { getBrevoApiKey, getBrevoSenderEmail } from '@/lib/email-config';
import { fetchAPI } from '@/lib/api';

export const dynamic = 'force-dynamic';
const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxyToDjango(req: Request, endpoint: string, method: string = 'GET', customBody?: any) {
  try {
    const url = new URL(req.url);
    const targetUrl = DJANGO_URL + endpoint;

    const headers = new Headers(req.headers);
    headers.set('host', new URL(DJANGO_URL).host);

    const options: RequestInit = {
      method,
      headers,
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

    // 2. Send invitation email via Brevo REST API
    try {
      const brevoApiKey = getBrevoApiKey();
      const senderEmail = getBrevoSenderEmail();
      const memberName = body.nom || body.name || "Collaborateur";
      const memberRole = body.role || "Membre";

      const reqUrl = new URL(req.url);
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || reqUrl.host;
      const proto = req.headers.get("x-forwarded-proto") || (reqUrl.protocol ? reqUrl.protocol.replace(":", "") : "https");
      const baseUrl = req.headers.get("origin") || `${proto}://${host}`;
      const registerUrl = `${baseUrl.replace(/\/$/, "")}/register?email=${encodeURIComponent(body.email)}`;

      if (body.email) {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Tadbir AI", email: senderEmail },
            to: [{ email: body.email, name: memberName }],
            subject: `Invitation à rejoindre Tadbir AI (${memberRole})`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #334155;">
                <h1 style="color: #ffffff; font-size: 22px; text-align: center; margin-bottom: 20px;">Tadbir <span style="color: #6366f1;">AI</span></h1>
                <h2 style="color: #ffffff; font-size: 18px; text-align: center;">Invitation à rejoindre l'équipe</h2>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">Bonjour <strong>${memberName}</strong>,</p>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  Vous avez été invité(e) à rejoindre la plateforme <strong>Tadbir AI</strong> avec le rôle de <strong>${memberRole}</strong>.
                </p>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  Pour activer votre compte et définir votre mot de passe personnel, rendez-vous dès maintenant sur la page d'inscription :
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${registerUrl}" style="background: #6366f1; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                    Créer mon mot de passe
                  </a>
                </div>
                <p style="color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #334155; padding-top: 16px;">
                  © 2026 Tadbir AI OS · Système de Gestion Financière Intelligente
                </p>
              </div>
            `,
            textContent: `Bonjour ${memberName},\n\nVous avez été invité(e) à rejoindre Tadbir AI avec le rôle ${memberRole}.\n\nVeuillez créer votre compte sur ${registerUrl} pour définir votre mot de passe personnel.\n\n© 2026 Tadbir AI`,
          }),
        });
      }
    } catch (emailErr) {
      console.error("[EQUIPE EMAIL] Error sending invitation email:", emailErr);
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
