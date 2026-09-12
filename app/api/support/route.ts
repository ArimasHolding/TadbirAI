import { NextResponse } from 'next/server';
import { getSupportTickets, addSupportTicket, updateSupportTicket, deleteSupportTicket } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getSupportTickets());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ticket = addSupportTicket(body);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création du ticket" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    const updated = updateSupportTicket(id, patch);
    return NextResponse.json(updated || { success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du ticket" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    deleteSupportTicket(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
