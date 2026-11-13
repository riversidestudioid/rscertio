import assert from "node:assert/strict";
import { test } from "node:test";
import { clamp, fitScale, hexToRgb01, pageSizePt, PAGE_LONG_SIDE_PT, ptToRatio, ratioToPt } from "./layout.ts";

test("pageSizePt mempertahankan rasio dan sisi terpanjang A4", () => {
  const l = pageSizePt({ width: 1600, height: 1131 });
  assert.ok(Math.abs(l.width - PAGE_LONG_SIDE_PT) < 1e-9);
  assert.ok(Math.abs(l.width / l.height - 1600 / 1131) < 1e-9);
  const p = pageSizePt({ width: 1131, height: 1600 });
  assert.ok(Math.abs(p.height - PAGE_LONG_SIDE_PT) < 1e-9);
});

test("pt <-> ratio bolak-balik", () => {
  const t = { width: 1600, height: 1131 };
  assert.ok(Math.abs(ratioToPt(ptToRatio(52, t), t) - 52) < 1e-9);
});

test("fitScale", () => {
  assert.equal(fitScale(100, 200), 1);
  assert.equal(fitScale(400, 200), 0.5);
  assert.equal(fitScale(0, 200), 1);
});

test("clamp dan hexToRgb01", () => {
  assert.equal(clamp(5, 0, 1), 1);
  assert.deepEqual(hexToRgb01("#FF0000"), [1, 0, 0]);
  assert.deepEqual(hexToRgb01("bad"), [0, 0, 0]);
});
