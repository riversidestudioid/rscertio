import { Check } from "lucide-react";
import type { CertificateTemplate } from "@/types/certificate";

interface Props {
  templates: CertificateTemplate[];
  selectedId: string | null;
  onSelect: (template: CertificateTemplate) => void;
}

export function TemplateGallery({ templates, selectedId, onSelect }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {templates.map((t) => {
        const selected = t.id === selectedId;
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              aria-pressed={selected}
              className={`group relative w-full rounded-xl border-2 bg-white p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                selected ? "border-teal" : "border-navy/10"
              }`}
            >
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.src}
                  alt=""
                  loading="lazy"
                  className="max-h-full max-w-full rounded-sm shadow-sm"
                  draggable={false}
                />
              </div>
              <p className="mt-2 truncate px-1 text-sm font-medium">{t.name}</p>
              <p className="px-1 text-xs text-navy/65">
                {t.orientation === "portrait" ? "Portrait" : "Landscape"}
                {t.source === "upload" ? " · Upload" : ""}
              </p>
              {selected && (
                <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-teal-dark text-white">
                  <Check className="size-4" aria-hidden />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
