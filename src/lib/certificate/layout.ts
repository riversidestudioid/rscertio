import type { CertificateTemplate, NamePlacement } from "@/types/certificate";

/** Sisi terpanjang halaman PDF (A4 dalam poin). Rasio template dipertahankan. */
export const PAGE_LONG_SIDE_PT = 841.89;

export const MIN_FONT_PT = 10;
export const MAX_FONT_PT = 160;
export const MIN_BOX_WIDTH = 0.2;
export const MAX_BOX_WIDTH = 1;

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

type Size = Pick<CertificateTemplate, "width" | "height">;

export function pageSizePt(t: Size) {
  const scale = PAGE_LONG_SIDE_PT / Math.max(t.width, t.height);
  return { width: t.width * scale, height: t.height * scale };
}

export function ratioToPt(ratio: number, t: Size): number {
  return ratio * pageSizePt(t).width;
}

export function ptToRatio(pt: number, t: Size): number {
  return pt / pageSizePt(t).width;
}

/**
 * Faktor pengecil agar teks selebar `measuredWidth` muat di `boxWidth`.
 * Dipakai identik oleh preview dan generator PDF.
 */
export function fitScale(measuredWidth: number, boxWidth: number): number {
  if (measuredWidth <= 0 || measuredWidth <= boxWidth) return 1;
  return boxWidth / measuredWidth;
}

export function defaultPlacement(t: CertificateTemplate): NamePlacement {
  return {
    x: t.defaultNamePosition.x,
    y: t.defaultNamePosition.y,
    maxWidth: 0.6,
    fontSizeRatio: ptToRatio(t.orientation === "landscape" ? 52 : 44, t),
    fontId: "playfair",
    color: "#0C222D",
    align: "center",
  };
}

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function hexToRgb01(hex: string): [number, number, number] {
  const h = HEX_COLOR.test(hex) ? hex : "#000000";
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}
