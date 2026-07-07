import fs from "fs";
import path from "path";

export type CsvRow = Record<string, string>;

export function readCsvFile(relativePath: string): CsvRow[] {
  const fullPath = path.resolve(relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`CSV file not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, "utf-8").replace(/^\uFEFF/, "");
  const rows = parseCsv(content).filter((row) => row.some((value) => value.trim() !== ""));

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());
  const emptyHeaderIndex = headers.findIndex((header) => !header);
  if (emptyHeaderIndex >= 0) {
    throw new Error(`CSV file ${fullPath} has an empty header at column ${emptyHeaderIndex + 1}`);
  }

  const duplicateHeader = headers.find((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeader) {
    throw new Error(`CSV file ${fullPath} has a duplicate header: ${duplicateHeader}`);
  }

  return rows.slice(1).map((values) => {
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

/** Parse CSV content, respecting quoted commas, escaped quotes, and quoted newlines. */
function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      row.push(current.trim());
      rows.push(row);
      row = [];
      current = "";
      if (char === "\r" && content[i + 1] === "\n") i++;
    } else {
      current += char;
    }
  }

  if (inQuotes) {
    throw new Error("CSV file has an unterminated quoted field");
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}
