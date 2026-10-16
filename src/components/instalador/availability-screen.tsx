"use client";

import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/compra/fields";
import { Button } from "@/components/ui/button";
import { BanIcon, CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { addDays, BLOCKS } from "@/lib/agenda";
import { capitalize, dateParts, formatLongDate, type IsoDate } from "@/lib/format";
import { BLOCK_MOTIVES, dayView, nextMonday, weekDays, type DayView } from "@/lib/instalador/availability";
import { CUPO_MAX, VISIT_TYPE_LABEL, WEEKDAYS } from "@/lib/instalador/model";
import { mondayOf, todayIso } from "@/lib/instalador/rules";
import {
  addException,
  confirmWeek,
  removeException,
  setCupoDiario,
  toggleTemplateBlock,
  usePortal,
} from "@/lib/instalador/store";
import { useNow } from "@/lib/use-now";
import { ComunaList, ScreenHeader, Section, Sheet, withPortal } from "./ui";

const dayTone = (d: DayView) =>
  d.dayException
    ? "bg-danger-soft text-danger"
    : d.offered === 0 && d.reserved === 0
      ? "bg-bg text-muted"
      : "bg-surface text-ink";

function AvailabilityScreenInner() {
  const portal = usePortal()!;
  const now = useNow();
  const today = todayIso(now);
  const [openDate, setOpenDate] = useState<IsoDate | null>(null);
  const { availability, visits } = portal;

  const nextWeek = nextMonday(today);
  const nextWeekDays = weekDays(nextWeek).map((d) => dayView(d, availability, visits));
  const nextOffered = nextWeekDays.reduce((n, d) => n + d.offered, 0);
  const nextConfirmed = availability.semanasConfirmadas.includes(nextWeek);

  const start = mondayOf(today);
  const calendar = [0, 1, 2].map((w) => weekDays(addDays(start, w * 7).iso));

  return (
    <div>
      <ScreenHeader title="Disponibilidad" subtitle="Lo que ofreces define los horarios que ven los clientes." />

      {/* Recordatorio semanal (sección 9: "Confirma tu disponibilidad de la próxima semana"). */}
      <div className={`mt-6 rounded-2xl p-5 ${nextConfirmed ? "bg-ok-soft" : "bg-accent-soft"}`}>
        {nextConfirmed ? (
          <p className="flex items-center gap-2 font-medium text-ok">
            <CheckIcon className="size-5" />
            Semana del {dateParts(nextWeek).day} confirmada · {nextOffered} bloques ofrecidos
          </p>
        ) : (
          <>
            <p className="font-display text-lg font-bold text-ink">Confirma tu próxima semana</p>
            <p className="mt-1 text-sm text-ink-soft">
              Del {dateParts(nextWeek).weekday} {dateParts(nextWeek).day} al sáb{" "}
              {dateParts(addDays(nextWeek, 5).iso).day} {dateParts(nextWeek).month}: ofreces {nextOffered}{" "}
              bloques. Revisa tu plantilla y tus bloqueos antes de confirmar.
            </p>
            <Button className="mt-4 w-full sm:w-auto" onClick={() => confirmWeek(nextWeek)}>
              Confirmar semana
            </Button>
          </>
        )}
      </div>

      <Section title="Tu semana tipo">
        <p className="-mt-1 mb-3 text-sm text-ink-soft">Toca un bloque para ofrecerlo o dejar de ofrecerlo.</p>
        <div className="space-y-2">
          {WEEKDAYS.map((wd) => {
            const offered = availability.template[wd.n] ?? [];
            return (
              <div key={wd.n} className="flex items-center gap-3 rounded-2xl bg-surface p-2 pl-4">
                <span className="w-10 shrink-0 font-medium text-ink">{wd.short}</span>
                <div className="grid flex-1 grid-cols-4 gap-1.5">
                  {BLOCKS.map((b) => {
                    const on = offered.includes(b.start);
                    return (
                      <button
                        key={b.start}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${wd.long} ${b.start} a ${b.end}`}
                        onClick={() => toggleTemplateBlock(wd.n, b.start)}
                        className={`h-11 rounded-xl text-sm font-semibold tabular-nums transition-colors duration-150 active:scale-[0.97] ${
                          on ? "bg-brand text-on-brand" : "bg-bg text-muted"
                        }`}
                      >
                        {b.start}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted">Bloques de 2 horas. Los domingos no se agenda.</p>
      </Section>

      <Section title="Cupo diario">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface p-4">
          <div>
            <p className="text-ink">Máximo de visitas por día</p>
            <p className="text-sm text-muted">Operaciones permite hasta {CUPO_MAX}.</p>
          </div>
          <div className="flex items-center rounded-xl bg-bg" role="group" aria-label="Cupo diario">
            <button
              type="button"
              aria-label="Bajar cupo"
              disabled={availability.cupoDiario <= 1}
              onClick={() => setCupoDiario(availability.cupoDiario - 1)}
              className="flex size-12 items-center justify-center text-ink disabled:text-line-strong"
            >
              <MinusIcon className="size-5" />
            </button>
            <output aria-live="polite" className="w-8 text-center font-display text-xl font-bold text-ink">
              {availability.cupoDiario}
            </output>
            <button
              type="button"
              aria-label="Subir cupo"
              disabled={availability.cupoDiario >= CUPO_MAX}
              onClick={() => setCupoDiario(availability.cupoDiario + 1)}
              className="flex size-12 items-center justify-center text-ink disabled:text-line-strong"
            >
              <PlusIcon className="size-5" />
            </button>
          </div>
        </div>
      </Section>

      <Section title="Bloquear fechas">
        <p className="-mt-1 mb-3 text-sm text-ink-soft">Toca un día para bloquearlo completo o por bloques.</p>
        <div className="grid grid-cols-6 gap-1.5 text-center text-xs text-muted">
          {WEEKDAYS.map((wd) => (
            <span key={wd.n}>{wd.short}</span>
          ))}
        </div>
        <div className="mt-2 space-y-1.5">
          {calendar.map((week) => (
            <div key={week[0]} className="grid grid-cols-6 gap-1.5">
              {week.map((date) => {
                const view = dayView(date, availability, visits);
                const past = date < today;
                const partial = view.slots.some((s) => s.state === "bloqueado") && !view.dayException;
                const label = `${capitalize(formatLongDate(date))}: ${
                  view.dayException ? "bloqueado" : `${view.reserved} reservadas, ${view.offered} disponibles`
                }`;
                return (
                  <button
                    key={date}
                    type="button"
                    disabled={past}
                    aria-label={label}
                    onClick={() => setOpenDate(date)}
                    className={`relative flex h-16 flex-col items-center justify-center rounded-xl transition-transform active:scale-[0.96] disabled:opacity-35 ${dayTone(view)} ${
                      date === today ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    <span className="font-display text-lg font-bold">{dateParts(date).day}</span>
                    <span className="mt-0.5 flex gap-0.5" aria-hidden="true">
                      {view.dayException ? (
                        <BanIcon className="size-3.5" />
                      ) : (
                        view.slots.map((s) => (
                          <span
                            key={s.start}
                            className={`size-1.5 rounded-full ${
                              s.state === "reservado"
                                ? "bg-accent"
                                : s.state === "disponible"
                                  ? "bg-ok"
                                  : s.state === "bloqueado"
                                    ? "bg-danger"
                                    : "bg-line-strong"
                            }`}
                          />
                        ))
                      )}
                    </span>
                    {partial && <span className="sr-only">Con bloques bloqueados</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent" />Reservado</li>
          <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-ok" />Disponible</li>
          <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-danger" />Bloqueado</li>
          <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-line-strong" />No ofrecido o sin cupo</li>
        </ul>
      </Section>

      <Section title="Comunas que atiendes">
        {/* Solo lectura: las define Operaciones (instalador_comunas). */}
        <ComunaList comunas={portal.tech.comunas} />
        <p className="mt-2 text-sm text-muted">Para cambiarlas, escribe a Operaciones.</p>
      </Section>

      {openDate && (
        <DaySheet date={openDate} onClose={() => setOpenDate(null)} />
      )}
    </div>
  );
}

function DaySheet({ date, onClose }: { date: IsoDate; onClose: () => void }) {
  const portal = usePortal()!;
  const view = dayView(date, portal.availability, portal.visits);
  const [motivo, setMotivo] = useState(BLOCK_MOTIVES[0]);
  const [error, setError] = useState<string | null>(null);

  function block(blockStart: string | null) {
    setError(addException(date, blockStart, motivo));
  }

  return (
    <Sheet open onClose={onClose} title={capitalize(formatLongDate(date))}>
      <label htmlFor="motivo-bloqueo" className="text-sm font-medium text-ink">
        Motivo del bloqueo
      </label>
      <Select id="motivo-bloqueo" className="mt-1.5" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
        {BLOCK_MOTIVES.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </Select>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-amber-soft px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}

      <ul className="mt-5 space-y-2">
        {view.slots.map((s) => (
          <li key={s.start} className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-bg px-4 py-2">
            <div className="min-w-0">
              <p className="font-medium text-ink tabular-nums">
                {s.start} – {s.end}
              </p>
              <p className="text-sm text-ink-soft">
                {s.state === "reservado" && s.visit
                  ? `${VISIT_TYPE_LABEL[s.visit.tipo]} · ${s.visit.direccion.comuna}`
                  : s.state === "bloqueado"
                    ? `Bloqueado · ${s.exception?.motivo}`
                    : s.state === "sin_cupo"
                      ? "Sin cupo: llenaste tu máximo del día"
                      : s.state === "no_ofrecido"
                        ? "No está en tu semana tipo"
                        : "Disponible para clientes"}
              </p>
            </div>
            {s.state === "reservado" && s.visit ? (
              <Link href={`/instalador/visita/${s.visit.id}`} className="shrink-0 text-sm font-medium text-accent-ink">
                Ver visita
              </Link>
            ) : s.state === "bloqueado" && s.exception ? (
              <Button size="sm" variant="secondary" onClick={() => removeException(s.exception!.id)}>
                Desbloquear
              </Button>
            ) : s.state === "disponible" || s.state === "sin_cupo" ? (
              <Button size="sm" variant="secondary" onClick={() => block(s.start)}>
                Bloquear
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      {view.reserved > 0 && (
        <p className="mt-4 text-sm text-ink-soft">
          Un bloque reservado no se puede bloquear: abre la visita y usa «No puedo asistir» para que la
          reasignemos.
        </p>
      )}

      <div className="mt-5">
        {view.dayException ? (
          <Button variant="secondary" size="lg" className="w-full" onClick={() => removeException(view.dayException!.id)}>
            Desbloquear el día
          </Button>
        ) : (
          <Button size="lg" className="w-full" disabled={view.reserved > 0} onClick={() => block(null)}>
            <BanIcon className="size-4" />
            Bloquear todo el día
          </Button>
        )}
      </div>
    </Sheet>
  );
}

export const AvailabilityScreen = withPortal(AvailabilityScreenInner);
