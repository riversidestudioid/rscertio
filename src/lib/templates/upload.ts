import type { CertificateTemplate } from "@/types/certificate";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_DIMENSION = 600;
export const MAX_PIXELS = 40_000_000; // lindungi memori browser

export class TemplateUploadError extends Error {}

type ImageKind = "png" | "jpeg";

/** Deteksi tipe sebenarnya dari magic bytes, bukan hanya ekstensi/MIME. */
async function sniffImageKind(file: File): Promise<ImageKind | null> {
  const b = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return "png";
  }
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  return null;
}

function loadDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new TemplateUploadError("Gambar rusak atau tidak dapat dibaca."));
    img.src = url;
  });
}

export async function createTemplateFromFile(file: File): Promise<CertificateTemplate> {
  if (file.size === 0) throw new TemplateUploadError("File kosong.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new TemplateUploadError(
      `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 10 MB.`,
    );
  }
  if (!(await sniffImageKind(file))) {
    throw new TemplateUploadError("Format tidak didukung. Gunakan file PNG atau JPG.");
  }

  const url = URL.createObjectURL(file);
  try {
    const { width, height } = await loadDimensions(url);
    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      throw new TemplateUploadError(
        `Resolusi terlalu kecil (${width}×${height}). Minimal ${MIN_DIMENSION}px pada sisi terpendek.`,
      );
    }
    if (width * height > MAX_PIXELS) {
      throw new TemplateUploadError(
        `Resolusi terlalu besar (${width}×${height}). Perkecil gambar hingga maksimal 40 megapiksel.`,
      );
    }
    const name = file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Template Saya";
    return {
      id: `upload-${Date.now()}`,
      name,
      src: url,
      width,
      height,
      orientation: width >= height ? "landscape" : "portrait",
      source: "upload",
      defaultNamePosition: { x: 0.5, y: 0.5 },
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}
