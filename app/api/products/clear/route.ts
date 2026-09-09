import { NextResponse } from 'next/server';
import { clearProducts } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  clearProducts();
  return NextResponse.json({ message: "Produits effacés avec succès" });
}
