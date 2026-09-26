import { proxyToDjango } from "@/lib/proxy-helper"; // Django is authoritative
export const dynamic = "force-dynamic";
export async function GET(req: Request) { return proxyToDjango(req, "/api/tickets/"); }
export async function POST(req: Request) { return proxyToDjango(req, "/api/tickets/"); }
export async function PUT(req: Request) { return proxyToDjango(req, "/api/tickets/"); }
export async function PATCH(req: Request) { return proxyToDjango(req, "/api/tickets/"); }
export async function DELETE(req: Request) { return proxyToDjango(req, "/api/tickets/"); }
