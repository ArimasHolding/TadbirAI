import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function POST() {
  return NextResponse.json({ error: "La réinitialisation directe est désactivée. Un jeton signé et temporaire est requis.", code: "PASSWORD_RESET_TOKEN_REQUIRED" }, { status: 501 });
}
