"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, FileUp, Loader2, Plus, Trash2, Users } from "lucide-react";
import { importNamesFromFile, NameImportError } from "@/lib/names/import";
import {
  findDuplicateKeys,
  isLongName,
  MAX_NAME_LENGTH,
  MAX_NAMES,
  nameKey,
  normalizeName,
  parseLines,
  validateName,
  type NameEntry,
} from "@/lib/names/parse";

interface Props {
  names: NameEntry[];
  onChange: (names: NameEntry[]) => void;
}

type Notice = { kind: "ok" | "error"; text: string };

let idCounter = 0;
const newId = () => `n${++idCounter}`;

export function NamesStep({ names, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [importing, setImporting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const duplicates = useMemo(() => findDuplicateKeys(names.map((n) => n.value)), [names]);
  const invalidCount = names.filter((n) => validateName(n.value) !== null).length;
  const validCount = names.length - invalidCount;
  const duplicateCount = names.filter((n) => duplicates.has(nameKey(n.value))).length;

  function addNames(incoming: string[], skippedEmpty: number, extra = "") {
    const room = MAX_NAMES - names.length;
    const accepted = incoming.slice(0, Math.max(room, 0));
    const dropped = incoming.length - accepted.length;
    if (accepted.length > 0) {
      onChange([...names, ...accepted.map((value) => ({ id: newId(), value }))]);
    }
    const parts = [`${accepted.length} nama ditambahkan`];
    if (skippedEmpty > 0) parts.push(`${skippedEmpty} baris kosong dilewati`);
    if (dropped > 0) parts.push(`${dropped} nama melebihi batas ${MAX_NAMES}`);
    setNotice({
      kind: accepted.length > 0 && dropped === 0 ? "ok" : "error",
      text: parts.join(", ") + "." + extra,
    });
  }

  function handleAddDraft() {
    const { names: parsed, skippedEmpty } = parseLines(draft);
    if (parsed.length === 0) {
      setNotice({ kind: "error", text: "Tidak ada nama yang bisa ditambahkan." });
      return;
    }
    addNames(parsed, skippedEmpty);
    setDraft("");
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setImporting(true);
    setNotice(null);
    try {
      const r = await importNamesFromFile(file);
      if (r.names.length === 0) {
        setNotice({ kind: "error", text: "Tidak ditemukan nama di file ini." });
      } else {
        addNames(r.names, r.skippedEmpty, r.usedHeader ? " Kolom “Nama” terdeteksi." : "");
      }
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof NameImportError ? err.message : "Gagal membaca file. Coba file lain.",
      });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function updateName(id: string, value: string) {
    onChange(names.map((n) => (n.id === id ? { ...n, value } : n)));
  }

  function normalizeOnBlur(id: string) {
    onChange(names.map((n) => (n.id === id ? { ...n, value: normalizeName(n.value) } : n)));
  }

  function removeInvalid() {
    onChange(names.filter((n) => validateName(n.value) === null));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <div>
          <label htmlFor="names-draft" className="text-sm font-medium">
            Tempel atau ketik nama (satu nama per baris)
          </label>
          <textarea
            id="names-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleAddDraft();
            }}
            rows={8}
            placeholder={"Budi Santoso\nSiti Aminah\nAgus Wijaya"}
            className="mt-2 w-full resize-y rounded-xl border border-navy/15 bg-white p-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
          <button
            type="button"
            onClick={handleAddDraft}
            disabled={draft.trim() === ""}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2 text-sm font-medium text-white transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden /> Tambahkan
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate">
          <span className="h-px flex-1 bg-navy/10" /> atau <span className="h-px flex-1 bg-navy/10" />
        </div>

        <label
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy/20 bg-white px-4 py-5 text-sm font-medium transition hover:border-teal ${
            importing ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {importing ? (
            <Loader2 className="size-5 animate-spin text-teal" aria-hidden />
          ) : (
            <FileUp className="size-5 text-teal" aria-hidden />
          )}
          {importing ? "Membaca file…" : "Impor CSV, Excel (.xlsx), atau TXT"}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.txt"
            className="sr-only"
            disabled={importing}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </label>
        <p className="text-xs text-slate">
          Maks 5 MB. Jika ada kolom berjudul “Nama”, kolom itu dipakai; jika tidak, kolom pertama.
        </p>

        {notice && (
          <p
            role={notice.kind === "error" ? "alert" : "status"}
            className={`rounded-lg px-3 py-2 text-sm ${
              notice.kind === "error" ? "bg-red-50 text-red-700" : "bg-teal/10 text-teal"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-teal" aria-hidden />
            <p className="font-semibold" aria-live="polite">
              {validCount} nama valid
            </p>
            {invalidCount > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                {invalidCount} bermasalah
              </span>
            )}
            {duplicateCount > 0 && (
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs">
                {duplicateCount} duplikat
              </span>
            )}
          </div>
          <div className="flex gap-2 text-xs">
            {invalidCount > 0 && (
              <button
                type="button"
                onClick={removeInvalid}
                className="rounded-full border border-navy/15 px-3 py-1.5 transition hover:bg-navy/5"
              >
                Hapus yang bermasalah
              </button>
            )}
            {names.length > 0 &&
              (confirmClear ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange([]);
                    setConfirmClear(false);
                    setNotice(null);
                  }}
                  onBlur={() => setConfirmClear(false)}
                  autoFocus
                  className="rounded-full bg-red-600 px-3 py-1.5 font-medium text-white"
                >
                  Yakin hapus {names.length} nama?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="rounded-full border border-navy/15 px-3 py-1.5 transition hover:bg-navy/5"
                >
                  Hapus semua
                </button>
              ))}
          </div>
        </div>

        {names.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-navy/15 bg-white px-4 py-10 text-center text-sm text-slate">
            Belum ada nama. Tempel daftar nama atau impor dari file.
          </p>
        ) : (
          <ol className="mt-4 max-h-[28rem] space-y-1.5 overflow-y-auto rounded-xl border border-navy/10 bg-white p-2">
            {names.map((n, i) => {
              const issue = validateName(n.value);
              const dup = !issue && duplicates.has(nameKey(n.value));
              const long = !issue && isLongName(n.value);
              return (
                <li key={n.id} className="flex items-center gap-2">
                  <span className="w-8 shrink-0 text-right text-xs text-slate">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <input
                      value={n.value}
                      onChange={(e) => updateName(n.id, e.target.value)}
                      onBlur={() => normalizeOnBlur(n.id)}
                      aria-label={`Nama peserta ${i + 1}`}
                      aria-invalid={issue !== null}
                      className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                        issue
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-transparent hover:border-navy/15 focus:border-teal focus:ring-teal/20"
                      }`}
                    />
                    {(issue || dup || long) && (
                      <p
                        className={`mt-0.5 flex items-center gap-1 px-1 text-xs ${
                          issue ? "text-red-700" : "text-navy/60"
                        }`}
                      >
                        <AlertTriangle className="size-3" aria-hidden />
                        {issue === "empty" && "Nama kosong"}
                        {issue === "too-long" && `Lebih dari ${MAX_NAME_LENGTH} karakter`}
                        {dup && "Nama duplikat"}
                        {long && "Nama panjang, ukuran font dikecilkan otomatis"}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange(names.filter((x) => x.id !== n.id))}
                    aria-label={`Hapus nama ${n.value || i + 1}`}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-slate transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
