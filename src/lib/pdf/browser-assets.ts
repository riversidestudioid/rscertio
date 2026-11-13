import { PDFDocument } from "pdf-lib";
import type { CertificateTemplate, FontId } from "@/types/certificate";
import { FONTS } from "@/lib/certificate/fonts";
import type { PdfAssets } from "./generate";
import { readJpegOrientation } from "./jpeg";

const REENCODE_ABOVE_BYTES = 1.5 * 1024 * 1024; // gambar besar di-embed per file → kecilkan
const MAX_LONG_SIDE_PX = 3508; // A4 @ 300 dpi
const SVG_RASTER_SCALE = 1.5;

const fontCache = new Map<string, Promise<Uint8Array>>();

export function loadFontBytes(fontId: FontId): Promise<Uint8Array> {
  const url = FONTS[fontId].file;
  let p = fontCache.get(url);
  if (!p) {
    p = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`Font tidak dapat dimuat (${res.status}).`);
      return new Uint8Array(await res.arrayBuffer());
    });
    p.catch(() => fontCache.delete(url));
    fontCache.set(url, p);
  }
  return p;
}

type Kind = "png" | "jpg";

function sniff(b: Uint8Array): Kind | "svg" | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8) return "jpg";
  const head = new TextDecoder().decode(b.slice(0, 256)).trimStart();
  return head.startsWith("<svg") || head.startsWith("<?xml") ? "svg" : null;
}

function canvasToBytes(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? blob.arrayBuffer().then((b) => resolve(new Uint8Array(b)))
          : reject(new Error("Gagal mengubah gambar template.")),
      type,
      quality,
    ),
  );
}

async function rasterizeSvg(blob: Blob, width: number, height: number): Promise<Uint8Array> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * SVG_RASTER_SCALE);
    canvas.height = Math.round(height * SVG_RASTER_SCALE);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvasToBytes(canvas, "image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Gambar ulang lewat canvas: menerapkan orientasi EXIF, membatasi resolusi, meratakan ke latar putih. */
async function reencodeAsJpeg(blob: Blob): Promise<Uint8Array> {
  const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
  try {
    const k = Math.min(1, MAX_LONG_SIDE_PX / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * k));
    canvas.height = Math.max(1, Math.round(bmp.height * k));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return canvasToBytes(canvas, "image/jpeg", 0.92);
  } finally {
    bmp.close();
  }
}

async function canPdfLibEmbedPng(bytes: Uint8Array): Promise<boolean> {
  try {
    await (await PDFDocument.create()).embedPng(bytes);
    return true;
  } catch {
    return false;
  }
}

async function prepareImage(template: CertificateTemplate): Promise<PdfAssets["image"]> {
  const res = await fetch(template.src);
  if (!res.ok) throw new Error("Gambar template tidak dapat dibaca.");
  const blob = await res.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const kind = sniff(bytes);

  if (kind === "svg") return { bytes: await rasterizeSvg(blob, template.width, template.height), kind: "png" };
  if (!kind) throw new Error("Format gambar template tidak dikenali.");

  const rotated = kind === "jpg" && readJpegOrientation(bytes) > 1;
  const tooBig =
    bytes.length > REENCODE_ABOVE_BYTES || Math.max(template.width, template.height) > MAX_LONG_SIDE_PX;
  const embeddable = kind === "jpg" || (await canPdfLibEmbedPng(bytes));
  if (rotated || tooBig || !embeddable) return { bytes: await reencodeAsJpeg(blob), kind: "jpg" };
  return { bytes, kind };
}

export async function prepareAssets(template: CertificateTemplate, fontId: FontId): Promise<PdfAssets> {
  const [image, fontBytes] = await Promise.all([prepareImage(template), loadFontBytes(fontId)]);
  return { template: { width: template.width, height: template.height }, image, fontBytes };
}
