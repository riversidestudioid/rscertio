import Papa from "papaparse";
import { parseLines, parseTable, type ParsedTable } from "./parse";

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB

export class NameImportError extends Error {}

function extensionOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}

async function readCsv(file: File): Promise<ParsedTable> {
  const text = (await file.text()).replace(/^﻿/, "");
  const result = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
  const rows = result.data.filter(Array.isArray);
  // Satu kolom tanpa pemisah → perlakukan sebagai daftar biasa.
  return parseTable(rows);
}

async function readXlsx(file: File): Promise<ParsedTable> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (head[0] !== 0x50 || head[1] !== 0x4b) {
    throw new NameImportError("File bukan .xlsx yang valid. Simpan ulang dari Excel sebagai .xlsx.");
  }
  const { readSheet } = await import("read-excel-file/browser");
  try {
    return parseTable(await readSheet(file));
  } catch {
    throw new NameImportError("Gagal membaca file Excel. Pastikan file tidak rusak atau diberi password.");
  }
}

export async function importNamesFromFile(file: File): Promise<ParsedTable> {
  if (file.size === 0) throw new NameImportError("File kosong.");
  if (file.size > MAX_IMPORT_BYTES) {
    throw new NameImportError(
      `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 5 MB.`,
    );
  }
  switch (extensionOf(file.name)) {
    case "csv":
      return readCsv(file);
    case "txt": {
      const text = (await file.text()).replace(/^﻿/, "");
      return { ...parseLines(text), usedHeader: false };
    }
    case "xlsx":
      return readXlsx(file);
    case "xls":
      throw new NameImportError("Format .xls lama tidak didukung. Simpan ulang sebagai .xlsx atau .csv.");
    default:
      throw new NameImportError("Format tidak didukung. Gunakan .csv, .xlsx, atau .txt.");
  }
}
