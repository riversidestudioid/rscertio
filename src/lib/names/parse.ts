export const MAX_NAME_LENGTH = 100;
/** Di atas ini nama masih valid, tapi font akan dikecilkan otomatis saat generate. */
export const LONG_NAME_THRESHOLD = 45;
export const MAX_NAMES = 2000;

export type NameIssue = "empty" | "too-long";

export interface NameEntry {
  id: string;
  value: string;
}

// Karakter kontrol, zero-width, dan penanda arah teks (bidi) yang bisa mengacaukan PDF/nama file.
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤﻿]/g;

export function normalizeName(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(INVISIBLE, "")
    .trim();
}

export function validateName(value: string): NameIssue | null {
  const v = normalizeName(value);
  if (v.length === 0) return "empty";
  if (v.length > MAX_NAME_LENGTH) return "too-long";
  return null;
}

export function isLongName(value: string): boolean {
  return normalizeName(value).length > LONG_NAME_THRESHOLD;
}

export function nameKey(value: string): string {
  return normalizeName(value).toLocaleLowerCase("id");
}

/** Kunci nama (tanpa beda huruf besar/kecil) yang muncul lebih dari sekali. */
export function findDuplicateKeys(values: string[]): Set<string> {
  const seen = new Map<string, number>();
  for (const v of values) {
    const k = nameKey(v);
    if (k) seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
}

export interface ParsedLines {
  names: string[];
  skippedEmpty: number;
}

/** Pecah teks per baris, normalisasi, buang baris kosong. */
export function parseLines(text: string): ParsedLines {
  const names: string[] = [];
  let skippedEmpty = 0;
  const lines = text.split(/\r\n|\r|\n/);
  // Buang baris kosong di ujung (mis. newline penutup) agar tidak dihitung "dilewati".
  while (lines.length > 0 && normalizeName(lines[lines.length - 1]) === "") lines.pop();
  for (const line of lines) {
    const n = normalizeName(line);
    if (n) names.push(n);
    else skippedEmpty++;
  }
  return { names, skippedEmpty };
}

const HEADER_PATTERN = /^(nama|name|nama lengkap|full name|nama peserta|peserta|participant)$/i;

function cellToString(cell: unknown): string {
  if (cell == null) return "";
  if (typeof cell === "string") return cell;
  if (typeof cell === "number" || typeof cell === "boolean") return String(cell);
  return ""; // tanggal/objek bukan nama
}

export interface ParsedTable extends ParsedLines {
  usedHeader: boolean;
}

/**
 * Ambil kolom nama dari tabel (CSV/XLSX). Jika baris pertama berisi judul
 * seperti "Nama"/"Name", kolom itu dipakai dan baris judul dilewati;
 * jika tidak, kolom pertama dipakai.
 */
export function parseTable(rows: unknown[][]): ParsedTable {
  const first = rows[0]?.map((c) => normalizeName(cellToString(c))) ?? [];
  const headerCol = first.findIndex((c) => HEADER_PATTERN.test(c));
  const usedHeader = headerCol >= 0;
  const col = usedHeader ? headerCol : 0;

  const names: string[] = [];
  let skippedEmpty = 0;
  rows.slice(usedHeader ? 1 : 0).forEach((row) => {
    const n = normalizeName(cellToString(row?.[col]));
    if (n) names.push(n);
    else skippedEmpty++;
  });
  return { names, skippedEmpty, usedHeader };
}
