import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createSpreadsheetSession, ColumnMapping } from "@/lib/spreadsheet-store";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const expectedType = (formData.get("expected_type") as string) || "stock";

    if (!file) {
      return NextResponse.json({ error: "Veuillez fournir un fichier Excel ou CSV." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: "buffer" });
    } catch (e) {
      return NextResponse.json({ error: "Format de fichier non valide. Utilisez un fichier .xlsx ou .csv." }, { status: 400 });
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ error: "Le fichier Excel ne contient aucune feuille." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ error: "Le fichier est vide." }, { status: 400 });
    }

    const headers: string[] = (rawData[0] || []).map((h: any, i: number) => String(h || "").trim() || `Colonne_${i + 1}`);
    const dataRows = rawData.slice(1).filter((row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== "" && String(cell).trim() !== ""));

    const apiKey = process.env.GEMINI_API_KEY;
    let columnMapping: ColumnMapping[] = [];

    if (apiKey && headers.length > 0) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const targetFieldsMap: Record<string, string> = {
          stock: "name (nom produit), sku (référence/code), selling_price (prix vente), quantity (quantité/stock), unit (unité), category_name (catégorie), description (description), barcode (code-barres)",
          clients: "company_name (entreprise/client), customer_code (code client), contact_name (nom contact), email (e-mail), phone (téléphone), city (ville), address (adresse), ice (ICE), tax_identifier (IF/Matricule fiscal)",
          suppliers: "company_name (fournisseur/entreprise), supplier_code (code fournisseur), contact_name (nom contact), email (e-mail), phone (téléphone), city (ville), address (adresse), ice (ICE), tax_identifier (IF)"
        };

        const targetFieldsText = targetFieldsMap[expectedType] || targetFieldsMap.stock;

        const promptText = `Tu es un assistant IA d'importation de données pour un ERP.
Associe chaque en-tête de colonne du fichier utilisateur à l'un des champs cibles disponibles.

En-têtes du fichier utilisateur :
${JSON.stringify(headers)}

Champs cibles pour le type "${expectedType}" :
${targetFieldsText}

Réponds avec un tableau JSON strict au format :
[
  { "source_header": "En-tête source", "mapped_column": "nom_champ_cible" }
]
Si un champ ne correspond à aucun champ disponible, utilise "UNMAPPED". Réponds UNIQUEMENT avec le tableau JSON brut.`;

        let response: any = null;
        for (const modelName of ["gemini-3.6-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro"]) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: promptText
            });
            if (response && response.text) break;
          } catch (e) {
            // keep trying next model
          }
        }

        if (response && response.text) {
          const cleanText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanText);
          if (Array.isArray(parsed)) {
            columnMapping = parsed;
          }
        }
      } catch (err: any) {
        console.warn("Gemini spreadsheet mapping warning:", err?.message);
      }
    }

    if (columnMapping.length === 0) {
      columnMapping = headers.map((header) => {
        const lower = header.toLowerCase();
        let mapped = "UNMAPPED";

        if (expectedType === "stock") {
          if (lower.includes("nom") || lower.includes("produit") || lower.includes("designation") || lower.includes("article") || lower.includes("title")) mapped = "name";
          else if (lower.includes("sku") || lower.includes("ref") || lower.includes("code")) mapped = "sku";
          else if (lower.includes("prix") || lower.includes("price") || lower.includes("tarif") || lower.includes("ht")) mapped = "selling_price";
          else if (lower.includes("quant") || lower.includes("stock") || lower.includes("qte") || lower.includes("qty")) mapped = "quantity";
          else if (lower.includes("categ") || lower.includes("famille")) mapped = "category_name";
          else if (lower.includes("unit")) mapped = "unit";
        } else if (expectedType === "clients") {
          if (lower.includes("code") || lower.includes("id_client")) mapped = "customer_code";
          else if (lower.includes("mail") || lower.includes("courriel")) mapped = "email";
          else if (lower.includes("tel") || lower.includes("phone") || lower.includes("mobile") || lower.includes("gsm")) mapped = "phone";
          else if (lower.includes("ville") || lower.includes("city")) mapped = "city";
          else if (lower.includes("contact") || lower.includes("prenom") || lower.includes("responsable")) mapped = "contact_name";
          else if (lower.includes("societe") || lower.includes("entreprise") || lower.includes("client") || lower.includes("company") || lower.includes("raison") || lower.includes("nom")) mapped = "company_name";
        } else if (expectedType === "suppliers") {
          if (lower.includes("code")) mapped = "supplier_code";
          else if (lower.includes("mail") || lower.includes("courriel")) mapped = "email";
          else if (lower.includes("tel") || lower.includes("phone") || lower.includes("mobile") || lower.includes("gsm")) mapped = "phone";
          else if (lower.includes("ville") || lower.includes("city")) mapped = "city";
          else if (lower.includes("contact") || lower.includes("prenom")) mapped = "contact_name";
          else if (lower.includes("fournisseur") || lower.includes("societe") || lower.includes("company") || lower.includes("entreprise") || lower.includes("nom")) mapped = "company_name";
        }

        return {
          source_header: header,
          mapped_column: mapped
        };
      });
    }

    const sessionId = `sheet-${Date.now()}`;
    const session = createSpreadsheetSession(sessionId, expectedType, headers, dataRows, columnMapping);

    return NextResponse.json({
      id: session.id,
      data_type: session.data_type,
      row_count: dataRows.length,
      column_mapping: session.column_mapping
    });

  } catch (error: any) {
    console.error("Spreadsheet AI API Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse du fichier Excel." }, { status: 500 });
  }
}
