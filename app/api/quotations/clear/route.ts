import { NextResponse } from 'next/server';
import { clearQuotations } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  clearQuotations();
  return NextResponse.json({ message: "Devis effacés avec succès" });
}
