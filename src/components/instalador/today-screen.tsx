"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import { addDays } from "@/lib/agenda";
import { capitalize, dateParts, formatLongDate } from "@/lib/format";
import { nextMonday } from "@/lib/instalador/availability";
import { VISIT_TYPE_LABEL } from "@/lib/instalador/model";
import { isActive, todayIso } from "@/lib/instalador/rules";
import { usePortal } from "@/lib/instalador/store";
import { useNow } from "@/lib/use-now";
import { Section, StatusChip, withPortal } from "./ui";
import { NextStep, VisitCard } from "./visit-parts";

function TodayScreenInner() {
  const portal = usePortal()!;
  const now = useNow();
  const today = todayIso(now);
  const tomorrow = addDays(today, 1).iso;
  const byTime = (a: { block: { start: string } }, b: { block: { start: string } }) =>
    a.block.start.localeCompare(b.block.start);

  const todays = portal.visits.filter((v) => v.fecha === today && v.estado !== "tecnico_no_disponible").sort(byTime);
  const next = todays.find(isActive);
  const others = todays.filter((v) => v !== next);
  const done = todays.filter((v) => !isActive(v)).length;
  const tomorrows = portal.visits.filter((v) => v.fecha === tomorrow && isActive(v)).sort(byTime);
  const weekPending = !portal.availability.semanasConfirmadas.includes(nextMonday(today));
  const firstName = portal.tech.nombre.split(" ")[0];

  return (
    <div>
      <p className="text-sm text-ink-soft">{capitalize(formatLongDate(today))}</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">Hola, {firstName}</h1>
      <p className="mt-1 text-ink-soft">
        {todays.length === 0
          ? "Hoy no tienes visitas."
          : `${done} de ${todays.length} visita${todays.length === 1 ? "" : "s"} cerrada${todays.length === 1 ? "" : "s"} hoy.`}
      </p>
      {todays.length > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
          <div className="h-full rounded-full bg-ok transition-[width] duration-500" style={{ width: `${(done / todays.length) * 100}%` }} />
        </div>
      )}

      {weekPending && (
        <Link
          href="/instalador/disponibilidad"
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-accent-soft px-4 py-3 active:scale-[0.99]"
        >
          <span>
            <span className="block font-medium text-ink">Confirma tu disponibilidad</span>
            <span className="text-sm text-ink-soft">
              Semana del {dateParts(nextMonday(today)).day} {dateParts(nextMonday(today)).month}
            </span>
          </span>
          <ChevronRightIcon className="size-5 text-ink" />
        </Link>
      )}

      {next ? (
        <section aria-labelledby="siguiente" className="mt-6 rounded-3xl bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="siguiente" className="text-sm font-medium text-accent-ink">
                Tu siguiente visita
              </h2>
              <p className="mt-1 font-display text-3xl font-bold text-ink tabular-nums">{next.block.start}</p>
              <p className="text-ink-soft">
                {VISIT_TYPE_LABEL[next.tipo]} · {next.direccion.comuna}
              </p>
            </div>
            <StatusChip status={next.estado} />
          </div>
          <p className="mt-3 text-ink">
            {next.vehiculo.marca} {next.vehiculo.modelo} {next.vehiculo.anio} · {next.vehiculo.color}
          </p>
          {next.motivo && <p className="mt-2 rounded-xl bg-amber-soft px-3 py-2 text-sm text-ink">{next.motivo}</p>}
          <div className="mt-5">
            <NextStep visit={next} now={now} />
          </div>
          <Link href={`/instalador/visita/${next.id}`} className="mt-3 flex h-11 items-center justify-center gap-1 font-medium text-accent-ink">
            Ver detalle
            <ChevronRightIcon className="size-4" />
          </Link>
        </section>
      ) : (
        todays.length > 0 && (
          <p className="mt-6 rounded-3xl bg-ok-soft p-5 font-medium text-ok">Terminaste las visitas de hoy. ¡Buen trabajo!</p>
        )
      )}

      {others.length > 0 && (
        <Section title="Resto del día">
          <ul className="space-y-2">
            {others.map((v) => (
              <li key={v.id}>
                <VisitCard visit={v} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Mañana">
        {tomorrows.length ? (
          <ul className="space-y-2">
            {tomorrows.map((v) => (
              <li key={v.id}>
                <VisitCard visit={v} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-surface p-4 text-ink-soft">Sin visitas agendadas.</p>
        )}
      </Section>
    </div>
  );
}

export const TodayScreen = withPortal(TodayScreenInner);
