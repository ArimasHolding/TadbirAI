import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: "Utilisez le parcours sécurisé d'inscription ou de réinitialisation." },
    { status: 410 },
  );
}
