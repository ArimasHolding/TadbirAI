import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxyToDjango(req: Request) {
  try {
    const url = new URL(req.url);
    const targetUrl = DJANGO_URL + url.pathname + url.search;

    const headers = new Headers(req.headers);
    headers.set('host', new URL(DJANGO_URL).host);

    const options: RequestInit = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const clonedReq = req.clone();
      options.body = await clonedReq.arrayBuffer();
    }

    const response = await fetch(targetUrl, options);
    const arrayBuffer = await response.arrayBuffer();
    
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    
    return new NextResponse(arrayBuffer, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error: any) {
    console.error("[Next.js API Proxy] Error proxying to Django:", error);
    return NextResponse.json(
      { error: "Le serveur backend est injoignable.", details: error.message },
      { status: 503 }
    );
  }
}

export async function GET(req: Request) { return proxyToDjango(req); }
export async function POST(req: Request) { return proxyToDjango(req); }
export async function PUT(req: Request) { return proxyToDjango(req); }
export async function PATCH(req: Request) { return proxyToDjango(req); }
export async function DELETE(req: Request) { return proxyToDjango(req); }
