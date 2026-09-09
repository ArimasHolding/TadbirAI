import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getProductById } from "@/lib/mock-data-store";

export default function ModifierProduitPage({ params }: { params: { id: string } }) {
  const produit = getProductById(params.id);
  if (!produit) notFound();

  return <ProductForm mode="edit" produit={produit} />;
}
