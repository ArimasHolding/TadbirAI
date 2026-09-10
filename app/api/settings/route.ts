import { NextResponse } from "next/server";
import { getCompanySettings, updateCompanySettings } from "@/lib/data-store";

export async function GET() {
  try {
    const settings = getCompanySettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updatedSettings = updateCompanySettings(body);
    return NextResponse.json(updatedSettings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
