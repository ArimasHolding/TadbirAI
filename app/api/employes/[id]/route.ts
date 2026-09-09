import { NextResponse } from "next/server";
import { updateEmployee, deleteEmployee, getEmployees } from "@/lib/mock-data-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const employees = getEmployees();
  const found = employees.find((e: any) => e.id === params.id);
  if (!found) return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
  return NextResponse.json(found);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = updateEmployee(params.id, body);
    
    // Sync with Django backend if available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/api/employees/${params.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.error("Django API sync failed for employee PATCH", err);
      }
    }

    if (!updated) return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de modification" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = deleteEmployee(params.id);
    
    // Sync with Django backend if available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/api/employees/${params.id}/`, { method: "DELETE" });
      } catch (err) {
        console.error("Django API sync failed for employee DELETE", err);
      }
    }

    if (!deleted) return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
