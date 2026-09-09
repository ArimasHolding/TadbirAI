import { NextResponse } from 'next/server';
import { getCompanies, addCompany } from '@/lib/mock-data-store';

export async function GET() {
  return NextResponse.json(getCompanies());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addCompany(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
