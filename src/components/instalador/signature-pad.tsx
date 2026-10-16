"use client";

import { useEffect, useRef } from "react";
import { TrashIcon } from "@/components/ui/icons";

/**
 * Firma en pantalla. touch-action: none para que el trazo no desplace la página;
 * el lienzo se escala por devicePixelRatio para que se vea nítido. Es "papel" en
 * ambos temas: tinta oscura sobre blanco, así la imagen guardada sirve en el acta.
 */
const INK = "#10232b";

export function SignaturePad({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * ratio);
    c.height = Math.round(rect.height * ratio);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
    if (value) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
    // Solo al montar: después el lienzo es la fuente de verdad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault(); // con mouse, arrastrar no selecciona texto
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext("2d");
    const p = point(e);
    ctx?.beginPath();
    ctx?.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    const p = point(e);
    ctx?.lineTo(p.x, p.y);
    ctx?.stroke();
    dirty.current = true;
  }

  function end(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    if (dirty.current) onChange(e.currentTarget.toDataURL("image/png"));
  }

  function clear() {
    const c = canvas.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
    onChange(null);
  }

  return (
    <div>
      <div className="relative rounded-2xl bg-white ring-1 ring-line select-none">
        <canvas
          ref={canvas}
          aria-label={label}
          role="img"
          className="block h-44 w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
        {!value && (
          <span className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-sm text-[#5b6b70]">Firme aquí</span>
        )}
        <span className="pointer-events-none absolute inset-x-6 bottom-8 h-px bg-[#c5cfd2]" aria-hidden="true" />
      </div>
      {value && (
        <button type="button" onClick={clear} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink">
          <TrashIcon className="size-4" />
          Borrar y volver a firmar
        </button>
      )}
    </div>
  );
}
