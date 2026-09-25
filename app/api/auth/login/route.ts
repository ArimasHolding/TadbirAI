import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const baseUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!baseUrl) return NextResponse.json({ error: "Le service d'authentification n'est pas configuré." }, { status: 503 });
  try {
    const { email, password } = await req.json();
    const response = await fetch(`${baseUrl}/api/token/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email?.trim().toLowerCase(), password }),
      cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "Le service d'authentification est indisponible. Aucun accès local n'a été accordé." }, { status: 503 });
  }
}
