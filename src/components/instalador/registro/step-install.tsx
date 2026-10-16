"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Checkbox, Field, TextInput } from "@/components/compra/fields";
import { CheckIcon, ScanIcon } from "@/components/ui/icons";
import { formatImei, imeiProblem, normalizeImei } from "@/lib/imei";
import { accessoriesFor, INSTALL_PHOTOS, type Device, type Visit } from "@/lib/instalador/model";
import { updateRegistro, usePortal } from "@/lib/instalador/store";
import { PhotoSlot } from "../photo-input";

/** Error del IMEI según la sección 4.3: 15 dígitos, Luhn, existe y no está en otro vehículo. */
export function imeiError(imei: string, devices: Device[], visitId: string): string | null {
  if (!imei) return "Escanea o escribe el IMEI del GPS.";
  const problem = imeiProblem(imei);
  if (problem === "largo") return "El IMEI tiene 15 dígitos.";
  if (problem === "luhn") return "Revisa el IMEI: el dígito verificador no coincide.";
  const device = devices.find((d) => d.imei === imei);
  if (!device) return "Ese IMEI no está en tus equipos asignados. Avisa a Operaciones.";
  if (device.estado === "instalado" && device.visitaId !== visitId) return "Ese equipo ya está instalado en otro vehículo.";
  return null;
}

const noop = () => () => {};

export function StepInstall({ visit }: { visit: Visit }) {
  const portal = usePortal()!;
  const i = visit.registro.instalacion;
  const [touched, setTouched] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const scanInput = useRef<HTMLInputElement>(null);
  const canScan = useSyncExternalStore(noop, () => "BarcodeDetector" in window, () => false);
  const error = imeiError(i.imei, portal.devices, visit.id);
  const available = portal.devices.filter((d) => d.estado === "en_custodia");

  const setImei = (imei: string) => updateRegistro(visit.id, (r) => ({ ...r, instalacion: { ...r.instalacion, imei } }));

  async function scan(file: File) {
    setScanMsg("Leyendo el código…");
    try {
      // BarcodeDetector existe en Chrome para Android; en iOS se escribe a mano.
      const Detector = (window as unknown as { BarcodeDetector: new (o: object) => { detect: (s: ImageBitmap) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      const detector = new Detector({ formats: ["code_128", "ean_13", "qr_code", "data_matrix"] });
      const codes = await detector.detect(await createImageBitmap(file));
      const found = codes.map((c) => normalizeImei(c.rawValue)).find((v) => v.length === 15);
      if (found) {
        setImei(found);
        setTouched(true);
        setScanMsg(null);
      } else setScanMsg("No encontramos un IMEI en la foto. Acércate a la etiqueta o escríbelo.");
    } catch {
      setScanMsg("No pudimos leer el código. Escríbelo a mano.");
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <Field
          id="imei"
          label="IMEI del GPS"
          hint="Está en la etiqueta del equipo. 15 dígitos."
          error={touched ? error : null}
        >
          {(d) => (
            <TextInput
              id="imei"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="done"
              className="font-display text-lg font-bold tracking-wider tabular-nums"
              value={formatImei(i.imei)}
              invalid={touched && !!error}
              aria-describedby={d}
              onChange={(e) => setImei(normalizeImei(e.target.value))}
              onBlur={() => setTouched(true)}
            />
          )}
        </Field>
        {!error && <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-ok"><CheckIcon className="size-4" />IMEI válido y asignado a ti.</p>}
        {canScan && (
          <>
            <button
              type="button"
              onClick={() => scanInput.current?.click()}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface font-medium text-ink active:scale-[0.98]"
            >
              <ScanIcon className="size-5" />
              Escanear código de barras
            </button>
            <input
              ref={scanInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void scan(f);
                e.target.value = "";
              }}
            />
          </>
        )}
        {scanMsg && <p role="status" className="mt-2 text-sm text-ink-soft">{scanMsg}</p>}

        {available.length > 0 && (
          <details className="mt-4 rounded-2xl bg-surface">
            <summary className="flex min-h-12 items-center px-4 text-sm font-medium text-ink">
              Equipos en tu custodia ({available.length})
            </summary>
            <ul className="space-y-1 px-2 pb-2">
              {available.map((d) => (
                <li key={d.imei}>
                  <button
                    type="button"
                    onClick={() => {
                      setImei(d.imei);
                      setTouched(true);
                    }}
                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3 text-left active:bg-ink/[0.06]"
                  >
                    <span className="font-medium text-ink tabular-nums">{formatImei(d.imei)}</span>
                    <span className="text-sm text-muted">{d.modelo}</span>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section>
        <h3 className="font-display text-lg font-bold text-ink">Accesorios del plan</h3>
        <div className="mt-3 space-y-3 rounded-2xl bg-surface p-4">
          {accessoriesFor(visit.planId).map((a) => (
            <Checkbox
              key={a}
              id={`acc-${a}`}
              checked={!!i.accesorios[a]}
              onChange={(v) =>
                updateRegistro(visit.id, (r) => ({ ...r, instalacion: { ...r.instalacion, accesorios: { ...r.instalacion.accesorios, [a]: v } } }))
              }
            >
              {a} instalado
            </Checkbox>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-lg font-bold text-ink">Fotos de la instalación</h3>
        <p className="text-sm text-ink-soft">Dónde quedó el equipo y cómo quedaron las conexiones.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {INSTALL_PHOTOS.map((p) => (
            <PhotoSlot
              key={p.id}
              label={p.label}
              required
              photo={i.fotos[p.id]}
              onChange={(photo) =>
                updateRegistro(visit.id, (r) => {
                  const fotos = { ...r.instalacion.fotos };
                  if (photo) fotos[p.id] = photo;
                  else delete fotos[p.id];
                  return { ...r, instalacion: { ...r.instalacion, fotos } };
                })
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function accessoriesDone(visit: Visit): boolean {
  return accessoriesFor(visit.planId).every((a) => visit.registro.instalacion.accesorios[a]);
}
