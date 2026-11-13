"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BUILTIN_TEMPLATES } from "@/lib/templates/builtin";
import { validateName, type NameEntry } from "@/lib/names/parse";
import type { CertificateTemplate } from "@/types/certificate";
import { defaultPlacement } from "@/lib/certificate/layout";
import { normalizeName } from "@/lib/names/parse";
import type { NamePlacement } from "@/types/certificate";
import { EditorStep } from "./EditorStep";
import { GenerateStep } from "./GenerateStep";
import { NamesStep } from "./NamesStep";
import { TemplateGallery } from "./TemplateGallery";
import { TemplatePreview } from "./TemplatePreview";
import { TemplateUpload } from "./TemplateUpload";

const STEPS = ["Template", "Nama", "Posisi", "Generate"];

export function GeneratorWorkspace() {
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState<CertificateTemplate[]>([]);
  const [selected, setSelected] = useState<CertificateTemplate>(BUILTIN_TEMPLATES[0]);
  const [names, setNames] = useState<NameEntry[]>([]);
  const [placement, setPlacement] = useState<NamePlacement>(() => defaultPlacement(BUILTIN_TEMPLATES[0]));
  const uploadedRef = useRef<CertificateTemplate[]>([]);

  useEffect(() => {
    uploadedRef.current = uploaded;
  }, [uploaded]);

  // Lepas object URL saat halaman ditutup.
  useEffect(() => {
    return () => uploadedRef.current.forEach((t) => URL.revokeObjectURL(t.src));
  }, []);

  function handleUploaded(t: CertificateTemplate) {
    setUploaded((prev) => {
      // Simpan maksimal 3 upload; buang yang tertua agar memori terjaga.
      const next = [t, ...prev];
      next.slice(3).forEach((old) => URL.revokeObjectURL(old.src));
      return next.slice(0, 3);
    });
    selectTemplate(t);
  }

  function selectTemplate(t: CertificateTemplate) {
    setSelected(t);
    // Posisi awal mengikuti template; gaya (font, warna, dst.) dipertahankan.
    const d = defaultPlacement(t);
    setPlacement((p) => ({ ...p, x: d.x, y: d.y, fontSizeRatio: d.fontSizeRatio }));
  }

  const validNames = names.filter((n) => validateName(n.value) === null).map((n) => normalizeName(n.value));
  const validCount = names.filter((n) => validateName(n.value) === null).length;
  const all = [...uploaded, ...BUILTIN_TEMPLATES];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <ol className="flex items-center gap-2 text-xs sm:text-sm" aria-label="Langkah">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={i === step ? "step" : undefined}
              className={`grid size-7 place-items-center rounded-full font-semibold ${
                i === step
                  ? "bg-teal text-white"
                  : i < step
                    ? "bg-navy text-cream"
                    : "bg-navy/10 text-navy/50"
              }`}
            >
              {i + 1}
            </span>
            <span className={`hidden sm:inline ${i === step ? "font-medium" : "text-navy/50"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-navy/20 sm:w-8" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Pilih Template</h1>
          <p className="mt-2 max-w-xl text-navy/70">
            Pilih template bawaan atau unggah desain sertifikat Anda sendiri.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6">
              <TemplateUpload onUploaded={handleUploaded} />
              <TemplateGallery templates={all} selectedId={selected.id} onSelect={selectTemplate} />
            </div>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <TemplatePreview template={selected} />
            </div>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Masukkan Daftar Nama</h1>
          <p className="mt-2 max-w-xl text-navy/70">
            Tempel, ketik, atau impor nama peserta. Anda bisa mengedit dan menghapus nama sebelum
            lanjut.
          </p>
          <div className="mt-8">
            <NamesStep names={names} onChange={setNames} />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Atur Posisi Nama</h1>
          <p className="mt-2 max-w-xl text-navy/70">
            Geser nama ke tempat yang diinginkan dan atur gayanya. Pratinjau memakai font yang sama dengan PDF.
          </p>
          <div className="mt-8">
            <EditorStep
              template={selected}
              validNames={validNames}
              placement={placement}
              onChange={(patch) => setPlacement((p) => ({ ...p, ...patch }))}
              onReset={() => setPlacement(defaultPlacement(selected))}
            />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Generate Sertifikat</h1>
          <p className="mt-2 max-w-xl text-navy/70">
            Periksa ringkasan, lalu buat semua sertifikat sekaligus. Semua diproses di browser Anda.
          </p>
          <div className="mt-8">
            <GenerateStep template={selected} placement={placement} validNames={validNames} />
          </div>
        </>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-navy/10 pt-6">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-5 py-2.5 text-sm font-medium transition hover:bg-navy/5 disabled:invisible"
        >
          <ArrowLeft className="size-4" aria-hidden /> Kembali
        </button>
        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && validCount === 0}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === 0 ? "Lanjut: Masukkan Nama" : step === 1 ? `Lanjut dengan ${validCount} nama` : "Lanjut: Generate"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
