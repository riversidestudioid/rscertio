"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { createTemplateFromFile, TemplateUploadError } from "@/lib/templates/upload";
import type { CertificateTemplate } from "@/types/certificate";

export function TemplateUpload({ onUploaded }: { onUploaded: (t: CertificateTemplate) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onUploaded(await createTemplateFromFile(file));
    } catch (err) {
      setError(
        err instanceof TemplateUploadError ? err.message : "Gagal membaca file. Coba file lain.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging ? "border-teal bg-teal/5" : "border-navy/20 bg-white hover:border-teal"
        }`}
      >
        {busy ? (
          <Loader2 className="size-7 animate-spin text-teal" aria-hidden />
        ) : (
          <UploadCloud className="size-7 text-teal" aria-hidden />
        )}
        <span className="font-medium">{busy ? "Memeriksa gambar…" : "Unggah template Anda"}</span>
        <span className="text-xs text-slate">PNG atau JPG · maks 10 MB · min 600px</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          disabled={busy}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
