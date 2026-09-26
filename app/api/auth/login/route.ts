import { NextResponse } from "next/server";
import { getDjangoBaseUrl } from "@/lib/proxy-helper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const baseUrl = getDjangoBaseUrl(req.url, req.headers.get("host") || undefined);
  if (!baseUrl) return NextResponse.json({ error: "Le service d'authentification n'est pas configuré." }, { status: 503 });
  try {
    const { email, password } = await req.json();
    const response = await fetch(`${baseUrl}/api/token/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email?.trim().toLowerCase(), password }),
      cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const payload = await response.json();
    // Django exposes the persisted field as email_verified. The browser auth
    // contract uses camelCase; only an explicit true may unlock the account.
    if (payload?.user) {
      payload.user.emailVerified = payload.user.email_verified === true || payload.user.emailVerified === true;
    }
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Le service d'authentification est indisponible. Aucun accès local n'a été accordé." }, { status: 503 });
  }
}
