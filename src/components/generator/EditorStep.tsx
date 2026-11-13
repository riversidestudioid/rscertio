"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Ruler } from "lucide-react";
import { normalizeName } from "@/lib/names/parse";
import type { CertificateTemplate, NamePlacement } from "@/types/certificate";
import { NamePreview } from "./NamePreview";
import { StyleControls } from "./StyleControls";

interface Props {
  template: CertificateTemplate;
  validNames: string[];
  placement: NamePlacement;
  onChange: (patch: Partial<NamePlacement>) => void;
  onReset: () => void;
}

export function EditorStep({ template, validNames, placement, onChange, onReset }: Props) {
  const [index, setIndex] = useState(0);
  const i = Math.min(index, Math.max(validNames.length - 1, 0));
  const sample = validNames[i] ?? "Nama Peserta";

  const longest = validNames.reduce(
    (best, n, idx) => (normalizeName(n).length > normalizeName(validNames[best] ?? "").length ? idx : best),
    0,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <StyleControls template={template} placement={placement} onChange={onChange} onReset={onReset} />

      <div className="order-first lg:sticky lg:top-24 lg:order-none lg:self-start">
        <NamePreview template={template} placement={placement} sampleName={sample} onChange={onChange} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Nama sebelumnya"
              onClick={() => setIndex((i + validNames.length - 1) % validNames.length)}
              disabled={validNames.length < 2}
              className="grid size-9 place-items-center rounded-full border border-navy/15 transition hover:bg-navy/5 disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="min-w-28 text-center text-sm text-navy/70" aria-live="polite">
              Contoh {validNames.length ? i + 1 : 0} dari {validNames.length}
            </span>
            <button
              type="button"
              aria-label="Nama berikutnya"
              onClick={() => setIndex((i + 1) % validNames.length)}
              disabled={validNames.length < 2}
              className="grid size-9 place-items-center rounded-full border border-navy/15 transition hover:bg-navy/5 disabled:opacity-40"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIndex(longest)}
            disabled={validNames.length < 2}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-3 py-1.5 text-xs transition hover:bg-navy/5 disabled:opacity-40"
          >
            <Ruler className="size-3.5" aria-hidden /> Uji nama terpanjang
          </button>
        </div>
        <p className="mt-3 text-xs text-slate">
          Seret nama untuk memindahkan, atau fokuskan lalu gunakan tombol panah (Shift = lompat lebih jauh).
          Tahan Alt untuk menonaktifkan magnet tengah.
        </p>
      </div>
    </div>
  );
}
