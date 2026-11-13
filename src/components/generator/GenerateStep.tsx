"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileArchive, FileText, Loader2, Sparkles, X } from "lucide-react";
import { FONTS } from "@/lib/certificate/fonts";
import { certificateFileName } from "@/lib/pdf/filenames";
import { createGlyphChecker, GenerateAbortError, renderSingle, type PdfAssets } from "@/lib/pdf/generate";
import { loadFontBytes, prepareAssets } from "@/lib/pdf/browser-assets";
import { downloadBlob, runGeneration, type Job, type RunResult } from "@/lib/pdf/run";
import type { CertificateTemplate, NamePlacement } from "@/types/certificate";

interface Props {
  template: CertificateTemplate;
  placement: NamePlacement;
  validNames: string[];
}

type Status =
  | { kind: "idle" }
  | { kind: "running"; done: number; total: number }
  | { kind: "done"; result: RunResult; jobs: Job[] }
  | { kind: "cancelled" }
  | { kind: "error"; message: string };

interface GlyphIssue {
  index: number;
  name: string;
  chars: string[];
}

const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-dark/90 disabled:cursor-not-allowed disabled:opacity-40";
const btnGhost =
  "inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm font-medium transition hover:bg-navy/5 disabled:opacity-40";

export function GenerateStep({ template, placement, validNames }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [merged, setMerged] = useState(false);
  const [issues, setIssues] = useState<GlyphIssue[] | null>(null);
  const [singleBusy, setSingleBusy] = useState<number | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const snapshot = useRef<{ assets: PdfAssets; placement: NamePlacement; jobs: Job[]; total: number } | null>(null);

  // Periksa karakter yang tidak ada di font sebelum generate.
  useEffect(() => {
    let alive = true;
    loadFontBytes(placement.fontId)
      .then((bytes) => {
        if (!alive) return;
        const check = createGlyphChecker(bytes);
        const found: GlyphIssue[] = [];
        validNames.forEach((name, index) => {
          const chars = check(name);
          if (chars.length) found.push({ index, name, chars });
        });
        setIssues(found);
      })
      .catch(() => alive && setIssues([]));
    return () => {
      alive = false;
    };
  }, [placement.fontId, validNames]);

  const skipped = useMemo(() => new Set((issues ?? []).map((i) => i.index)), [issues]);
  const jobCount = validNames.length - skipped.size;
  const running = status.kind === "running";

  async function handleGenerate() {
    const ac = new AbortController();
    abortRef.current = ac;
    setSingleError(null);
    setStatus({ kind: "running", done: 0, total: 1 });
    try {
      const assets = await prepareAssets(template, placement.fontId);
      const jobs: Job[] = validNames
        .map((name, index) => ({ name, index }))
        .filter((j) => !skipped.has(j.index));
      if (jobs.length === 0) throw new Error("Tidak ada nama yang bisa dibuat sertifikatnya.");
      snapshot.current = { assets, placement: { ...placement }, jobs, total: validNames.length };

      const result = await runGeneration({
        assets,
        placement,
        jobs,
        total: validNames.length,
        merged,
        signal: ac.signal,
        onProgress: (done, total) => setStatus({ kind: "running", done, total }),
      });
      setStatus({ kind: "done", result, jobs });
    } catch (err) {
      if (err instanceof GenerateAbortError || ac.signal.aborted) setStatus({ kind: "cancelled" });
      else {
        console.error(err);
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Terjadi kesalahan saat membuat sertifikat.",
        });
      }
    } finally {
      abortRef.current = null;
    }
  }

  async function downloadSingle(job: Job) {
    const snap = snapshot.current;
    if (!snap) return;
    setSingleBusy(job.index);
    setSingleError(null);
    try {
      const bytes = await renderSingle(snap.assets, snap.placement, job.name);
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        certificateFileName(job.index, snap.total, job.name),
      );
    } catch {
      setSingleError(`Gagal membuat PDF untuk “${job.name}”.`);
    } finally {
      setSingleBusy(null);
    }
  }

  const pct = status.kind === "running" ? Math.round((status.done / Math.max(status.total, 1)) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-navy/10 bg-white p-5 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-navy/65">Template</dt>
          <dd className="mt-0.5 truncate font-medium">{template.name}</dd>
        </div>
        <div>
          <dt className="text-navy/65">Peserta</dt>
          <dd className="mt-0.5 font-medium">{jobCount} sertifikat</dd>
        </div>
        <div>
          <dt className="text-navy/65">Font</dt>
          <dd className="mt-0.5 truncate font-medium">{FONTS[placement.fontId].label}</dd>
        </div>
        <div>
          <dt className="text-navy/65">Ukuran</dt>
          <dd className="mt-0.5 font-medium">{template.orientation === "portrait" ? "A4 Portrait" : "A4 Landscape"}</dd>
        </div>
      </dl>

      {issues && issues.length > 0 && (
        <div role="alert" className="mt-4 rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" aria-hidden />
            {issues.length} nama berisi karakter yang tidak didukung font dan akan dilewati
          </p>
          <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-navy/80">
            {issues.map((i) => (
              <li key={i.index}>
                {i.name} <span className="text-navy/65">— tidak didukung: {i.chars.join(" ")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-navy/70">
            Kembali ke langkah Nama untuk memperbaikinya, atau lanjutkan tanpa nama tersebut.
          </p>
        </div>
      )}

      {status.kind !== "done" && (
        <div className="mt-6">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={merged}
              onChange={(e) => setMerged(e.target.checked)}
              disabled={running}
              className="mt-0.5 size-4 accent-teal"
            />
            <span>
              Buat juga satu PDF gabungan
              <span className="block text-xs text-navy/65">Semua peserta dalam satu file, satu halaman per orang.</span>
            </span>
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleGenerate} disabled={running || jobCount === 0 || issues === null} className={btnPrimary}>
              {running ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
              {running ? "Membuat…" : `Generate ${jobCount} Sertifikat`}
            </button>
            {running && (
              <button type="button" onClick={() => abortRef.current?.abort()} className={btnGhost}>
                <X className="size-4" aria-hidden /> Batalkan
              </button>
            )}
          </div>
        </div>
      )}

      {status.kind === "running" && (
        <div className="mt-5" aria-live="polite">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Progres pembuatan sertifikat"
            className="h-2.5 overflow-hidden rounded-full bg-navy/10"
          >
            <div className="h-full rounded-full bg-teal transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-navy/70">
            {status.total > 1 ? `Memproses ${status.done} dari ${status.total}…` : "Menyiapkan template…"} Jangan tutup halaman ini.
          </p>
        </div>
      )}

      {status.kind === "cancelled" && (
        <p role="status" className="mt-5 rounded-lg bg-navy/5 px-3 py-2 text-sm">
          Pembuatan dibatalkan. Tidak ada file yang dihasilkan.
        </p>
      )}
      {status.kind === "error" && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {status.message}
        </p>
      )}

      {status.kind === "done" && (
        <div className="mt-6">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="size-6 text-teal-dark" aria-hidden />
            {status.result.generated} sertifikat berhasil dibuat
          </p>

          <div className="mt-4 space-y-2">
            {status.result.zips.map((z) => (
              <button
                key={z.fileName}
                type="button"
                onClick={() => downloadBlob(z.blob, z.fileName)}
                className={`${btnPrimary} w-full justify-between`}
              >
                <span className="flex items-center gap-2">
                  <FileArchive className="size-4" aria-hidden /> {z.fileName}
                </span>
                <span className="text-xs font-normal opacity-90">
                  {z.count} PDF · {(z.blob.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </button>
            ))}
            {status.result.merged && (
              <button
                type="button"
                onClick={() => downloadBlob(status.result.merged!, "sertifikat-gabungan.pdf")}
                className={`${btnGhost} w-full justify-between`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="size-4" aria-hidden /> sertifikat-gabungan.pdf
                </span>
                <span className="text-xs text-navy/65">{(status.result.merged.size / 1024 / 1024).toFixed(1)} MB</span>
              </button>
            )}
          </div>

          <h2 className="mt-8 text-sm font-semibold">Unduh satuan</h2>
          <ul className="mt-2 max-h-72 divide-y divide-navy/10 overflow-y-auto rounded-xl border border-navy/10 bg-white">
            {status.jobs.map((job) => (
              <li key={job.index} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  <span className="mr-2 text-xs text-navy/65">{job.index + 1}</span>
                  {job.name}
                </span>
                <button
                  type="button"
                  onClick={() => downloadSingle(job)}
                  disabled={singleBusy !== null}
                  aria-label={`Unduh PDF ${job.name}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/15 px-3 py-1 text-xs transition hover:bg-navy/5 disabled:opacity-40"
                >
                  {singleBusy === job.index ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Download className="size-3.5" aria-hidden />}
                  PDF
                </button>
              </li>
            ))}
          </ul>
          {singleError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {singleError}
            </p>
          )}
          <button type="button" onClick={() => setStatus({ kind: "idle" })} className={`${btnGhost} mt-5`}>
            Buat ulang
          </button>
        </div>
      )}
    </div>
  );
}
