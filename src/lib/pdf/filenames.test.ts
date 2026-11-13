import assert from "node:assert/strict";
import { test } from "node:test";
import { certificateFileName, slugifyName } from "./filenames.ts";

test("slugifyName membuang karakter berbahaya", () => {
  assert.equal(slugifyName("Budi Santoso"), "Budi_Santoso");
  assert.equal(slugifyName("../../etc/passwd"), "etc_passwd");
  assert.equal(slugifyName('a/b\\c:d*e?f"g<h>i|j'), "a_b_c_d_e_f_g_h_i_j");
  assert.equal(slugifyName("José Ñandú"), "José_Ñandú");
  assert.equal(slugifyName("   ...   "), "peserta");
  assert.equal(slugifyName("CON"), "_CON");
  assert.equal(slugifyName("x".repeat(200)).length, 60);
});

test("certificateFileName unik untuk nama kembar dan berurutan", () => {
  const names = ["Ani", "Ani", "ani!", "A/ni"];
  const files = names.map((n, i) => certificateFileName(i, names.length, n));
  assert.equal(new Set(files.map((f) => f.toLowerCase())).size, names.length);
  assert.equal(files[0], "001_Ani.pdf");
  assert.ok(files.every((f) => /^[^/\\:*?"<>|]+\.pdf$/.test(f)));
});

test("lebar nomor mengikuti jumlah total", () => {
  assert.equal(certificateFileName(0, 2000, "A"), "0001_A.pdf");
  assert.equal(certificateFileName(1999, 2000, "A"), "2000_A.pdf");
});
