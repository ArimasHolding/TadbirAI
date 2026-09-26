import { proxyToDjango } from "@/lib/proxy-helper"; // Django is authoritative
export const dynamic = "force-dynamic";
export async function POST(req: Request, { params }: { params: { id: string } }) {
  return proxyToDjango(req, `/api/ai/spreadsheets/${encodeURIComponent(params.id)}/confirm/`);
}
