"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Field, TextArea, TextInput } from "@/components/compra/fields";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { formatImei, normalizeImei } from "@/lib/imei";
import { FAILURE_CAUSES, type FailureCause, type Photo } from "@/lib/instalador/model";
import { failureLabel, IN_PROGRESS, isActive, patenteMismatch } from "@/lib/instalador/rules";
import { reportFailure, usePortal } from "@/lib/instalador/store";
import { formatPatente } from "@/lib/validation";
import { PhotoList } from "./photo-input";
import { ActionBar, IssueList, ScreenHeader, withPortal } from "./ui";

/** I7 · Reportar instalación fallida (sección 8.3). Nunca se marca como instalado. */
function FailureFormInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const portal = usePortal()!;
  const router = useRouter();
  const visit = portal.visits.find((v) => v.id === id);
  const mismatch = visit ? patenteMismatch(visit) : false;

  const [causa, setCausa] = useState<FailureCause | null>(mismatch ? "otro" : null);
  const [descripcion, setDescripcion] = useState(
    mismatch && visit
      ? `La patente del vehículo (${formatPatente(visit.registro.checkin.patente)}) no coincide con la orden (${formatPatente(visit.vehiculo.patente)}). No se instaló.`
      : "",
  );
  const [fotos, setFotos] = useState<Photo[]>([]);
  const [imei, setImei] = useState(visit?.registro.instalacion.imei ?? "");
  const [tried, setTried] = useState(false);

  if (!visit) return <ScreenHeader back="/instalador" title="Visita no encontrada" />;

  if (!isActive(visit) || !IN_PROGRESS.includes(visit.estado)) {
    return (
      <div>
        <ScreenHeader back={`/instalador/visita/${visit.id}`} title={failureLabel(visit)} />
        <p className="mt-4 rounded-2xl bg-surface p-4 text-ink-soft">Solo se puede reportar una visita en curso (después de llegar).</p>
      </div>
    );
  }

  // Tras el primer intento, la lista se recalcula en vivo: lo resuelto desaparece.
  const found: string[] = [];
  if (!causa) found.push("Elige la causa.");
  if (descripcion.trim().length < 15) found.push("Describe qué pasó con más detalle.");
  if (!fotos.length) found.push("Agrega al menos una foto de evidencia.");
  const problems = tried ? found : [];

  function submit() {
    setTried(true);
    if (found.length || !causa) return;
    reportFailure(visit!.id, {
      causa,
      descripcion: descripcion.trim(),
      fotos,
      imei,
    });
    router.replace(`/instalador/visita/${visit!.id}`);
  }

  return (
    <div>
      <ScreenHeader
        back={`/instalador/visita/${visit.id}`}
        title={failureLabel(visit)}
        subtitle={`${visit.vehiculo.marca} ${visit.vehiculo.modelo} · ${formatPatente(visit.vehiculo.patente)}`}
      />
      <p className="mt-4 rounded-2xl bg-surface p-4 text-sm text-ink-soft">
        Se abre un ticket en el Service Desk, el cliente recibe un mensaje claro con qué pasó y qué sigue, y soporte coordina una segunda
        visita o la reprogramación.
      </p>

      <fieldset className="mt-8">
        <legend className="font-display text-lg font-bold text-ink">Causa</legend>
        <div className="mt-3 space-y-2">
          {FAILURE_CAUSES.map((c) => {
            const checked = causa === c.id;
            return (
              <label
                key={c.id}
                className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl p-4 transition-colors ${checked ? "bg-accent-soft ring-2 ring-brand" : "bg-surface"}`}
              >
                <input type="radio" name="causa" value={c.id} checked={checked} onChange={() => setCausa(c.id)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${
                    checked ? "border-brand bg-brand text-on-brand" : "border-line-strong"
                  }`}
                >
                  {checked && <CheckIcon className="size-3" />}
                </span>
                <span>
                  <span className="block font-medium text-ink">{c.label}</span>
                  <span className="text-sm text-ink-soft">{c.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 space-y-6">
        <Field id="descripcion" label="Qué pasó">
          {(d) => (
            <TextArea id="descripcion" rows={4} value={descripcion} aria-describedby={d} onChange={(e) => setDescripcion(e.target.value)} />
          )}
        </Field>

        <div>
          <p className="font-display text-lg font-bold text-ink">Fotos de evidencia</p>
          <div className="mt-3">
            <PhotoList label="Evidencia" photos={fotos} onChange={setFotos} />
          </div>
        </div>

        <Field id="imei-falla" label="IMEI del equipo" optional hint="Si alcanzaste a instalar uno.">
          {(d) => (
            <TextInput
              id="imei-falla"
              inputMode="numeric"
              className="tabular-nums"
              value={formatImei(imei)}
              aria-describedby={d}
              onChange={(e) => setImei(normalizeImei(e.target.value))}
            />
          )}
        </Field>
      </div>

      <ActionBar>
        <IssueList issues={problems} />
        <Button size="lg" className="w-full bg-danger text-white hover:bg-danger dark:text-bg" onClick={submit}>
          Enviar reporte
        </Button>
      </ActionBar>
    </div>
  );
}

export const FailureForm = withPortal(FailureFormInner);
