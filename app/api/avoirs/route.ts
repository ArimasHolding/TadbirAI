import { NextResponse } from 'next/server';
import { getAvoirs, addAvoir } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getAvoirs());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addAvoir(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
