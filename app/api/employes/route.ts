import { NextResponse } from 'next/server';
import { getEmployeesByOrg, addEmployee, DEFAULT_ORG_ID } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

function extractOrgId(req: Request): string | null {
  const headerOrg = req.headers.get('x-organization-id');
  if (headerOrg) return headerOrg;

  const url = new URL(req.url);
  const paramOrg = url.searchParams.get('organization_id') || url.searchParams.get('company');
  if (paramOrg) return paramOrg;

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/x-organization-id=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  return null;
}

export async function GET(req: Request) {
  const orgId = extractOrgId(req);
  return NextResponse.json(getEmployeesByOrg(orgId));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orgId = extractOrgId(req) || body.organization_id || body.company || DEFAULT_ORG_ID;
    const created = addEmployee({
      ...body,
      organization_id: orgId,
      company: orgId,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création de l'employé" }, { status: 500 });
  }
}
