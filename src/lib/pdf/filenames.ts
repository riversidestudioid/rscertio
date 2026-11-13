const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const MAX_SLUG = 60;

/** Bagian nama yang aman untuk nama file di semua OS. */
export function slugifyName(name: string): string {
  let s = name
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}]+/gu, "_") // semua selain huruf/angka (termasuk / \ : * ? " < > | titik)
    .replace(/^_+|_+$/g, "");
  if (s.length > MAX_SLUG) s = s.slice(0, MAX_SLUG).replace(/_+$/g, "");
  if (!s) s = "peserta";
  if (RESERVED.test(s)) s = `_${s}`;
  return s;
}

/**
 * Nama file unik per peserta: nomor urut di depan menjamin tidak ada yang
 * saling menimpa walau namanya kembar atau hasil slug-nya sama.
 * index mulai dari 0.
 */
export function certificateFileName(index: number, total: number, name: string): string {
  const width = Math.max(3, String(total).length);
  return `${String(index + 1).padStart(width, "0")}_${slugifyName(name)}.pdf`;
}
