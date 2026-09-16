/**
 * Exports an array of flat objects to a downloaded CSV file.
 * Only picks the given columns (in order) so we don't dump internal/UUID fields.
 */
export function exportToCsv(
  filename: string,
  rows: Record<string, any>[],
  columns: { key: string; label: string }[]
) {
  if (typeof window === "undefined") return;
  if (!rows || rows.length === 0) return;

  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(",")
  );
  const csvContent = "\uFEFF" + [header, ...lines].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
