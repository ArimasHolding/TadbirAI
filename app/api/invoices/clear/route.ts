import { NextResponse } from 'next/server';
import { clearInvoices } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function DELETE() {
  // 1. Clear local memory store
  clearInvoices();

  // 2. Clear Django database backend records
  try {
    const res = await fetch(`${DJANGO_URL}/api/invoices/`, { cache: 'no-store' });
    if (res.ok) {
      const djangoData = await res.json();
      const djangoList = Array.isArray(djangoData) ? djangoData : (djangoData.results || []);
      for (const inv of djangoList) {
        if (inv.id) {
          await fetch(`${DJANGO_URL}/api/invoices/${inv.id}/`, { method: 'DELETE' });
        }
      }
    }
  } catch (e) {
    console.warn("Django clear invoices sync warning:", e);
  }

  return NextResponse.json({ message: "Toutes les factures ont été effacées définitivement des bases de données." });
}
