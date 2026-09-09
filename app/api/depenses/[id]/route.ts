import { NextResponse } from 'next/server';
import { updateDepense, deleteDepense } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = updateDepense(params.id, body);

    try {
      await fetch(`${DJANGO_URL}/api/expenses/${params.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {}

    return NextResponse.json(updated || { message: "Dépense mise à jour" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteDepense(params.id);

  try {
    await fetch(`${DJANGO_URL}/api/expenses/${params.id}/`, { method: 'DELETE' });
  } catch (e) {}

  return NextResponse.json({ message: "Dépense supprimée" });
}
