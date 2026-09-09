import { NextResponse } from 'next/server';
import { getProductById, deleteProduct, updateProduct } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (product) return NextResponse.json(product);

  try {
    const res = await fetch(`${DJANGO_URL}/api/products/${params.id}/`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {}

  return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteProduct(params.id);

  try {
    await fetch(`${DJANGO_URL}/api/products/${params.id}/`, { method: 'DELETE' });
  } catch (e) {}

  return NextResponse.json({ message: "Produit supprimé avec succès" });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const prod = updateProduct(params.id, {
      name: body.name || body.nom,
      sku: body.sku,
      selling_price: body.selling_price !== undefined ? Number(body.selling_price) : body.prix !== undefined ? Number(body.prix) : undefined,
      quantity: body.quantity !== undefined ? Number(body.quantity) : body.qte !== undefined ? Number(body.qte) : undefined,
      unit: body.unit,
      category_name: body.category_name || body.categorie,
      metadata: body.metadata
    });

    try {
      await fetch(`${DJANGO_URL}/api/products/${params.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: body.name || body.nom,
          sku: body.sku,
          selling_price: body.selling_price || body.prix,
          quantity: body.quantity || body.qte,
        })
      });
    } catch (e) {}

    return NextResponse.json(prod || { message: "Produit mis à jour" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la modification du produit" }, { status: 500 });
  }
}
