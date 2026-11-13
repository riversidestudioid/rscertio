import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { createGlyphChecker, renderMerged, renderSingle, type PdfAssets } from "./generate.ts";
import { defaultPlacement } from "../certificate/layout.ts";
import { FONTS } from "../certificate/fonts.ts";

function crc32(buf: Uint8Array): number {
  let c, crc = ~0;
  for (const b of buf) {
    c = (crc ^ b) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return ~crc >>> 0;
}
function png(w: number, h: number): Uint8Array {
  const chunk = (type: string, data: Uint8Array) => {
    const out = new Uint8Array(12 + data.length);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, data.length);
    out.set([...type].map((c) => c.charCodeAt(0)), 4);
    out.set(data, 8);
    dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
    return out;
  };
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, w); dv.setUint32(4, h);
  ihdr.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  const raw = new Uint8Array((w * 3 + 1) * h).fill(255);
  for (let y = 0; y < h; y++) raw[y * (w * 3 + 1)] = 0;
  const parts = [Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", new Uint8Array())];
  return Uint8Array.from(parts.flatMap((p) => [...p]));
}

const template = { id: "t", name: "t", src: "", width: 1600, height: 1131, orientation: "landscape" as const, source: "builtin" as const, defaultNamePosition: { x: 0.5, y: 0.5 } };
const placement = defaultPlacement(template);
const font = (id: keyof typeof FONTS) => new Uint8Array(readFileSync(`public${FONTS[id].file}`));
const assets = (id: keyof typeof FONTS = "playfair"): PdfAssets => ({
  template, image: { bytes: png(160, 113), kind: "png" }, fontBytes: font(id),
});

test("renderSingle menghasilkan 1 halaman berukuran A4 landscape", async () => {
  const bytes = await renderSingle(assets(), placement, "Budi Santoso");
  assert.equal(String.fromCharCode(...bytes.slice(0, 5)), "%PDF-");
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
  const { width, height } = doc.getPage(0).getSize();
  assert.ok(Math.abs(width - 841.89) < 0.01);
  assert.ok(Math.abs(width / height - 1600 / 1131) < 1e-6);
});

test("semua font bisa di-embed dan semua perataan berjalan", async () => {
  for (const id of Object.keys(FONTS) as (keyof typeof FONTS)[]) {
    for (const align of ["left", "center", "right"] as const) {
      const bytes = await renderSingle(assets(id), { ...placement, fontId: id, align }, "José Ñandú");
      assert.ok(bytes.length > 500);
    }
  }
});

test("renderMerged: satu halaman per nama, ukuran jauh lebih hemat dari N file", async () => {
  const names = Array.from({ length: 30 }, (_, i) => `Peserta ${i + 1}`);
  const merged = await renderMerged(assets(), placement, names);
  assert.equal((await PDFDocument.load(merged)).getPageCount(), 30);
  const one = await renderSingle(assets(), placement, names[0]);
  assert.ok(merged.length < one.length * 30);
});

test("renderMerged bisa dibatalkan", async () => {
  const ac = new AbortController();
  ac.abort();
  await assert.rejects(renderMerged(assets(), placement, ["A", "B"], { signal: ac.signal }), /dibatalkan/);
});

test("glyph checker menandai karakter di luar subset Latin", () => {
  const check = createGlyphChecker(font("playfair"));
  assert.deepEqual(check("José Ñandú O’Brien"), []);
  assert.deepEqual(check("Ali محمد 王"), ["م", "ح", "م", "د", "王"].filter((c, i, a) => a.indexOf(c) === i));
});
