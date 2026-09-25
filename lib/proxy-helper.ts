import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleLocalApi } from './local-api';

const DJANGO_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
const LOCAL_DEMO_MODE = process.env.LOCAL_DEMO_MODE === "true";

/**
 * Determines whether remote Django is configured and likely active
 */
function isDjangoConfigured(): boolean { return Boolean(DJANGO_URL); }

/**
 * Universal proxy-or-local handler for Next.js API routes.
 * Django is authoritative whenever configured. JSON storage is an explicit
 * local demonstration mode only; failures never write to it silently.
 */
export async function proxyOrLocal(req: Request): Promise<NextResponse> {
  if (isDjangoConfigured()) {
    try {
      const url = new URL(req.url);
      let targetPath = url.pathname;
      if (!targetPath.endsWith('/')) targetPath += '/';
      const cleanDjangoUrl = DJANGO_URL.replace(/\/$/, '');
      const targetUrl = cleanDjangoUrl + targetPath + url.search;

      const headers = new Headers(req.headers);
      headers.set('host', new URL(DJANGO_URL).host);
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

  if (LOCAL_DEMO_MODE) return handleLocalApi(req);
  return NextResponse.json({ error: "API_URL n'est pas configurée. LOCAL_DEMO_MODE=true est réservé à une démonstration locale." }, { status: 503 });
}
