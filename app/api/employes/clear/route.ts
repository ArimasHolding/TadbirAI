import { NextResponse } from "next/server";
import { clearEmployees } from "@/lib/mock-data-store";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    clearEmployees();
    return NextResponse.json({ success: true, message: "Tous les employés ont été vidés" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression des employés" }, { status: 500 });
  }
}
