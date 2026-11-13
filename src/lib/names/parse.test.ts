import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findDuplicateKeys,
  isLongName,
  normalizeName,
  parseLines,
  parseTable,
  validateName,
} from "./parse.ts";

test("normalizeName merapikan spasi dan membuang karakter tak terlihat", () => {
  assert.equal(normalizeName("  Budi \t  Santoso  "), "Budi Santoso");
  assert.equal(normalizeName("A​ni‮"), "Ani");
  assert.equal(normalizeName("José"), "José");
});

test("validateName", () => {
  assert.equal(validateName("   "), "empty");
  assert.equal(validateName("Ani"), null);
  assert.equal(validateName("x".repeat(101)), "too-long");
  assert.equal(validateName("x".repeat(100)), null);
});

test("isLongName", () => {
  assert.equal(isLongName("x".repeat(46)), true);
  assert.equal(isLongName("Ani"), false);
});

test("parseLines menangani CRLF, baris kosong, dan karakter khusus", () => {
  const r = parseLines("Ani\r\n\r\n  Budi  \nD'Arc <b>&</b>\n");
  assert.deepEqual(r.names, ["Ani", "Budi", "D'Arc <b>&</b>"]);
  assert.equal(r.skippedEmpty, 1);
});

test("findDuplicateKeys tidak peka huruf besar/kecil", () => {
  const d = findDuplicateKeys(["Ani", "ani ", "Budi"]);
  assert.deepEqual([...d], ["ani"]);
});

test("parseTable memakai kolom 'Nama' dan melewati header", () => {
  const r = parseTable([
    ["No", "Nama", "Email"],
    [1, "Ani", "a@x.id"],
    [2, "", "b@x.id"],
    [3, "Budi", "c@x.id"],
  ]);
  assert.deepEqual(r.names, ["Ani", "Budi"]);
  assert.equal(r.usedHeader, true);
  assert.equal(r.skippedEmpty, 1);
});

test("parseTable tanpa header memakai kolom pertama", () => {
  const r = parseTable([["Ani", "x"], ["Budi", "y"]]);
  assert.deepEqual(r.names, ["Ani", "Budi"]);
  assert.equal(r.usedHeader, false);
});

test("parseTable mengabaikan sel tanggal/objek", () => {
  const r = parseTable([[new Date()], ["Ani"]]);
  assert.deepEqual(r.names, ["Ani"]);
});
