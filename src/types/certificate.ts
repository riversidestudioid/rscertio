export type Orientation = "landscape" | "portrait";

export interface CertificateTemplate {
  id: string;
  name: string;
  /** URL untuk <img>: path publik (bawaan) atau object URL (upload). */
  src: string;
  /** Dimensi asli dalam piksel — dipakai untuk menjaga rasio. */
  width: number;
  height: number;
  orientation: Orientation;
  source: "builtin" | "upload";
  /** Posisi awal nama (0–1 dari ukuran template), dipakai editor di Fase 4. */
  defaultNamePosition: { x: number; y: number };
}
