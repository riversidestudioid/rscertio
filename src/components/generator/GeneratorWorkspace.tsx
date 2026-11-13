"use client";

import { useEffect, useRef, useState } from "react";
import { BUILTIN_TEMPLATES } from "@/lib/templates/builtin";
import type { CertificateTemplate } from "@/types/certificate";
import { TemplateGallery } from "./TemplateGallery";
import { TemplatePreview } from "./TemplatePreview";
import { TemplateUpload } from "./TemplateUpload";

export function GeneratorWorkspace() {
  const [uploaded, setUploaded] = useState<CertificateTemplate[]>([]);
  const [selected, setSelected] = useState<CertificateTemplate>(BUILTIN_TEMPLATES[0]);
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
    setSelected(t);
  }

  const all = [...uploaded, ...BUILTIN_TEMPLATES];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <p className="text-sm font-medium text-teal">Langkah 1 dari 4</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Pilih Template</h1>
      <p className="mt-2 max-w-xl text-navy/70">
        Pilih template bawaan atau unggah desain sertifikat Anda sendiri.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <TemplateUpload onUploaded={handleUploaded} />
          <TemplateGallery templates={all} selectedId={selected.id} onSelect={setSelected} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TemplatePreview template={selected} />
        </div>
      </div>
    </div>
  );
}
