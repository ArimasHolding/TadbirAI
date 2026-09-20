"use client";

import { mad } from "@/lib/format";

async function fetchCompanyConfig() {
  let company: any = {};
  const orgId = typeof window !== "undefined" ? localStorage.getItem("active_organization_id") : null;
  const orgParam = orgId ? `?org=${encodeURIComponent(orgId)}&t=${Date.now()}` : `?t=${Date.now()}`;
  const orgHeaders: Record<string, string> = orgId ? { "x-organization-id": orgId } : {};
  try {
    const res = await fetch(`/api/company-settings${orgParam}`, { headers: orgHeaders });
    if (res.ok) {
      const text = await res.text();
      company = text ? JSON.parse(text) : {};
    }
  } catch (e) {
    console.warn("Error loading company settings in BonCommandePrintView", e);
  }
  return company;
}

/**
 * Opens a print-ready window for a single purchase order. The old
 * "Imprimer / PDF" link pointed at /bons-de-commande/[id]/print, a route
 * that was never built - clicking it always 404'd. This replaces that
 * link with a working print action, same pattern as invoices/devis/avoirs.
 */
export async function printBonCommandeWindow(po: any) {
  if (!po) return;
  const printWindow = window.open("", "_blank", "width=850,height=1000,top=50,left=100");
  if (!printWindow) {
    window.print();
    return;
  }

  const company = await fetchCompanyConfig();
  const devise = company.devise || company.currency || (typeof window !== "undefined" ? localStorage.getItem("devise") : null) || "MAD";
  const accent = "#059669";

  const articles = po.articles || [];
  const linesHtml = articles.map((a: any, idx: number) => {
    const q = a.qte || a.quantite || 1;
    const p = a.prixUnitaire || a.prix_unitaire || 0;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0; vertical-align: top;">
        <td style="padding: 10px 12px; font-family: monospace; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #0f172a;">${a.nom || a.description || "Article"}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 600;">${q}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace;">${mad(p, devise)}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">${mad(q * p, devise)}</td>
      </tr>
    `;
  }).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Bon de Commande #${po.numero || po.order_number || po.id}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          * { box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #0f172a; font-size: 13px; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; background: #ffffff; border-left: 6px solid ${accent}; padding-left: 20px; }
          .header-banner { border-bottom: 2px solid ${accent}; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
          .header-title { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: ${accent}; margin: 0; }
          .badge-status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #d1fae5; color: #065f46; }
          .card-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 25px; }
          th { background: ${accent}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 10px 12px; text-align: left; }
          .total-box { width: 320px; margin-left: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
          .total-ttc { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: ${accent}; border-top: 2px solid ${accent}; padding-top: 10px; margin-top: 8px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-banner">
            <div>
              <h1 class="header-title">BON DE COMMANDE</h1>
              <p style="font-size: 16px; font-weight: 700; color: ${accent}; margin: 4px 0 0 0; font-family: monospace;">
                N° ${po.numero || po.order_number || po.id}
              </p>
              <div style="margin-top: 8px;"><span class="badge-status">${po.statut || "Brouillon"}</span></div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 18px; font-weight: 900; color: #020617; margin: 0;">${company.nom || company.name || "Entreprise"}</h2>
              <p style="margin: 2px 0 0 0; color: #475569;">${company.adresse || company.address || ""}${company.ville || company.city ? `, ${company.ville || company.city}` : ""}</p>
              <p style="margin: 0; color: #475569;">${company.pays || company.country || "Maroc"}</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-family: monospace;">
                ICE: ${company.ice || "-"} · IF: ${company.identifiant_fiscal || company.tax_identifier || "-"}
              </p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 25px;">
            <div class="card-box" style="flex: 1;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">FOURNISSEUR</span>
              <p style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">${po.fournisseur || "Fournisseur"}</p>
            </div>
            <div class="card-box" style="flex: 1;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">DÉTAILS</span>
              <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0;">
                <span>Date d'émission :</span>
                <strong style="color: #0f172a;">${po.dateEmission || new Date().toISOString().split("T")[0]}</strong>
              </div>
              ${po.livraisonPrevue ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0;">
                <span>Livraison prévue :</span>
                <strong style="color: #0f172a;">${po.livraisonPrevue}</strong>
              </div>` : ""}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Article</th>
                <th style="text-align: right; width: 70px;">Qté</th>
                <th style="text-align: right; width: 140px;">Prix U.</th>
                <th style="text-align: right; width: 140px;">Total</th>
              </tr>
            </thead>
            <tbody>${linesHtml}</tbody>
          </table>

          <div style="display: flex; justify-content: flex-end;">
            <div class="total-box">
              <div class="total-ttc">
                <span>Total :</span>
                <span style="font-family: monospace;">${mad(po.montant || 0, devise)}</span>
              </div>
            </div>
          </div>

          <div class="footer">${company.footer_text || ""}</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 350);
}
