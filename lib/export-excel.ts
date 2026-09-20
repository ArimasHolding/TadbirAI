// @ts-ignore
import * as XLSX from "xlsx-js-style";

/**
 * Exports an array of flat objects to a downloaded Excel (.xlsx) file.
 * Only picks the given columns (in order) so we don't dump internal/UUID fields.
 */
export function exportToExcel(
  filename: string,
  rows: Record<string, any>[],
  columns: { key: string; label: string }[]
) {
  if (typeof window === "undefined") return;
  if (!rows || rows.length === 0) return;

  const data = rows.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      return val === null || val === undefined ? "" : val;
    })
  );

  const header = columns.map((c) => c.label);
  const sheetData = [header, ...data];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Apply styling
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
      if (!ws[cell_address]) continue;
      
      ws[cell_address].s = {
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      // Header row styling
      if (R === 0) {
        ws[cell_address].s.fill = {
          patternType: "solid",
          fgColor: { rgb: "4F46E5" } // Indigo-600
        };
        ws[cell_address].s.font = {
          bold: true,
          color: { rgb: "FFFFFF" }
        };
      }
    }
  }

  // Adjust column widths based on header and data length
  const colWidths = columns.map((col, i) => {
    let maxLength = col.label.length;
    for (let R = 1; R <= range.e.r; ++R) {
      const cell_address = XLSX.utils.encode_cell({ c: i, r: R });
      if (ws[cell_address] && ws[cell_address].v) {
        maxLength = Math.max(maxLength, String(ws[cell_address].v).length);
      }
    }
    // Cap the maximum width to 50 characters to prevent overly wide columns
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Données");

  const finalFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}
