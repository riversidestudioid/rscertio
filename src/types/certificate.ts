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

export type FontId = "playfair" | "montserrat" | "great-vibes" | "lora";
export type TextAlign = "left" | "center" | "right";

/**
 * Gaya & posisi nama pada sertifikat. Semua ukuran relatif terhadap template
 * (bukan piksel layar) agar preview dan PDF identik di ukuran berapa pun.
 */
export interface NamePlacement {
  /** Titik tengah kotak teks, 0–1 dari lebar template. */
  x: number;
  /** Titik tengah vertikal teks, 0–1 dari tinggi template. */
  y: number;
  /** Lebar kotak teks, 0–1 dari lebar template. Nama yang lebih lebar dikecilkan. */
  maxWidth: number;
  /** Ukuran font sebagai pecahan lebar template. */
  fontSizeRatio: number;
  fontId: FontId;
  color: string; // #RRGGBB
  align: TextAlign;
}
