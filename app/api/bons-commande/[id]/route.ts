import { NextResponse } from 'next/server';
import { getBonCommandeById, updateBonCommande, deleteBonCommande } from '@/lib/mock-data-store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const bon = getBonCommandeById(params.id);
  if (!bon) return NextResponse.json({ error: "Bon de commande introuvable" }, { status: 404 });
  return NextResponse.json(bon);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const bon = updateBonCommande(params.id, body);
    if (!bon) return NextResponse.json({ error: "Bon de commande introuvable" }, { status: 404 });
    return NextResponse.json(bon);
  } catch (error) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const deleted = deleteBonCommande(params.id);
  if (!deleted) return NextResponse.json({ error: "Bon de commande introuvable" }, { status: 404 });
  return NextResponse.json({ message: "Bon de commande supprimé" });
}
