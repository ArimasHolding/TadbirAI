import { proxyToDjango } from '@/lib/proxy-helper';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return proxyToDjango(req, `/api/ai/spreadsheets/${encodeURIComponent(params.id)}/`);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return proxyToDjango(req, `/api/ai/spreadsheets/${encodeURIComponent(params.id)}/`);
}
