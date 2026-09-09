import { NextResponse } from 'next/server';
import { getSuppliers, addSupplier } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getSuppliers());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addSupplier(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création du fournisseur" }, { status: 500 });
  }
}
