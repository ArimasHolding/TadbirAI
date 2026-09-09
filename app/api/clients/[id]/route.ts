import { NextResponse } from 'next/server';
import { getClientById, deleteClient, updateClient } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const client = getClientById(params.id);
  if (client) return NextResponse.json(client);

  try {
    const res = await fetch(`${DJANGO_URL}/api/clients/${params.id}/`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {}

  return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // 1. Delete from local store
  deleteClient(params.id);

  // 2. Sync delete to Django DB
  try {
    await fetch(`${DJANGO_URL}/api/clients/${params.id}/`, { method: 'DELETE' });
  } catch (e) {}

  return NextResponse.json({ message: "Client supprimé avec succès" });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    // 1. Update local data store
    const updated = updateClient(params.id, {
      company_name: body.company_name,
      contact_name: body.contact_name,
      email: body.email,
      phone: body.phone,
      city: body.city || body.address,
      country: body.country,
      metadata: body.metadata
    });

    // 2. Async sync to Django DB
    try {
      await fetch(`${DJANGO_URL}/api/clients/${params.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: body.company_name,
          contact_name: body.contact_name,
          email: body.email,
          phone: body.phone,
          city: body.city,
          country: body.country,
        })
      });
    } catch (e) {}

    return NextResponse.json(updated || { message: "Client mis à jour" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du client" }, { status: 500 });
  }
}
