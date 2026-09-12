import { NextResponse } from 'next/server';
import { getInvoicesByOrg, addInvoice, DEFAULT_ORG_ID } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function extractOrgId(req: Request): string | null {
  const headerOrg = req.headers.get('x-organization-id');
  if (headerOrg) return headerOrg;

  const url = new URL(req.url);
  const paramOrg = url.searchParams.get('organization_id') || url.searchParams.get('company');
  if (paramOrg) return paramOrg;

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/x-organization-id=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  return null;
}

export async function GET(req: Request) {
  const orgId = extractOrgId(req);
  const localList = getInvoicesByOrg(orgId);

  // Return filtered local list
  if (localList && localList.length >= 0) {
    return NextResponse.json(localList);
  }

  // Fallback to live backend if local list isn't initialized
  try {
    const headers: Record<string, string> = {};
    if (orgId) headers['x-organization-id'] = orgId;
    const res = await fetch(`${DJANGO_URL}/api/invoices/`, { headers, cache: 'no-store' });
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
    const orgId = extractOrgId(req) || body.organization_id || body.company || DEFAULT_ORG_ID;

    // 1. Create in local store with organization affiliation
    const localInvoice = addInvoice({
      invoice_number: body.invoice_number || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: body.client_name || body.client || "Client",
      status: body.status || body.statut || "Brouillon",
      total_amount: Number(body.total_amount || body.montant) || 0,
      date: body.date || new Date().toISOString().split("T")[0],
      lignes: body.lignes || [],
      organization_id: orgId,
      company: orgId,
    });

    // 2. Sync asynchronously with Django backend
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (orgId) headers['x-organization-id'] = orgId;

      const compRes = await fetch(`${DJANGO_URL}/api/organizations/`, { headers });
      const compData = await compRes.json();
      const orgList = Array.isArray(compData) ? compData : (compData.results || []);
      const matchedOrg = orgList.find((o: any) => o.id === orgId) || orgList[0];
      const targetOrgId = matchedOrg ? matchedOrg.id : null;

      const cliRes = await fetch(`${DJANGO_URL}/api/clients/`, { headers });
      const cliData = await cliRes.json();
      const cliList = Array.isArray(cliData) ? cliData : (cliData.results || []);
      const clientId = cliList.length > 0 ? cliList[0].id : null;

      if (targetOrgId && clientId) {
        const djangoPayload = {
          organisation: targetOrgId,
          client: clientId,
          invoice_number: localInvoice.invoice_number,
          issue_date: localInvoice.date,
          status: localInvoice.status,
          subtotal: localInvoice.total_amount,
          total_amount: localInvoice.total_amount,
        };

        await fetch(`${DJANGO_URL}/api/invoices/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(djangoPayload),
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
