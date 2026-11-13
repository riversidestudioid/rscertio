"use client";

import { useEffect, useRef, useState } from "react";
import { FONTS, lineHeightEm } from "@/lib/certificate/fonts";
import { clamp, fitScale } from "@/lib/certificate/layout";
import type { CertificateTemplate, NamePlacement } from "@/types/certificate";

interface Props {
  template: CertificateTemplate;
  placement: NamePlacement;
  sampleName: string;
  onChange: (patch: Partial<NamePlacement>) => void;
}

const SNAP = 0.012;
const KEY_STEP = 0.005;

let measureCtx: CanvasRenderingContext2D | null = null;
/** Lebar teks per 1px ukuran font, memakai font file yang sama dengan PDF. */
function textWidthPerPx(text: string, family: string): number {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return 0;
  measureCtx.font = `1000px "${family}"`;
  return measureCtx.measureText(text).width / 1000;
}

export function NamePreview({ template, placement, sampleName, onChange }: Props) {
  const font = FONTS[placement.fontId];
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [, setFontsReady] = useState(0);

  // Pastikan font termuat sebelum diukur; render ulang setelah siap.
  useEffect(() => {
    let alive = true;
    document.fonts
      .load(`1000px "${font.family}"`, sampleName || "A")
      .then(() => alive && setFontsReady((n) => n + 1))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [font.family, sampleName]);

  const text = sampleName || "Nama Peserta";
  const measuredPx = textWidthPerPx(text, font.family) * placement.fontSizeRatio * template.width;
  const scale = fitScale(measuredPx, placement.maxWidth * template.width);
  const effectiveRatio = placement.fontSizeRatio * scale;

  function pointerFraction(e: React.PointerEvent) {
    const r = boxRef.current!.getBoundingClientRect();
    return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { fx, fy } = pointerFraction(e);
    drag.current = { dx: fx - placement.x, dy: fy - placement.y };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const { fx, fy } = pointerFraction(e);
    let x = clamp(fx - drag.current.dx, 0, 1);
    const y = clamp(fy - drag.current.dy, 0, 1);
    const snap = !e.altKey && Math.abs(x - 0.5) < SNAP;
    if (snap) x = 0.5;
    setSnapped(snap);
    onChange({ x, y });
  }

  function endDrag() {
    drag.current = null;
    setDragging(false);
    setSnapped(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const d: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const v = d[e.key];
    if (!v) return;
    e.preventDefault();
    onChange({ x: clamp(placement.x + v[0], 0, 1), y: clamp(placement.y + v[1], 0, 1) });
  }

  return (
    <div
      ref={boxRef}
      className="relative w-full select-none overflow-hidden rounded-xl border border-navy/10 bg-white shadow-lg shadow-navy/10"
      style={{ aspectRatio: `${template.width} / ${template.height}`, containerType: "inline-size" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={template.src} alt="" className="absolute inset-0 size-full" draggable={false} />

      {snapped && <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-teal/70" />}

      <div
        role="application"
        tabIndex={0}
        aria-label={`Posisi nama. Seret atau gunakan tombol panah untuk memindahkan. Posisi ${Math.round(
          placement.x * 100,
        )}% horizontal, ${Math.round(placement.y * 100)}% vertikal.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className={`absolute cursor-grab touch-none whitespace-nowrap rounded outline-dashed outline-1 outline-offset-2 transition-[outline-color] focus-visible:outline-teal ${
          dragging ? "cursor-grabbing outline-teal" : "outline-teal/40 hover:outline-teal"
        }`}
        style={{
          left: `${(placement.x - placement.maxWidth / 2) * 100}%`,
          width: `${placement.maxWidth * 100}%`,
          top: `${placement.y * 100}%`,
          transform: "translateY(-50%)",
          fontFamily: `"${font.family}", serif`,
          fontSize: `${effectiveRatio * 100}cqw`,
          lineHeight: `${lineHeightEm(font)}`,
          textAlign: placement.align,
          color: placement.color,
        }}
      >
        {text}
      </div>
    </div>
  );
}
