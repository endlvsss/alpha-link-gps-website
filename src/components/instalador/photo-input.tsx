"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { CameraIcon, CheckIcon, TrashIcon } from "@/components/ui/icons";
import { compressPhoto, samplePhoto } from "@/lib/image";
import type { Photo } from "@/lib/instalador/model";
import { newId } from "@/lib/instalador/store";

async function toPhoto(file: File | null, label: string): Promise<Photo> {
  const data = file ? await compressPhoto(file) : samplePhoto(label);
  return { id: newId(), thumb: data.thumb, bytes: data.bytes, takenAt: new Date().toISOString(), sample: !file };
}

/**
 * Casilla de foto: abre la cámara trasera en el celular. "Usar ejemplo" permite
 * probar el flujo sin cámara (la foto queda marcada como ejemplo).
 */
export function PhotoSlot({
  label,
  photo,
  onChange,
  required = false,
  locked = false,
}: {
  label: string;
  photo: Photo | null | undefined;
  onChange: (photo: Photo | null) => void;
  required?: boolean;
  /** Evidencia ya entregada: se puede ver, no borrar (sección 3). */
  locked?: boolean;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);

  async function take(file: File | null) {
    setBusy(true);
    try {
      onChange(await toPhoto(file, label));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-bg">
      {photo ? (
        <div className="relative">
          <Image src={photo.thumb} alt={`Foto: ${label}`} width={360} height={270} unoptimized className="aspect-[4/3] w-full object-cover" />
          <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-ok text-white">
            <CheckIcon className="size-4" />
          </span>
          {!locked && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={`Borrar foto: ${label}`}
              className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 text-ink-soft select-none active:bg-ink/[0.06]"
        >
          <CameraIcon className="size-7" />
          <span className="text-sm font-medium">{busy ? "Procesando…" : "Tomar foto"}</span>
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void take(f);
          e.target.value = "";
        }}
      />
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="min-w-0 truncate text-sm font-medium text-ink">
          {label}
          {required && !photo && <span className="text-danger"> *</span>}
        </span>
        {!photo && (
          <button type="button" onClick={() => void take(null)} className="shrink-0 text-sm font-medium text-accent-ink">
            Usar ejemplo
          </button>
        )}
      </div>
    </div>
  );
}

/** Varias fotos opcionales (daños previos, evidencia). */
export function PhotoList({ label, photos, onChange }: { label: string; photos: Photo[]; onChange: (photos: Photo[]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {photos.map((p) => (
        <PhotoSlot key={p.id} label={label} photo={p} onChange={(next) => onChange(next ? photos.map((x) => (x.id === p.id ? next : x)) : photos.filter((x) => x.id !== p.id))} />
      ))}
      <PhotoSlot label={photos.length ? `${label} (otra)` : label} photo={null} onChange={(p) => p && onChange([...photos, p])} />
    </div>
  );
}
