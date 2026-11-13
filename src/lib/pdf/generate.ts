import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { NamePlacement } from "../../types/certificate.ts";
import { baselineFromCenterEm, FONTS } from "../certificate/fonts.ts";
import { fitScale, hexToRgb01, pageSizePt } from "../certificate/layout.ts";

export interface PdfAssets {
  template: { width: number; height: number };
  image: { bytes: Uint8Array; kind: "png" | "jpg" };
  fontBytes: Uint8Array;
}

interface Resources {
  doc: PDFDocument;
  font: PDFFont;
  image: PDFImage;
}

export class GenerateAbortError extends Error {
  constructor() {
    super("Pembuatan sertifikat dibatalkan.");
  }
}

/** Pemeriksa glyph: karakter mana dalam nama yang tidak ada di font. */
export function createGlyphChecker(fontBytes: Uint8Array) {
  const font = fontkit.create(fontBytes);
  return (text: string): string[] => {
    const missing = new Set<string>();
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      if (!font.hasGlyphForCodePoint(cp)) missing.add(ch);
    }
    return [...missing];
  };
}

async function createResources(assets: PdfAssets, title?: string): Promise<Resources> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setProducer("RSCertio by Riverside Studio");
  doc.setCreator("RSCertio");
  if (title) doc.setTitle(title);
  const font = await doc.embedFont(assets.fontBytes, { subset: true });
  const image =
    assets.image.kind === "png"
      ? await doc.embedPng(assets.image.bytes)
      : await doc.embedJpg(assets.image.bytes);
  return { doc, font, image };
}

/**
 * Gambar satu halaman sertifikat. Rumus posisi identik dengan preview
 * (lihat NamePreview): kotak teks selebar maxWidth berpusat di x, tengah
 * kotak em (ascent+descent) berada di y, dan nama dikecilkan jika terlalu lebar.
 */
function drawCertificate(res: Resources, assets: PdfAssets, p: NamePlacement, name: string, page?: PDFPage) {
  const { width: W, height: H } = pageSizePt(assets.template);
  if (!page) {
    page = res.doc.addPage([W, H]);
    page.drawImage(res.image, { x: 0, y: 0, width: W, height: H });
  }

  const def = FONTS[p.fontId];
  const boxW = p.maxWidth * W;
  let size = p.fontSizeRatio * W;
  let textW = res.font.widthOfTextAtSize(name, size);
  const scale = fitScale(textW, boxW);
  if (scale < 1) {
    size *= scale;
    textW = res.font.widthOfTextAtSize(name, size);
  }

  const boxLeft = p.x * W - boxW / 2;
  const x =
    p.align === "left" ? boxLeft : p.align === "right" ? boxLeft + boxW - textW : boxLeft + (boxW - textW) / 2;
  const baselineFromTop = p.y * H + baselineFromCenterEm(def) * size;
  const [r, g, b] = hexToRgb01(p.color);

  page.drawText(name, { x, y: H - baselineFromTop, size, font: res.font, color: rgb(r, g, b) });
}

/**
 * Dokumen dasar berisi template saja. Gambar (terutama PNG besar) mahal untuk
 * di-decode/embed; dengan menyalin halaman dari dokumen dasar, stream gambar
 * disalin apa adanya sehingga ratusan PDF tetap cepat dan kualitas tidak turun.
 */
const baseCache = new WeakMap<PdfAssets, Promise<PDFDocument>>();

function getBaseDocument(assets: PdfAssets): Promise<PDFDocument> {
  let p = baseCache.get(assets);
  if (!p) {
    p = (async () => {
      const doc = await PDFDocument.create();
      const image =
        assets.image.kind === "png"
          ? await doc.embedPng(assets.image.bytes)
          : await doc.embedJpg(assets.image.bytes);
      const { width, height } = pageSizePt(assets.template);
      doc.addPage([width, height]).drawImage(image, { x: 0, y: 0, width, height });
      return doc;
    })();
    p.catch(() => baseCache.delete(assets));
    baseCache.set(assets, p);
  }
  return p;
}

export async function renderSingle(
  assets: PdfAssets,
  placement: NamePlacement,
  name: string,
): Promise<Uint8Array> {
  const base = await getBaseDocument(assets);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setProducer("RSCertio by Riverside Studio");
  doc.setCreator("RSCertio");
  doc.setTitle(`Sertifikat - ${name}`);
  const [copied] = await doc.copyPages(base, [0]);
  const page = doc.addPage(copied);
  const font = await doc.embedFont(assets.fontBytes, { subset: true });
  drawCertificate({ doc, font, image: undefined as unknown as PDFImage }, assets, placement, name, page);
  return doc.save();
}

/** Satu PDF berisi semua peserta; gambar & font hanya di-embed sekali. */
export async function renderMerged(
  assets: PdfAssets,
  placement: NamePlacement,
  names: string[],
  opts: { onProgress?: (done: number) => void; signal?: AbortSignal; yieldFn?: () => Promise<void> } = {},
): Promise<Uint8Array> {
  const res = await createResources(assets, "Sertifikat gabungan");
  for (let i = 0; i < names.length; i++) {
    if (opts.signal?.aborted) throw new GenerateAbortError();
    drawCertificate(res, assets, placement, names[i]);
    opts.onProgress?.(i + 1);
    if (opts.yieldFn && i % 5 === 4) await opts.yieldFn();
  }
  return res.doc.save();
}
