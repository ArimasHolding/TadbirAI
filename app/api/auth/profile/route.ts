import { proxyToDjango } from "@/lib/proxy-helper"; // Django is authoritative
export const dynamic = "force-dynamic";
export async function PUT(req: Request) { return proxyToDjango(req, "/api/auth/profile/"); }
