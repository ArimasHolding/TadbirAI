import { NextResponse } from 'next/server';
import { getProducts, addProduct, bulkDeleteProducts } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  let products = getProducts();
  if (search) {
    const query = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
  }
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addProduct(body);
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
