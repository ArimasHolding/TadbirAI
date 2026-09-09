import { NextResponse } from 'next/server';
import { clearClients } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  clearClients();
  return NextResponse.json({ message: "Clients effacés avec succès" });
}
