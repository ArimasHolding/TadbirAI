import { NextResponse } from 'next/server';
import { getEquipe, addEquipe, updateEquipe, deleteEquipe, bulkDeleteEquipe } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

function isAdmin(req: Request): boolean {
  const roleHeader = req.headers.get("x-user-role");
  const emailHeader = req.headers.get("x-user-email");
  // Allow any Administrateur role, OR the master admin email as a fallback
  if (roleHeader === "Administrateur") return true;
  const masterAdmin = process.env.EMAIL_USER || "maryamelosmani@gmail.com";
  if (emailHeader && emailHeader.toLowerCase() === masterAdmin.toLowerCase()) return true;
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
    const created = addEquipe(body);
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
