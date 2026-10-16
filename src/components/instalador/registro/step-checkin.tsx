"use client";

import Link from "next/link";
import { Field, TextArea, TextInput } from "@/components/compra/fields";
import { AlertIcon, ChevronRightIcon, MapPinIcon } from "@/components/ui/icons";
import { CHECKIN_PHOTOS, type Visit } from "@/lib/instalador/model";
import { patenteMismatch } from "@/lib/instalador/rules";
import { updateRegistro } from "@/lib/instalador/store";
import { formatPatente, normalizePatente } from "@/lib/validation";
import { PhotoList, PhotoSlot } from "../photo-input";

export function StepCheckin({ visit }: { visit: Visit }) {
  const c = visit.registro.checkin;
  const mismatch = patenteMismatch(visit);
  const matches = normalizePatente(c.patente) === normalizePatente(visit.vehiculo.patente);
  const set = (patch: Partial<typeof c>) => updateRegistro(visit.id, (r) => ({ ...r, checkin: { ...r.checkin, ...patch } }));
  const arrived = visit.llegadaAt
    ? new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(new Date(visit.llegadaAt))
    : null;

  return (
    <div className="space-y-8">
      <p className="text-ink-soft">Antes de tocar el vehículo, registra cómo lo encontraste.</p>

      {!c.at && (
        <Link
          href={`/instalador/visita/${visit.id}#cliente-no-esta`}
          className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-sm active:scale-[0.99]"
        >
          <span className="text-ink-soft">
            ¿No está el cliente o el vehículo? <span className="font-medium text-accent-ink">Registrar que no estaba</span>
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-muted" />
        </Link>
      )}

      <section>
        <Field
          id="patente-check"
          label="Patente que ves en el vehículo"
          hint={`La orden dice ${formatPatente(visit.vehiculo.patente)}.`}
        >
          {(d) => (
            <TextInput
              id="patente-check"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="done"
              className="font-display text-xl font-bold tracking-[0.12em] uppercase"
              value={c.patente}
              invalid={mismatch}
              aria-describedby={d}
              onChange={(e) => set({ patente: normalizePatente(e.target.value) })}
            />
          )}
        </Field>
        {matches && <p className="mt-2 text-sm font-medium text-ok">La patente coincide con la orden.</p>}
        {mismatch && (
          <div role="alert" className="mt-3 rounded-2xl bg-danger-soft p-4">
            <p className="flex items-center gap-2 font-medium text-danger">
              <AlertIcon className="size-5" />
              La patente no coincide. No instales.
            </p>
            <p className="mt-1 text-sm text-ink">Reporta el caso: Operaciones decide cómo seguir.</p>
            <Link
              href={`/instalador/visita/${visit.id}/falla`}
              className="mt-3 inline-flex h-11 items-center rounded-xl bg-danger px-4 font-medium text-white active:scale-[0.98] dark:text-bg"
            >
              Reportar a Operaciones
            </Link>
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display text-lg font-bold text-ink">Fotos obligatorias</h3>
        <p className="text-sm text-ink-soft">El tablero, encendido, con el kilometraje y los testigos visibles.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CHECKIN_PHOTOS.map((p) => (
            <PhotoSlot
              key={p.id}
              label={p.label}
              required
              photo={c.fotos[p.id]}
              onChange={(photo) =>
                updateRegistro(visit.id, (r) => {
                  const fotos = { ...r.checkin.fotos };
                  if (photo) fotos[p.id] = photo;
                  else delete fotos[p.id];
                  return { ...r, checkin: { ...r.checkin, fotos } };
                })
              }
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-lg font-bold text-ink">
          Daños previos <span className="text-sm font-normal text-muted">(opcional)</span>
        </h3>
        <p className="text-sm text-ink-soft">Rayas, golpes o testigos encendidos antes de empezar.</p>
        <div className="mt-3">
          <PhotoList label="Daño previo" photos={c.danos} onChange={(danos) => set({ danos })} />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <Field id="km" label="Kilometraje" optional>
          {(d) => (
            <TextInput
              id="km"
              inputMode="numeric"
              enterKeyHint="next"
              value={c.kilometraje}
              aria-describedby={d}
              onChange={(e) => set({ kilometraje: e.target.value.replace(/\D/g, "").slice(0, 7) })}
            />
          )}
        </Field>
        <Field id="obs" label="Observaciones" optional className="sm:col-span-2">
          {(d) => (
            <TextArea id="obs" rows={3} value={c.observaciones} aria-describedby={d} onChange={(e) => set({ observaciones: e.target.value })} />
          )}
        </Field>
      </section>

      <p className="flex items-start gap-2 rounded-2xl bg-surface p-4 text-sm text-ink-soft">
        <MapPinIcon className="mt-0.5 size-4 shrink-0" />
        <span>
          Llegada registrada {arrived ? `a las ${arrived}` : "al iniciar el check-in"}
          {c.geo ? ` · ubicación ±${c.geo.accuracy} m` : " · ubicación no disponible en este dispositivo"}.
        </span>
      </p>
    </div>
  );
}
