import { NextResponse } from 'next/server';
import { updateAvoir, deleteAvoir } from '@/lib/mock-data-store';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = updateAvoir(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteAvoir(params.id);
  return NextResponse.json({ message: "Avoir supprimé" });
}
