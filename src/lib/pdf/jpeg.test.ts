import assert from "node:assert/strict";
import { test } from "node:test";
import { readJpegOrientation } from "./jpeg.ts";

function jpegWithOrientation(v: number, little: boolean): Uint8Array {
  const w16 = (n: number) => (little ? [n & 255, n >> 8] : [n >> 8, n & 255]);
  const w32 = (n: number) => (little ? [n & 255, (n >> 8) & 255, 0, 0] : [0, 0, (n >> 8) & 255, n & 255]);
  const tiff = [...(little ? [0x49, 0x49] : [0x4d, 0x4d]), ...w16(42), ...w32(8), ...w16(1),
    ...w16(0x0112), ...w16(3), ...w32(1), ...w16(v), 0, 0, ...w32(0)];
  const body = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const len = body.length + 2;
  return Uint8Array.from([0xff, 0xd8, 0xff, 0xe1, len >> 8, len & 255, ...body, 0xff, 0xda, 0, 2]);
}

test("membaca orientasi EXIF little & big endian", () => {
  assert.equal(readJpegOrientation(jpegWithOrientation(6, true)), 6);
  assert.equal(readJpegOrientation(jpegWithOrientation(8, false)), 8);
  assert.equal(readJpegOrientation(jpegWithOrientation(1, true)), 1);
});

test("tanpa EXIF atau bukan JPEG → 1", () => {
  assert.equal(readJpegOrientation(Uint8Array.from([0xff, 0xd8, 0xff, 0xda, 0, 2])), 1);
  assert.equal(readJpegOrientation(Uint8Array.from([1, 2, 3])), 1);
});
