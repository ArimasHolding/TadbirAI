import { proxyOrLocal } from '@/lib/proxy-helper';

export const dynamic = 'force-dynamic';

function rewriteToCurrent(req: Request) {
  const url = new URL(req.url);
  if (!url.pathname.endsWith('/current') && !url.pathname.endsWith('/current/')) {
    url.pathname = url.pathname.replace(/\/$/, '') + '/current/';
  }
  return new Request(url, req);
}

export async function GET(req: Request) { return proxyOrLocal(rewriteToCurrent(req)); }
export async function POST(req: Request) { return proxyOrLocal(rewriteToCurrent(req)); }
export async function PUT(req: Request) { return proxyOrLocal(rewriteToCurrent(req)); }
export async function PATCH(req: Request) { return proxyOrLocal(rewriteToCurrent(req)); }
export async function DELETE(req: Request) { return proxyOrLocal(rewriteToCurrent(req)); }
