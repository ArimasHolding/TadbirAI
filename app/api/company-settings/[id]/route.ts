import { NextResponse } from 'next/server';
import { getCompanySettings, updateCompanySettings } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = getCompanySettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const updated = updateCompanySettings(body);
  return NextResponse.json(updated);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const updated = updateCompanySettings(body);
  return NextResponse.json(updated);
}
