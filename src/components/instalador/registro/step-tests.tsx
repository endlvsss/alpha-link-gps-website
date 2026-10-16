"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/compra/fields";
import { Button } from "@/components/ui/button";
import { AlertIcon, CheckIcon, SignalIcon } from "@/components/ui/icons";
import { testsFor, type TestId, type Visit } from "@/lib/instalador/model";
import { anyTestFailed, failureLabel } from "@/lib/instalador/rules";
import { setTest, setVerification } from "@/lib/instalador/store";

const TEST_MS = 1300;
const VERIFY_MS = 2600;

export function StepTests({ visit }: { visit: Visit }) {
  const r = visit.registro;
  const tests = testsFor(visit.planId);
  const [stopped, setStopped] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const allOk = tests.every((t) => r.pruebas[t.id] === "ok");
  const failed = anyTestFailed(visit);

  // Simulación: en producción el CRM consulta a la plataforma por el IMEI.
  function run(id: TestId) {
    setTest(visit.id, id, "probando");
    timers.current.push(setTimeout(() => setTest(visit.id, id, "ok"), TEST_MS));
  }

  function verify() {
    setVerification(visit.id, "esperando");
    timers.current.push(setTimeout(() => setVerification(visit.id, "ok"), VERIFY_MS));
  }

  return (
    <div className="space-y-8">
      <p className="text-ink-soft">Prueba cada función con el cliente presente. Si una falla, reinténtala o reporta la instalación.</p>

      {tests.some((t) => t.needsRelay && (r.pruebas[t.id] ?? "pendiente") === "pendiente") && (
        <div className="rounded-2xl bg-amber-soft p-4">
          <p className="mb-3 text-sm font-medium text-ink">Antes de probar el corte de suministro y la sirena:</p>
          <Checkbox id="detenido" checked={stopped} onChange={setStopped}>
            Confirmo que el vehículo está detenido, con el freno de mano puesto.
          </Checkbox>
        </div>
      )}

      <ul className="space-y-2">
        {tests.map((t) => {
          const state = r.pruebas[t.id] ?? "pendiente";
          const needsStop = t.needsRelay && !stopped;
          return (
            <li key={t.id} className="rounded-2xl bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{t.label}</p>
                  <p className="text-sm text-ink-soft">{t.hint}</p>
                </div>
                {state === "ok" && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-ok">
                    <CheckIcon className="size-4" />
                    OK
                  </span>
                )}
                {state === "fallo" && <span className="text-sm font-semibold text-danger">No pasó</span>}
              </div>
              {state === "pendiente" && (
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <Button onClick={() => run(t.id)} disabled={needsStop}>
                    Probar
                  </Button>
                  <Button variant="secondary" onClick={() => setTest(visit.id, t.id, "fallo")}>
                    No pasó
                  </Button>
                </div>
              )}
              {state === "probando" && (
                <p role="status" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-bg text-sm text-ink-soft">
                  <span className="size-2 animate-pulse rounded-full bg-accent" />
                  Probando…
                </p>
              )}
              {state === "fallo" && (
                <Button variant="secondary" className="mt-3 w-full" onClick={() => setTest(visit.id, t.id, "pendiente")}>
                  Reintentar
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {failed && (
        <div role="alert" className="rounded-2xl bg-danger-soft p-4">
          <p className="flex items-center gap-2 font-medium text-danger">
            <AlertIcon className="size-5" />
            Hay una prueba que no pasó
          </p>
          <p className="mt-1 text-sm text-ink">Reinténtala. Si sigue fallando, reporta la instalación: nunca se marca como instalada.</p>
          <Link
            href={`/instalador/visita/${visit.id}/falla`}
            className="mt-3 inline-flex h-11 items-center rounded-xl bg-danger px-4 font-medium text-white active:scale-[0.98] dark:text-bg"
          >
            {failureLabel(visit)}
          </Link>
        </div>
      )}

      <section className="rounded-2xl bg-surface p-4">
        <p className="flex items-center gap-2 font-medium text-ink">
          <SignalIcon className="size-5 text-accent-ink" />
          Verificación en la plataforma
        </p>
        <p className="mt-1 text-sm text-ink-soft">Confirma que el IMEI reporta posición reciente y encendido o apagado.</p>
        {r.verificacion === "ok" ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2.5 text-sm font-medium text-ok">
            <CheckIcon className="size-4" />
            Verificado: el GPS reporta en la plataforma.
          </p>
        ) : r.verificacion === "esperando" ? (
          <p role="status" className="mt-3 flex items-center gap-2 rounded-xl bg-bg px-3 py-2.5 text-sm text-ink-soft">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            Esperando confirmación…
          </p>
        ) : (
          <Button className="mt-3 w-full" disabled={!allOk} onClick={verify}>
            Solicitar verificación
          </Button>
        )}
        <p className="mt-2 text-xs text-muted">
          Mientras la plataforma no tenga API, Operaciones confirma «GPS reporta» a mano (decisión D9).
        </p>
      </section>
    </div>
  );
}
