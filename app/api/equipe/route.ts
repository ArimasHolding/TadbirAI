import { NextResponse } from 'next/server';
import { getEquipe, addEquipe } from '@/lib/data-store';

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

