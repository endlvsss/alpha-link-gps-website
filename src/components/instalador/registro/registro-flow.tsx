"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronRightIcon } from "@/components/ui/icons";
import { currentPosition } from "@/lib/image";
import { formatImei } from "@/lib/imei";
import { VISIT_TYPE_LABEL, type Visit } from "@/lib/instalador/model";
import { checkinIssues, checkoutIssues, installIssues, IN_PROGRESS, isActive, testsDone, todayIso } from "@/lib/instalador/rules";
import {
  closeVisit,
  completeCheckin,
  completeInstall,
  getPortal,
  lastSaveFailed,
  setRegistroStep,
  setTest,
  setVerification,
  usePortal,
} from "@/lib/instalador/store";
import { useNow } from "@/lib/use-now";
import { formatPatente } from "@/lib/validation";
import { ActionBar, IssueList, ScreenHeader, withPortal } from "../ui";
import { StepCheckin } from "./step-checkin";
import { StepCheckout } from "./step-checkout";
import { accessoriesDone, imeiError, StepInstall } from "./step-install";
import { StepTests } from "./step-tests";

const STEPS = ["Check-in", "Instalación", "Pruebas", "Check-out"] as const;

function RegistroFlowInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const portal = usePortal()!;
  const visit = portal.visits.find((v) => v.id === id);
  // Los avisos pertenecen a un paso: al avanzar dejan de mostrarse.
  const [report, setReport] = useState<{ step: number; list: string[] }>({
    step: -1,
    list: [],
  });
  const [closing, setClosing] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = visit?.registro.step ?? 0;

  // Una prueba o verificación a medias (recarga, sin señal) vuelve a quedar pendiente.
  useEffect(() => {
    const v = getPortal().visits.find((x) => x.id === id);
    if (!v) return;
    for (const [test, state] of Object.entries(v.registro.pruebas)) {
      if (state === "probando") setTest(id, test as never, "pendiente");
    }
    if (v.registro.verificacion === "esperando") setVerification(id, "idle");
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    heading.current?.focus();
  }, [step]);

  if (!visit) {
    return <ScreenHeader back="/instalador" title="Visita no encontrada" />;
  }

  if (visit.estado === "cerrada_ok") return <Done visit={visit} />;

  if (!IN_PROGRESS.includes(visit.estado)) {
    return (
      <div>
        <ScreenHeader back={`/instalador/visita/${visit.id}`} title="Registro de la visita" />
        <p className="mt-4 rounded-2xl bg-surface p-4 text-ink-soft">
          {isActive(visit)
            ? "Primero marca tu llegada desde el detalle de la visita: «Llegué: empezar check-in»."
            : "Esta visita ya no está en curso."}
        </p>
      </div>
    );
  }

  const currentIssues = (v: Visit): string[] => {
    if (step === 0) return checkinIssues(v);
    if (step === 1) {
      const list = installIssues(v, imeiError(v.registro.instalacion.imei, getPortal().devices, v.id));
      if (!accessoriesDone(v)) list.push("Marca los accesorios instalados.");
      return list;
    }
    if (step === 2) return testsDone(v) ? [] : ["Todas las pruebas deben pasar y la plataforma debe verificar el GPS."];
    return checkoutIssues(v);
  };

  async function next() {
    const v = getPortal().visits.find((x) => x.id === id)!;
    const found = currentIssues(v);
    setReport({ step, list: found });
    if (found.length) return;
    if (step === 0) completeCheckin(id);
    else if (step === 1) completeInstall(id);
    // Pruebas y verificación OK: se pasa al check-out sin cambiar el estado interno.
    else if (step === 2) setRegistroStep(id, 3);
    else {
      setClosing(true);
      closeVisit(id, await currentPosition(4000));
    }
  }

  // Tras el primer intento, la lista se recalcula en vivo: lo resuelto desaparece.
  const issues = report.step === step && report.list.length ? currentIssues(visit) : [];
  const ctaLabel = step === 3 ? (closing ? "Cerrando…" : "Cerrar visita y activar") : "Siguiente";

  return (
    <div>
      <ScreenHeader
        back={`/instalador/visita/${visit.id}`}
        title={VISIT_TYPE_LABEL[visit.tipo]}
        subtitle={
          <>
            {visit.vehiculo.marca} {visit.vehiculo.modelo} · <span className="tabular-nums">{formatPatente(visit.vehiculo.patente)}</span> ·{" "}
            {visit.direccion.comuna}
          </>
        }
      />

      <ol className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Pasos del registro">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <span className={`block h-1.5 rounded-full ${i < step ? "bg-ok" : i === step ? "bg-brand" : "bg-surface"}`} />
            <span
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${i === step ? "text-ink" : i < step ? "text-ok" : "text-muted"}`}
            >
              {i < step && <CheckIcon className="size-3.5" />}
              {label}
              {i < step && <span className="sr-only">(listo)</span>}
            </span>
          </li>
        ))}
      </ol>

      <h2 ref={heading} tabIndex={-1} className="mt-6 font-display text-2xl font-bold text-ink outline-none">
        {step + 1}. {STEPS[step]}
      </h2>

      <div className="mt-4">
        {step === 0 && <StepCheckin visit={visit} />}
        {step === 1 && <StepInstall visit={visit} />}
        {step === 2 && <StepTests visit={visit} />}
        {step === 3 && <StepCheckout visit={visit} />}
      </div>

      <ActionBar>
        <IssueList issues={issues} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {lastSaveFailed() ? "Sin espacio: el avance queda en esta pestaña" : "Borrador guardado en el teléfono"}
          </p>
          <Button size="lg" onClick={next} disabled={closing} className="min-w-40">
            {ctaLabel}
            {step < 3 && <ChevronRightIcon className="size-4" />}
          </Button>
        </div>
      </ActionBar>
    </div>
  );
}

function Done({ visit }: { visit: Visit }) {
  const portal = usePortal()!;
  const today = todayIso(useNow());
  const nextVisit = portal.visits
    .filter((v) => v.fecha === today && isActive(v))
    .sort((a, b) => a.block.start.localeCompare(b.block.start))[0];
  const support = visit.tipo === "visita_tecnica";

  return (
    <div className="pt-6 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-ok-soft text-ok motion-safe:animate-rise">
        <CheckIcon className="size-8" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">{support ? "Visita cerrada" : "Vehículo activo"}</h1>
      <p className="mx-auto mt-2 max-w-sm text-ink-soft">
        {support
          ? "El ticket quedó resuelto y el cliente recibió el aviso."
          : "El IMEI quedó vinculado a la cuenta del cliente, que recibió «Tu vehículo ya está protegido»."}
      </p>
      <dl className="mx-auto mt-8 max-w-sm space-y-2 rounded-2xl bg-surface p-4 text-left text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Visita</dt>
          <dd className="font-medium text-ink tabular-nums">{visit.folio}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">IMEI</dt>
          <dd className="font-medium text-ink tabular-nums">{formatImei(visit.registro.instalacion.imei)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Recibió</dt>
          <dd className="font-medium text-ink">{visit.registro.checkout.receptorNombre}</dd>
        </div>
      </dl>
      <div className="mx-auto mt-8 grid max-w-sm gap-2">
        {nextVisit ? (
          <Link
            href={`/instalador/visita/${nextVisit.id}`}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand font-medium text-on-brand active:scale-[0.98]"
          >
            Siguiente visita · {nextVisit.block.start}
            <ChevronRightIcon className="size-4" />
          </Link>
        ) : null}
        <Link
          href="/instalador"
          className="flex h-12 items-center justify-center rounded-xl bg-surface font-medium text-ink active:scale-[0.98]"
        >
          Volver a hoy
        </Link>
      </div>
    </div>
  );
}

export const RegistroFlow = withPortal(RegistroFlowInner);
