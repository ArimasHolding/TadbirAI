import { proxyToDjango } from "@/lib/proxy-helper"; // Django is authoritative
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // A Gemini reply can require multiple model calls and overload retries.
  return proxyToDjango(req, "/api/ai/chat/", 60_000);
}
