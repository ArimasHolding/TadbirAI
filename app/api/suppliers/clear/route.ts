import { NextResponse } from 'next/server';
import { clearSuppliers } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  clearSuppliers();
  return NextResponse.json({ message: "Fournisseurs effacés avec succès" });
}
