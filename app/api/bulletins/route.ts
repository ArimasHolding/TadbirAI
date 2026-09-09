import { NextResponse } from 'next/server';
import { getBulletins, addBulletin } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getBulletins());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addBulletin(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
