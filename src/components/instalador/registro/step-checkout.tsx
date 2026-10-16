"use client";

import { useState } from "react";
import { Checkbox, Field, TextInput } from "@/components/compra/fields";
import { formatImei, normalizeImei } from "@/lib/imei";
import { checklistFor, type Visit } from "@/lib/instalador/model";
import { updateRegistro } from "@/lib/instalador/store";
import { formatRut } from "@/lib/rut";
import { validateRut } from "@/lib/validation";
import { PhotoSlot } from "../photo-input";
import { SignaturePad } from "../signature-pad";

export function StepCheckout({ visit }: { visit: Visit }) {
  const c = visit.registro.checkout;
  const installed = visit.registro.instalacion.imei;
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const set = (patch: Partial<typeof c>) => updateRegistro(visit.id, (r) => ({ ...r, checkout: { ...r.checkout, ...patch } }));
  const imeiMismatch = c.imeiFinal.length === 15 && c.imeiFinal !== installed;
  const rutError = touched.rut ? validateRut(c.receptorRut) : null;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-display text-lg font-bold text-ink">Checklist técnico</h3>
        <div className="mt-3 space-y-3 rounded-2xl bg-surface p-4">
          {checklistFor(visit.planId).map((item) => (
            <Checkbox
              key={item.id}
              id={`chk-${item.id}`}
              checked={!!c.checklist[item.id]}
              onChange={(v) =>
                updateRegistro(visit.id, (r) => ({ ...r, checkout: { ...r.checkout, checklist: { ...r.checkout.checklist, [item.id]: v } } }))
              }
            >
              {item.label}
            </Checkbox>
          ))}
        </div>
      </section>

      <section>
        <Field
          id="imei-final"
          label="IMEI final"
          hint="Vuelve a escanearlo o escríbelo: debe coincidir con el instalado."
          error={imeiMismatch ? "No coincide con el IMEI que instalaste." : null}
        >
          {(d) => (
            <TextInput
              id="imei-final"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="done"
              className="font-display text-lg font-bold tracking-wider tabular-nums"
              value={formatImei(c.imeiFinal)}
              invalid={imeiMismatch}
              aria-describedby={d}
              onChange={(e) => set({ imeiFinal: normalizeImei(e.target.value) })}
            />
          )}
        </Field>
        {c.imeiFinal === installed && <p className="mt-2 text-sm font-medium text-ok">IMEI confirmado.</p>}
      </section>

      <section>
        <h3 className="font-display text-lg font-bold text-ink">Foto final del vehículo</h3>
        <div className="mt-3 max-w-xs">
          <PhotoSlot label="Vehículo al terminar" required photo={c.fotoFinal} onChange={(fotoFinal) => set({ fotoFinal })} />
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="font-display text-lg font-bold text-ink">Quién recibe</h3>
        <Field id="receptor" label="Nombre y apellido">
          {(d) => (
            <TextInput
              id="receptor"
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="next"
              value={c.receptorNombre}
              aria-describedby={d}
              onChange={(e) => set({ receptorNombre: e.target.value })}
            />
          )}
        </Field>
        <Field id="receptor-rut" label="RUT" error={rutError}>
          {(d) => (
            <TextInput
              id="receptor-rut"
              autoComplete="off"
              inputMode="text"
              autoCapitalize="none"
              enterKeyHint="done"
              value={c.receptorRut}
              invalid={!!rutError}
              aria-describedby={d}
              onChange={(e) => set({ receptorRut: formatRut(e.target.value) })}
              onBlur={() => setTouched((t) => ({ ...t, rut: true }))}
            />
          )}
        </Field>
        <div>
          <p className="text-sm font-medium text-ink">Firma</p>
          <div className="mt-1.5">
            <SignaturePad label="Firma de quien recibe" value={c.firma} onChange={(firma) => set({ firma })} />
          </div>
        </div>
        <Checkbox id="conformidad" checked={c.conformidad} onChange={(conformidad) => set({ conformidad })}>
          Quien recibe está conforme con la instalación y con el estado del vehículo registrado en el check-in.
        </Checkbox>
      </section>
    </div>
  );
}
