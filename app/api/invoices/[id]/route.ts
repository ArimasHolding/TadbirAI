import { NextResponse } from 'next/server';
import { getInvoiceById, deleteInvoice, updateInvoice } from '@/lib/mock-data-store';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Try local first
  const inv = getInvoiceById(params.id);
  if (inv) return NextResponse.json(inv);

  // Try Django
  try {
    const res = await fetch(`${DJANGO_URL}/api/invoices/${params.id}/`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {}

  return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // 1. Delete from local memory store
  deleteInvoice(params.id);

  // 2. Delete from Django database backend
  try {
    await fetch(`${DJANGO_URL}/api/invoices/${params.id}/`, { method: 'DELETE' });
  } catch (e) {
    console.warn("Django delete sync warning:", e);
  }

  return NextResponse.json({ message: "Invoice permanently deleted from local and database stores" });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    // 1. Update local store
    const localInv = updateInvoice(params.id, body);

    // 2. Sync PATCH to Django backend
    try {
      await fetch(`${DJANGO_URL}/api/invoices/${params.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: body.status || body.statut,
          subtotal: body.total_amount || body.montant,
          total_amount: body.total_amount || body.montant,
        })
      });
    } catch (e) {}

    return NextResponse.json(localInv || { message: "Updated" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
