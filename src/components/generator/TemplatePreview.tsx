import type { CertificateTemplate } from "@/types/certificate";

export function TemplatePreview({ template }: { template: CertificateTemplate }) {
  const portrait = template.orientation === "portrait";
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-full overflow-hidden rounded-xl border border-navy/10 bg-white shadow-lg shadow-navy/10 ${
          portrait ? "max-w-[22rem]" : "max-w-2xl"
        }`}
        style={{ aspectRatio: `${template.width} / ${template.height}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.src}
          alt={`Pratinjau template ${template.name}`}
          className="size-full object-contain"
          draggable={false}
        />
      </div>
      <p className="text-sm text-navy/70">
        <span className="font-medium text-navy">{template.name}</span> · {template.width}×
        {template.height}px · {portrait ? "Portrait" : "Landscape"}
      </p>
    </div>
  );
}
