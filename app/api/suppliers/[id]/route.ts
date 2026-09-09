import { NextResponse } from "next/server";
import { getSupplierById, updateSupplier, deleteSupplier } from "@/lib/mock-data-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supplier = getSupplierById(params.id);
  if (!supplier) return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
  return NextResponse.json(supplier);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = updateSupplier(params.id, body);
    if (!updated) return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteSupplier(params.id);
  return NextResponse.json({ message: "Fournisseur supprimé avec succès" });
}
