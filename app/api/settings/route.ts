import { proxyOrLocal } from '@/lib/proxy-helper';

export const dynamic = 'force-dynamic';

const currentSettingsPath = "/api/company-settings/current/";

export async function GET(req: Request) { return proxyOrLocal(req, currentSettingsPath); }
export async function PUT(req: Request) { return proxyOrLocal(req, currentSettingsPath); }
