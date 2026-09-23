"use client";

import { mad } from "@/lib/format";

async function fetchCompanyConfig() {
  let config: any = { accent: "#6B4FA0", footerText: "", company: {} };
  const orgId = typeof window !== "undefined" ? localStorage.getItem("active_organization_id") : null;
  const orgParam = orgId ? `?org=${encodeURIComponent(orgId)}&t=${Date.now()}` : `?t=${Date.now()}`;
  const orgHeaders: Record<string, string> = orgId ? { "x-organization-id": orgId } : {};

  try {
    const companyResponse = await fetch(`/api/company-settings${orgParam}`, { headers: orgHeaders });
    if (companyResponse.ok) {
      const text = await companyResponse.text();
      config.company = text ? JSON.parse(text) : {};
    }
  } catch (e) {
    console.warn("Error loading company settings in AvoirPrintView", e);
  }
  return config;
}

/**
 * Opens a print-ready window for a single credit note (avoir), the same
 * way printFactureWindow does for invoices. Call this instead of a bare
 * window.print() - that only reprints whatever page you're currently on.
 */
export async function printAvoirWindow(avoir: any, config: any = {}, preopenedWindow: Window | null = null, t?: any) {
  if (!avoir) return;
  config = config || {};
  const _t = typeof t === "function" ? t : (typeof window !== "undefined" && (window as any).t ? (window as any).t : (k: string, f: string) => f);
  let printWindow = preopenedWindow;
  
  if (!printWindow) {
    printWindow = window.open("", "_blank", "width=850,height=1000,top=50,left=100");
  }

  if (!printWindow) {
    window.print();
    return;
  }

  if (!config.company || Object.keys(config.company).length === 0) {
    const fetched = await fetchCompanyConfig();
    config.company = fetched.company;
  }
  const company = config.company || {};
  const devise = company.devise || company.currency || (typeof window !== "undefined" ? localStorage.getItem("devise") : null) || "MAD";
  const accent = config.accent || "#6B4FA0";

  const montant = parseFloat(avoir.montant) || 0;
  const sousTotal = montant / 1.2;
  const tva = montant - sousTotal;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Avoir #${avoir.numero || avoir.credit_note_number || avoir.id}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          * { box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #0f172a; font-size: 13px; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; background: #ffffff; border-left: 6px solid #dc2626; padding-left: 20px; }
          .header-banner { border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
          .header-title { font-size: 32px; font-weight: 900; letter-spacing: -1px; color: #dc2626; margin: 0; }
          .badge-status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #fee2e2; color: #991b1b; }
          .card-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
          .total-box { width: 320px; margin-left: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; color: #475569; }
          .total-ttc { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 10px; margin-top: 8px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-banner">
            <div>
              <h1 class="header-title">{_t("invoices.credit_note", "AVOIR").toUpperCase()}</h1>
              <p style="font-size: 16px; font-weight: 700; color: #dc2626; margin: 4px 0 0 0; font-family: monospace;">
                N° ${avoir.numero || avoir.credit_note_number || avoir.id}
              </p>
              <div style="margin-top: 8px;">
                <span class="badge-status">${avoir.statut || "Émis"}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 18px; font-weight: 900; color: #020617; margin: 0;">${company.nom || company.legal_name || company.company_name || company.name || "Entreprise"}</h2>
              <p style="margin: 2px 0 0 0; color: #475569;">${company.adresse || company.address || ""}${company.ville || company.city ? `, ${company.ville || company.city}` : ""}</p>
              <p style="margin: 0; color: #475569;">${company.pays || company.country || "Maroc"}</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-family: monospace;">
                ICE: ${company.ice || "-"} · IF: ${company.identifiant_fiscal || company.tax_identifier || "-"} · RC: ${company.registre_commerce || company.rc || "-"}
              </p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 25px;">
            <div class="card-box" style="flex: 1;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">ÉMIS À (CLIENT)</span>
              <p style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">${avoir.client || "Client Comptoir"}</p>
            </div>
            <div class="card-box" style="flex: 1;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">{_t("invoices.details", "DÉTAILS")}</span>
              <div class="total-row" style="font-size: 12px;">
                <span>Date d'émission :</span>
                <strong style="color: #0f172a;">${avoir.date || new Date().toISOString().split("T")[0]}</strong>
              </div>
              ${avoir.facture_liee || avoir.invoice_number ? `
              <div class="total-row" style="font-size: 12px;">
                <span>Facture liée :</span>
                <strong style="color: #0f172a;">${avoir.facture_liee || avoir.invoice_number}</strong>
              </div>` : ""}
            </div>
          </div>

          ${avoir.raison || avoir.motif ? `
          <div class="card-box" style="margin-bottom: 25px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">MOTIF DE L'AVOIR</span>
            <p style="margin: 0; color: #0f172a;">${avoir.raison || avoir.motif}</p>
          </div>` : ""}

          <div style="display: flex; justify-content: flex-end;">
            <div class="total-box">
              <div class="total-row">
                <span>{_t("invoices.subtotal", "Sous-total HT :")}</span>
                <strong style="font-family: monospace; color: #0f172a;">-${mad(sousTotal, devise)}</strong>
              </div>
              <div class="total-row">
                <span>{_t("invoices.tax_20", "TVA (20%) :")}</span>
                <strong style="font-family: monospace; color: #dc2626;">-${mad(tva, devise)}</strong>
              </div>
              <div class="total-ttc">
                <span>Total avoir :</span>
                <span style="font-family: monospace;">-${mad(montant, devise)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            ${company.footer_text || config.footerText || ""}
          </div>
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
