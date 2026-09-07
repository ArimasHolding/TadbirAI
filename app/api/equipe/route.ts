import { NextResponse } from 'next/server';
import { getEquipe, addEquipe, updateEquipe, deleteEquipe, bulkDeleteEquipe } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getEquipe());
}

export async function POST(req: Request) {
  try {
    const roleHeader = req.headers.get("x-user-role");
    if (roleHeader && !["Administrateur", "Admin"].includes(roleHeader)) {
      return NextResponse.json(
        { error: "Accès refusé (403 Forbidden). Seul un Administrateur peut modifier les rôles ou inviter un membre d'équipe." },
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json().catch(() => ({}));
    
    if (id) {
      deleteEquipe(id);
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


