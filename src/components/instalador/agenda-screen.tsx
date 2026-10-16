"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { addDays } from "@/lib/agenda";
import { capitalize, dateParts, formatLongDate } from "@/lib/format";
import { dayView, SLOT_LABEL, weekDays, type SlotState } from "@/lib/instalador/availability";
import { VISIT_TYPE_LABEL } from "@/lib/instalador/model";
import { mondayOf, todayIso } from "@/lib/instalador/rules";
import { usePortal } from "@/lib/instalador/store";
import { useNow } from "@/lib/use-now";
import { ScreenHeader, StatusChip, withPortal } from "./ui";

const slotClass: Record<SlotState, string> = {
  reservado: "bg-accent-soft",
  disponible: "bg-surface",
  bloqueado: "bg-danger-soft",
  sin_cupo: "bg-bg",
  no_ofrecido: "bg-bg",
};

const slotText: Record<SlotState, string> = {
  reservado: "text-ink",
  disponible: "text-ok",
  bloqueado: "text-danger",
  sin_cupo: "text-muted",
  no_ofrecido: "text-muted",
};

const WEEKS = 3;

function AgendaScreenInner() {
  const portal = usePortal()!;
  const today = todayIso(useNow());
  const [week, setWeek] = useState(0);
  const monday = addDays(mondayOf(today), week * 7).iso;
  const days = weekDays(monday).map((d) => dayView(d, portal.availability, portal.visits));
  const total = days.reduce((n, d) => n + d.reserved, 0);
  const sat = addDays(monday, 5).iso;

  return (
    <div>
      <ScreenHeader title="Mi agenda" subtitle={`${total} visita${total === 1 ? "" : "s"} esta semana`} />

      <div className="mt-5 flex items-center justify-between gap-2 rounded-2xl bg-surface p-1.5">
        <button
          type="button"
          onClick={() => setWeek((w) => w - 1)}
          disabled={week === 0}
          aria-label="Semana anterior"
          className="flex size-11 items-center justify-center rounded-xl text-ink active:bg-ink/[0.06] disabled:text-line-strong"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <p className="text-center font-medium text-ink" aria-live="polite">
          {week === 0 ? "Esta semana" : week === 1 ? "Próxima semana" : "En dos semanas"}
          <span className="block text-sm font-normal text-muted">
            {dateParts(monday).day} {dateParts(monday).month} – {dateParts(sat).day} {dateParts(sat).month}
          </span>
        </p>
        <button
          type="button"
          onClick={() => setWeek((w) => w + 1)}
          disabled={week === WEEKS - 1}
          aria-label="Semana siguiente"
          className="flex size-11 items-center justify-center rounded-xl text-ink active:bg-ink/[0.06] disabled:text-line-strong"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>

      <ol className="mt-6 space-y-6">
        {days.map((day) => (
          <li key={day.date}>
            <h2 className={`flex items-baseline gap-2 font-display text-lg font-bold ${day.date < today ? "text-muted" : "text-ink"}`}>
              {capitalize(formatLongDate(day.date))}
              {day.date === today && <span className="text-sm font-semibold text-accent-ink">Hoy</span>}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {day.slots.map((s) => {
                const body = (
                  <>
                    <span className="w-14 shrink-0 font-medium text-ink tabular-nums">{s.start}</span>
                    <span className={`min-w-0 flex-1 truncate ${slotText[s.state]}`}>
                      {s.visit
                        ? `${VISIT_TYPE_LABEL[s.visit.tipo]} · ${s.visit.direccion.comuna}`
                        : s.state === "bloqueado"
                          ? `Bloqueado · ${s.exception?.motivo}`
                          : SLOT_LABEL[s.state]}
                    </span>
                    {s.visit && <StatusChip status={s.visit.estado} />}
                    {s.visit && <ChevronRightIcon className="size-4 shrink-0 text-muted" />}
                  </>
                );
                return (
                  <li key={s.start}>
                    {s.visit ? (
                      <Link
                        href={`/instalador/visita/${s.visit.id}`}
                        className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-2 active:scale-[0.99] ${slotClass[s.state]}`}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-2 ${slotClass[s.state]}`}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-center text-sm text-muted">
        Para bloquear horarios, ve a{" "}
        <Link href="/instalador/disponibilidad" className="font-medium text-accent-ink">
          Disponibilidad
        </Link>
        .
      </p>
    </div>
  );
}

export const AgendaScreen = withPortal(AgendaScreenInner);
