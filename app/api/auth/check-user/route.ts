import { proxyToDjango } from "@/lib/proxy-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) { return proxyToDjango(req, "/api/auth/check-user/"); }
