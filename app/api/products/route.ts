import { NextResponse } from 'next/server';
import { getProductsByOrg, addProduct, bulkDeleteProducts, DEFAULT_ORG_ID } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

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
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');

  let products = getProductsByOrg(orgId);
  if (search) {
    const query = search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
    );
  }
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orgId = extractOrgId(req) || body.organization_id || body.company || DEFAULT_ORG_ID;
    const created = addProduct({
      ...body,
      organization_id: orgId,
      company: orgId,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body?.ids) ? body.ids : (body?.id ? [body.id] : []);
    if (ids.length === 0) {
      return NextResponse.json({ error: "Aucun identifiant fourni pour la suppression" }, { status: 400 });
    }
    const deletedCount = bulkDeleteProducts(ids);
    return NextResponse.json({ success: true, count: deletedCount });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression des produits" }, { status: 500 });
  }
}
