"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CarIcon, ChevronRightIcon, MapPinIcon, NavigationIcon } from "@/components/ui/icons";
import { currentPosition } from "@/lib/image";
import { VISIT_TYPE_LABEL, TRIP_DEADLINE_MIN, type Visit } from "@/lib/instalador/model";
import { IN_PROGRESS, minutesUntil } from "@/lib/instalador/rules";
import { arrive, confirmAttendance, startTrip } from "@/lib/instalador/store";
import { formatPatente } from "@/lib/validation";
import { StatusChip } from "./ui";

export function VisitCard({ visit }: { visit: Visit }) {
  return (
    <Link
      href={`/instalador/visita/${visit.id}`}
      className="block rounded-2xl bg-surface p-4 transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-ink tabular-nums">
            {visit.block.start} – {visit.block.end}
          </p>
          <p className="text-sm text-ink-soft">{VISIT_TYPE_LABEL[visit.tipo]}</p>
        </div>
        <StatusChip status={visit.estado} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 text-ink">
            <MapPinIcon className="size-4 shrink-0 text-muted" />
            {visit.direccion.comuna}
          </p>
          <p className="flex items-center gap-2 truncate text-ink">
            <CarIcon className="size-4 shrink-0 text-muted" />
            {visit.vehiculo.marca} {visit.vehiculo.modelo} ·{" "}
            <span className="tabular-nums">{formatPatente(visit.vehiculo.patente)}</span>
          </p>
        </div>
        <ChevronRightIcon className="size-5 shrink-0 text-muted" />
      </div>
    </Link>
  );
}

/** El siguiente paso de la visita según su estado (sección 6.2). */
export function NextStep({ visit, now }: { visit: Visit; now: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const registro = `/instalador/visita/${visit.id}/registro`;

  async function onArrive() {
    setBusy(true);
    arrive(visit.id, await currentPosition(4000));
    router.push(registro);
  }

  const until = now ? minutesUntil(visit, now) : null;
  const deadline =
    until !== null && until > 0 && until <= 18 * 60 ? deadlineText(visit.block.start) : null;

  switch (visit.estado) {
    case "agendada":
      return (
        <div>
          <Button size="lg" className="w-full" onClick={() => confirmAttendance(visit.id)}>
            Confirmar asistencia
          </Button>
          <p className="mt-2 text-sm text-ink-soft">El cliente y Operaciones ven que la visita está confirmada.</p>
        </div>
      );
    case "confirmada":
      return (
        <div>
          <Button size="lg" className="w-full" onClick={() => startTrip(visit.id)}>
            <NavigationIcon className="size-5" />
            Iniciar trayecto
          </Button>
          <p className="mt-2 text-sm text-ink-soft">
            Avisamos al cliente que vas en camino.
            {deadline && <> Inícialo a más tardar a las {deadline}.</>}
          </p>
        </div>
      );
    case "en_camino":
      return (
        <div>
          <Button size="lg" className="w-full" disabled={busy} onClick={onArrive}>
            {busy ? "Registrando llegada…" : "Llegué: empezar check-in"}
          </Button>
          <p className="mt-2 text-sm text-ink-soft">Guardamos la hora y tu ubicación, si el teléfono la entrega.</p>
        </div>
      );
    default:
      if (IN_PROGRESS.includes(visit.estado)) {
        return (
          <Link href={registro} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-medium text-on-brand active:scale-[0.98]">
            Continuar registro
            <ChevronRightIcon className="size-4" />
          </Link>
        );
      }
      return null;
  }
}

function deadlineText(start: string): string {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m - TRIP_DEADLINE_MIN;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
