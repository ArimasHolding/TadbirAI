import * as XLSX from "xlsx";

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

  XLSX.utils.book_append_sheet(wb, ws, "Données");

  const finalFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}
