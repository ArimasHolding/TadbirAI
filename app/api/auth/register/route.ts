import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We forward the exact body to Django's UnifiedRegisterView,
    // which has been updated to enforce the RBAC invitation rules.
    const targetUrl = DJANGO_URL + "/api/auth/register/";
    
    const headers = new Headers(req.headers);
    headers.set('host', new URL(DJANGO_URL).host);
    headers.set('content-type', 'application/json');

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Next.js API Proxy] Error during registration:", error);
    return NextResponse.json(
      { error: "Le serveur backend est injoignable." },
      { status: 503 }
    );
  }
}
