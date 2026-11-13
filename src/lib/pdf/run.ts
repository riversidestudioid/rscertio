import JSZip from "jszip";
import type { NamePlacement } from "@/types/certificate";
import { certificateFileName } from "./filenames";
import { GenerateAbortError, renderMerged, renderSingle, type PdfAssets } from "./generate";

/** Pecah ZIP agar satu file tidak terlalu besar untuk memori browser. */
export const ZIP_CHUNK_BYTES = 100 * 1024 * 1024;

export interface Job {
  /** Posisi di daftar nama (0-based) — dipakai untuk penomoran file. */
  index: number;
  name: string;
}

export interface ZipPart {
  fileName: string;
  blob: Blob;
  count: number;
}

export interface RunResult {
  zips: ZipPart[];
  merged: Blob | null;
  generated: number;
}

export interface RunOptions {
  assets: PdfAssets;
  placement: NamePlacement;
  jobs: Job[];
  total: number;
  merged: boolean;
  onProgress: (done: number, totalSteps: number) => void;
  signal: AbortSignal;
}

export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function runGeneration(opts: RunOptions): Promise<RunResult> {
  const { assets, placement, jobs, total, signal } = opts;
  const steps = jobs.length * (opts.merged ? 2 : 1);
  let done = 0;
  const tick = () => opts.onProgress(++done, steps);

  const parts: { blob: Blob; count: number }[] = [];
  let zip = new JSZip();
  let zipBytes = 0;
  let zipCount = 0;

  const flush = async () => {
    if (zipCount === 0) return;
    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
    parts.push({ blob, count: zipCount });
    zip = new JSZip();
    zipBytes = 0;
    zipCount = 0;
  };

  for (const job of jobs) {
    if (signal.aborted) throw new GenerateAbortError();
    const pdf = await renderSingle(assets, placement, job.name);
    if (zipCount > 0 && zipBytes + pdf.length > ZIP_CHUNK_BYTES) await flush();
    zip.file(certificateFileName(job.index, total, job.name), pdf, { binary: true });
    zipBytes += pdf.length;
    zipCount++;
    tick();
    await yieldToMain();
  }
  await flush();

  let merged: Blob | null = null;
  if (opts.merged) {
    const bytes = await renderMerged(assets, placement, jobs.map((j) => j.name), {
      signal,
      yieldFn: yieldToMain,
      onProgress: () => tick(),
    });
    merged = new Blob([bytes as BlobPart], { type: "application/pdf" });
  }

  const zips = parts.map((p, i) => ({
    ...p,
    fileName:
      parts.length === 1
        ? "sertifikat-rscertio.zip"
        : `sertifikat-rscertio-${i + 1}-dari-${parts.length}.zip`,
  }));
  return { zips, merged, generated: jobs.length };
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
