import { NextResponse } from 'next/server';
import { getCompanies, addCompany, Company } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
  const localList = getCompanies();

  // Synchronize with Django organizations if available
  try {
    const res = await fetch(`${DJANGO_URL}/api/organizations/`, { cache: 'no-store' });
    if (res.ok) {
      const djangoData = await res.json();
      const djangoList = Array.isArray(djangoData) ? djangoData : (djangoData.results || []);

      for (const dOrg of djangoList) {
        const exists = localList.find((c) => c.id === dOrg.id || c.name.toLowerCase() === dOrg.name.toLowerCase());
        if (!exists) {
          addCompany({
            id: dOrg.id,
            name: dOrg.name,
            legal_name: dOrg.legal_name || dOrg.name,
            email: dOrg.email || `contact@${dOrg.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ma`,
            currency: dOrg.currency || "MAD",
            country: dOrg.country || "Maroc",
            ice: dOrg.ice || "",
            tax_identifier: dOrg.tax_identifier || "",
            is_active: dOrg.is_active ?? true,
          });
        }
      }
    }
  } catch (err) {
    // Django offline or unreachable; local data store handles gracefully
  }

  return NextResponse.json(getCompanies());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created: Company = addCompany(body);

    // Sync asynchronously to Django if available
    try {
      await fetch(`${DJANGO_URL}/api/organizations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: created.name,
          legal_name: created.legal_name || created.name,
          email: created.email,
          currency: created.currency || "MAD",
          country: created.country || "Maroc",
          ice: created.ice || "",
          tax_identifier: created.tax_identifier || "",
          is_active: true,
        }),
      });
    } catch (e) {
      // Async failure ignored
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'entreprise" }, { status: 500 });
  }
}
