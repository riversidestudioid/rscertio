import type { FontId } from "@/types/certificate";

export interface FontDef {
  id: FontId;
  label: string;
  /** Nama family CSS (didefinisikan lewat @font-face di globals.css). */
  family: string;
  /** File di /public/fonts — dipakai browser DAN pdf-lib agar identik. */
  file: string;
  /** Metrik dari tabel OS/2 (typo) file font; unitsPerEm = 1000 untuk semuanya. */
  unitsPerEm: number;
  ascent: number;
  descent: number; // positif
}

export const FONTS: Record<FontId, FontDef> = {
  playfair: {
    id: "playfair",
    label: "Playfair Display",
    family: "RSC Playfair",
    file: "/fonts/playfair-display-latin-700-normal.woff",
    unitsPerEm: 1000,
    ascent: 1082,
    descent: 251,
  },
  montserrat: {
    id: "montserrat",
    label: "Montserrat",
    family: "RSC Montserrat",
    file: "/fonts/montserrat-latin-600-normal.woff",
    unitsPerEm: 1000,
    ascent: 968,
    descent: 251,
  },
  "great-vibes": {
    id: "great-vibes",
    label: "Great Vibes (tulisan tangan)",
    family: "RSC Great Vibes",
    file: "/fonts/great-vibes-latin-400-normal.woff",
    unitsPerEm: 1000,
    ascent: 851,
    descent: 401,
  },
  lora: {
    id: "lora",
    label: "Lora",
    family: "RSC Lora",
    file: "/fonts/lora-latin-600-normal.woff",
    unitsPerEm: 1000,
    ascent: 1006,
    descent: 274,
  },
};

export const FONT_LIST: FontDef[] = Object.values(FONTS);

/** Tinggi kotak em dalam satuan em: dipakai sebagai line-height di preview. */
export function lineHeightEm(font: FontDef): number {
  return (font.ascent + font.descent) / font.unitsPerEm;
}

/**
 * Jarak baseline ke tengah kotak (ascent+descent), dalam satuan em, positif ke bawah.
 * baselineY = centerY + baselineFromCenterEm * fontSize
 */
export function baselineFromCenterEm(font: FontDef): number {
  return (font.ascent - font.descent) / 2 / font.unitsPerEm;
}
