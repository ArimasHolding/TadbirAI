import { handleLocalApi } from '@/lib/local-api';

export const dynamic = 'force-dynamic';

// Support tickets have no backend (Django) endpoint at all - proxyOrLocal
// would forward straight to the real API and pass through its 404
// (a 404 is treated as a valid response, not a failure, so it never falls
// back to the local store). Since there's nothing to proxy to, go straight
// to the local (Railway-volume-backed) data store instead.
export async function GET(req: Request) { return handleLocalApi(req); }
export async function POST(req: Request) { return handleLocalApi(req); }
export async function PUT(req: Request) { return handleLocalApi(req); }
export async function PATCH(req: Request) { return handleLocalApi(req); }
export async function DELETE(req: Request) { return handleLocalApi(req); }
