import { proxyOrLocal } from '@/lib/proxy-helper';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const res = await proxyOrLocal(req);
  if (res.ok) {
    try {
      const clone = res.clone();
      const data = await clone.json();
      if (Array.isArray(data)) {
        return new Response(JSON.stringify(data[0] || {}), {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      }
    } catch (e) {
      // If JSON parsing fails, just return original response
    }
  }
  return res;
}
export async function POST(req: Request) { return proxyOrLocal(req); }
export async function PUT(req: Request) { return proxyOrLocal(req); }
export async function PATCH(req: Request) { return proxyOrLocal(req); }
export async function DELETE(req: Request) { return proxyOrLocal(req); }
