import { NextResponse } from 'next/server';
import { getDepenses, addDepense } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getDepenses());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addDepense(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
