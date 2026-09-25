import { proxyToDjango } from "@/lib/proxy-helper"; // Django is authoritative
export const dynamic = "force-dynamic";
export async function POST(req: Request) { return proxyToDjango(req, "/api/ai/chat/"); }
