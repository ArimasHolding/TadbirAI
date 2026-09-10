import { NextResponse } from 'next/server';
import { getCompanySettings, updateCompanySettings } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = getCompanySettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des paramètres" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = updateCompanySettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour des paramètres" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const updated = updateCompanySettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour des paramètres" }, { status: 500 });
  }
}
