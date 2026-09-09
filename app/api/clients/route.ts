import { NextResponse } from 'next/server';
import { getClients, addClient } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getClients());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addClient(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création du client" }, { status: 500 });
  }
}
