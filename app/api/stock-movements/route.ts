import { NextResponse } from 'next/server';
import { getStockMovements, adjustProductStock, addProduct, getProducts } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const movements = getStockMovements();
  return NextResponse.json(movements);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Support single or batch adjustments
    const items = Array.isArray(body.items) ? body.items : [body];
    const source = body.source || "Entrée de stock (Scan Facture)";
    const supplier = body.supplier || body.supplier_name || body.fournisseur || "";

    const results = [];
    const existingProducts = getProducts();

    for (const item of items) {
      const productName = item.product_name || item.name || item.description || "";
      const changeQty = Number(item.quantity || item.quantite || 0);
      let productId = item.product_id || item.id || "";

      if (changeQty === 0) continue;

      // If product doesn't exist and user requested auto-creation
      if (item.create_if_missing) {
        const found = existingProducts.find(
          (p) => p.name.toLowerCase() === productName.toLowerCase() || p.id === productId
        );
        if (!found) {
          const created = addProduct({
            name: productName || "Produit Réceptionné",
            selling_price: Number(item.selling_price || item.prix_unitaire || item.unit_price || 0),
            quantity: 0,
            unit: item.unit || "unité",
            category_name: item.category_name || "Général",
            min_stock: Number(item.min_stock || 5)
          });
          productId = created.id;
        } else {
          productId = found.id;
        }
      }

      const res = adjustProductStock(productId || productName, changeQty, source, supplier);
      if (res) {
        results.push(res);
      }
    }

    return NextResponse.json({ success: true, count: results.length, movements: results }, { status: 201 });
  } catch (error) {
    console.error("Error adjusting stock movements:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour des mouvements de stock" }, { status: 500 });
  }
}
