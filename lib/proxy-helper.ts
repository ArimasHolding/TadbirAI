import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function getDjangoBaseUrl(requestUrl?: string, requestHost?: string): string {
  const configuredUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const hostnames: string[] = [];
  try {
    if (requestUrl) hostnames.push(new URL(requestUrl).hostname);
    if (requestHost) hostnames.push(new URL(`http://${requestHost}`).hostname);
  } catch {
    // Invalid request URLs are handled as missing configuration below.
  }

  if (hostnames.some((hostname) => hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1")) {
    return "http://127.0.0.1:8000";
  }

  return "";
}

/**
 * Universal proxy-or-local handler for Next.js API routes.
 * Django is authoritative whenever configured. JSON storage is an explicit
 * local demonstration mode only; failures never write to it silently.
 */
export async function proxyToDjango(req: Request, pathOverride?: string): Promise<NextResponse> {
  const djangoUrl = getDjangoBaseUrl(req.url, req.headers.get("host") || undefined);
  if (djangoUrl) {
    try {
      const url = new URL(req.url);
      let targetPath = pathOverride || url.pathname;
      if (!targetPath.endsWith('/')) targetPath += '/';
      const targetUrl = djangoUrl + targetPath + url.search;

      const headers = new Headers(req.headers);
      headers.set('host', new URL(djangoUrl).host);
      headers.delete('content-length');
      headers.delete('transfer-encoding');
      headers.delete('connection');

      try {
        const cookieStore = cookies();
        const token = cookieStore.get('access_token')?.value;
        if (token) headers.set('Authorization', `Bearer ${token}`);

        const orgId = cookieStore.get('x-organization-id')?.value;
        if (orgId && !headers.has('x-organization-id')) {
          headers.set('x-organization-id', orgId);
        }
      } catch {}

      const options: RequestInit = {
        method: req.method,
        headers: headers,
        signal: AbortSignal.timeout(15_000),
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const clonedReq = req.clone();
        options.body = Buffer.from(await clonedReq.arrayBuffer());
      }

      const response = await fetch(targetUrl, options);
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete('content-encoding');
      return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
    } catch (error) {
      console.error("[API Proxy] Django request failed; refusing fallback", error);
      return NextResponse.json({ error: "Le service de données est indisponible. Aucune modification locale n'a été enregistrée." }, { status: 503 });
    }
  }

  return NextResponse.json({ error: "API_URL n'est pas configurée. Django est requis pour accéder aux données." }, { status: 503 });
}

/** Backward-compatible name for existing routes; it no longer falls back. */
export const proxyOrLocal = proxyToDjango;
