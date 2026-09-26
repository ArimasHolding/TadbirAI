import { proxyToDjango } from "@/lib/proxy-helper";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return proxyToDjango(req, "/api/auth/reset-password/");
}
