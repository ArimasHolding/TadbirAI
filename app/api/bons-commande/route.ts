import { NextResponse } from 'next/server';
import { getBonsCommande, addBonCommande } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getBonsCommande());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addBonCommande(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
