import { NextResponse } from 'next/server';
import { getInvoices, addInvoice } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
  const localList = getInvoices();
  
  // Return local list as single source of truth for fast, synced operations
  if (localList && localList.length >= 0) {
    return NextResponse.json(localList);
  }

  // Fallback to live backend if local list isn't initialized
  try {
    const res = await fetch(`${DJANGO_URL}/api/invoices/`, { cache: 'no-store' });
    if (res.ok) {
      const djangoData = await res.json();
      const djangoList = Array.isArray(djangoData) ? djangoData : (djangoData.results || []);
      return NextResponse.json(djangoList);
    }
  } catch (error) {
    console.warn("Django backend invoices offline, using local data store");
  }

  return NextResponse.json([]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Create in local store first (guaranteed instant addition)
    const localInvoice = addInvoice({
      invoice_number: body.invoice_number || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: body.client_name || body.client || "Client",
      status: body.status || body.statut || "Brouillon",
      total_amount: Number(body.total_amount || body.montant) || 0,
      date: body.date || new Date().toISOString().split("T")[0],
      lignes: body.lignes || []
    });

    // 2. Sync asynchronously with Django backend
    try {
      const compRes = await fetch(`${DJANGO_URL}/api/companies/`);
      const compData = await compRes.json();
      const companyId = compData.length > 0 ? compData[0].id : null;

      const cliRes = await fetch(`${DJANGO_URL}/api/clients/`);
      const cliData = await cliRes.json();
      const clientId = cliData.length > 0 ? cliData[0].id : null;

      if (companyId && clientId) {
        const djangoPayload = {
          company: companyId,
          client: clientId,
          invoice_number: localInvoice.invoice_number,
          issue_date: localInvoice.date,
          status: localInvoice.status,
          subtotal: localInvoice.total_amount,
          total_amount: localInvoice.total_amount,
        };

        await fetch(`${DJANGO_URL}/api/invoices/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(djangoPayload)
        });
      }
    } catch (e) {
      // Async sync fail ignored
    }

    return NextResponse.json(localInvoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la facture" }, { status: 500 });
  }
}
