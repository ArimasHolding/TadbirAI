import { proxyToDjango } from "@/lib/proxy-helper"; // Django is authoritative
export const dynamic = "force-dynamic";
export async function POST(req: Request, { params }: { params: { id: string } }) {
  return proxyToDjango(req, `/api/invoices/${encodeURIComponent(params.id)}/send_email/`);
}
