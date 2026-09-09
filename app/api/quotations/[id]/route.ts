import { NextResponse } from 'next/server';
import { getQuotationById, deleteQuotation, updateQuotation } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const quotation = getQuotationById(params.id);
  if (quotation) return NextResponse.json(quotation);

  try {
    const res = await fetch(`${DJANGO_URL}/api/quotations/${params.id}/`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {}

  return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteQuotation(params.id);

  try {
    await fetch(`${DJANGO_URL}/api/quotations/${params.id}/`, { method: 'DELETE' });
  } catch (e) {}

  return NextResponse.json({ message: "Devis supprimé avec succès" });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const q = updateQuotation(params.id, {
      status: body.status || body.statut,
      total_amount: body.total_amount || body.montant,
      client_name: body.client_name || body.client,
      date: body.date
    });

    try {
      await fetch(`${DJANGO_URL}/api/quotations/${params.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: body.status || body.statut,
          total_amount: body.total_amount || body.montant,
        })
      });
    } catch (e) {}

    return NextResponse.json(q || { message: "Devis mis à jour" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du devis" }, { status: 500 });
  }
}
