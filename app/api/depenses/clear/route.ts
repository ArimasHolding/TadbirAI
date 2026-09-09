import { NextResponse } from 'next/server';
import { clearDepenses } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function DELETE() {
  clearDepenses();

  try {
    const res = await fetch(`${DJANGO_URL}/api/expenses/`, { cache: 'no-store' });
    if (res.ok) {
      const djangoData = await res.json();
      const list = Array.isArray(djangoData) ? djangoData : (djangoData.results || []);
      for (const item of list) {
        if (item.id) {
          await fetch(`${DJANGO_URL}/api/expenses/${item.id}/`, { method: 'DELETE' });
        }
      }
    }
  } catch (e) {}

  return NextResponse.json({ message: "Dépenses effacées avec succès" });
}
