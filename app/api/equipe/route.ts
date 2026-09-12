import { NextResponse } from 'next/server';
import { getEquipe, addEquipe, updateEquipe, deleteEquipe, bulkDeleteEquipe, addUser, findUserByEmail } from '@/lib/data-store';
import { getBrevoApiKey, getBrevoSenderEmail } from '@/lib/email-config';

export const dynamic = 'force-dynamic';

function isAdmin(req: Request): boolean {
  const roleHeader = req.headers.get("x-user-role");
  const emailHeader = req.headers.get("x-user-email")?.trim().toLowerCase();
  
  if (roleHeader === "Administrateur" || roleHeader === "Admin") return true;

  if (emailHeader) {
    const equipe = getEquipe();
    const member = equipe.find((m: any) => m.email?.trim().toLowerCase() === emailHeader);
    if (member && (member.role === "Administrateur" || member.role === "Admin") && member.statut !== "Suspendu") {
      return true;
    }
  }

  // Fallback: If no headers sent in internal server requests, allow execution
  if (!roleHeader && !emailHeader) {
    return true;
  }

  return false;
}

export async function GET() {
  return NextResponse.json(getEquipe());
}

export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: "Accès refusé (403). Seul un Administrateur peut inviter de nouveaux membres." },
        { status: 403 }
      );
    }

    const body = await req.json();
    body.statut = "Invité";
    const created = addEquipe(body);

    // Send invitation email via Brevo REST API
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour des rôles d'équipe" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Accès refusé. Seul un Administrateur peut modifier." }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ error: "ID membre requis" }, { status: 400 });
    }
    const updated = updateEquipe(id, patch);
    return NextResponse.json(updated || { success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du membre" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Accès refusé. Seul un Administrateur peut supprimer." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    let body: any = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {}
    
    if (id) {
      deleteEquipe(id);
      return NextResponse.json({ success: true });
    } else if (body.id) {
      deleteEquipe(body.id);
      return NextResponse.json({ success: true });
    } else if (body.ids && Array.isArray(body.ids)) {
      bulkDeleteEquipe(body.ids);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "ID requis pour la suppression" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
