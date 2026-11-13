"use client";

import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Crosshair, RotateCcw } from "lucide-react";
import { FONT_LIST } from "@/lib/certificate/fonts";
import {
  clamp,
  HEX_COLOR,
  MAX_BOX_WIDTH,
  MAX_FONT_PT,
  MIN_BOX_WIDTH,
  MIN_FONT_PT,
  ptToRatio,
  ratioToPt,
} from "@/lib/certificate/layout";
import type { CertificateTemplate, FontId, NamePlacement, TextAlign } from "@/types/certificate";

interface Props {
  template: CertificateTemplate;
  placement: NamePlacement;
  onChange: (patch: Partial<NamePlacement>) => void;
  onReset: () => void;
}

const SWATCHES = ["#0C222D", "#168F88", "#E9B431", "#000000", "#FFFFFF", "#8B1E3F"];
const ALIGNS: { value: TextAlign; label: string; Icon: typeof AlignLeft }[] = [
  { value: "left", label: "Rata kiri", Icon: AlignLeft },
  { value: "center", label: "Tengah", Icon: AlignCenter },
  { value: "right", label: "Rata kanan", Icon: AlignRight },
];

const label = "block text-sm font-medium";
const field =
  "mt-1.5 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20";

export function StyleControls({ template, placement, onChange, onReset }: Props) {
  const pt = Math.round(ratioToPt(placement.fontSizeRatio, template));
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  const hexShown = hexDraft ?? placement.color.toUpperCase();
  const hexInvalid = hexDraft !== null && !HEX_COLOR.test(hexDraft);

  return (
    <div className="space-y-5 rounded-2xl border border-navy/10 bg-white p-5">
      <div>
        <label htmlFor="font" className={label}>
          Font
        </label>
        <select
          id="font"
          value={placement.fontId}
          onChange={(e) => onChange({ fontId: e.target.value as FontId })}
          className={field}
        >
          {FONT_LIST.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="size" className={label}>
            Ukuran
          </label>
          <span className="text-xs text-navy/65">{pt} pt</span>
        </div>
        <input
          id="size"
          type="range"
          min={MIN_FONT_PT}
          max={MAX_FONT_PT}
          value={clamp(pt, MIN_FONT_PT, MAX_FONT_PT)}
          onChange={(e) => onChange({ fontSizeRatio: ptToRatio(Number(e.target.value), template) })}
          className="mt-2 w-full accent-teal"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="boxw" className={label}>
            Lebar maksimal teks
          </label>
          <span className="text-xs text-navy/65">{Math.round(placement.maxWidth * 100)}%</span>
        </div>
        <input
          id="boxw"
          type="range"
          min={MIN_BOX_WIDTH * 100}
          max={MAX_BOX_WIDTH * 100}
          value={Math.round(placement.maxWidth * 100)}
          onChange={(e) => onChange({ maxWidth: Number(e.target.value) / 100 })}
          className="mt-2 w-full accent-teal"
        />
        <p className="mt-1 text-xs text-navy/65">Nama yang lebih lebar dikecilkan otomatis agar muat.</p>
      </div>

      <div>
        <span className={label}>Warna</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Warna ${c}`}
              aria-pressed={placement.color.toUpperCase() === c}
              onClick={() => {
                setHexDraft(null);
                onChange({ color: c });
              }}
              className={`size-8 rounded-full border-2 transition ${
                placement.color.toUpperCase() === c ? "border-teal ring-2 ring-teal/30" : "border-navy/15"
              }`}
              style={{ background: c }}
            />
          ))}
          <input
            type="color"
            aria-label="Pilih warna kustom"
            value={HEX_COLOR.test(placement.color) ? placement.color : "#000000"}
            onChange={(e) => {
              setHexDraft(null);
              onChange({ color: e.target.value });
            }}
            className="size-8 cursor-pointer rounded-full border border-navy/15 bg-white p-0.5"
          />
        </div>
        <input
          aria-label="Kode warna hex"
          aria-invalid={hexInvalid}
          value={hexShown}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setHexDraft(v);
            if (HEX_COLOR.test(v)) onChange({ color: v.toUpperCase() });
          }}
          onBlur={() => setHexDraft(null)}
          className={`${field} font-mono ${hexInvalid ? "border-red-300" : ""}`}
        />
      </div>

      <div>
        <span className={label}>Perataan teks</span>
        <div className="mt-2 inline-flex rounded-lg border border-navy/15 p-0.5" role="group" aria-label="Perataan teks">
          {ALIGNS.map(({ value, label: l, Icon }) => (
            <button
              key={value}
              type="button"
              aria-label={l}
              aria-pressed={placement.align === value}
              onClick={() => onChange({ align: value })}
              className={`grid size-9 place-items-center rounded-md transition ${
                placement.align === value ? "bg-teal-dark text-white" : "hover:bg-navy/5"
              }`}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-navy/10 pt-4 text-xs">
        <button
          type="button"
          onClick={() => onChange({ x: 0.5 })}
          className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-3 py-1.5 transition hover:bg-navy/5"
        >
          <Crosshair className="size-3.5" aria-hidden /> Pusatkan horizontal
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-3 py-1.5 transition hover:bg-navy/5"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Reset posisi &amp; gaya
        </button>
      </div>
    </div>
  );
}
