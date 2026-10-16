"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import {
  buildSchedule,
  countSlots,
  EXTENDED_HORIZON_DAYS,
  HOLD_MINUTES,
  HORIZON_DAYS,
  type Block,
} from "@/lib/agenda";
import { capitalize, dateParts, formatLongDate, type IsoDate } from "@/lib/format";
import { useTechSlots } from "@/lib/instalador/bridge";
import { holdSlot } from "@/lib/purchase-store";
import { NoSlots } from "./no-slots";

interface SlotPickerProps {
  comuna: string;
  now: number;
  waitlisted: boolean;
  email: string;
}

export function SlotPicker({ comuna, now, waitlisted, email }: SlotPickerProps) {
  const [horizon, setHorizon] = useState(HORIZON_DAYS);
  const [pickedDate, setPickedDate] = useState<IsoDate | null>(null);
  const [pickedStart, setPickedStart] = useState<string | null>(null);

  // La disponibilidad se recalcula por minuto, no por segundo.
  const minute = Math.floor(now / 60_000);
  // Demo: en las comunas del técnico de prueba, manda su disponibilidad del portal.
  const techSlots = useTechSlots(comuna);
  const days = useMemo(
    () => buildSchedule(comuna, minute * 60_000, horizon, techSlots),
    [comuna, minute, horizon, techSlots],
  );
  const total = countSlots(days);

  if (total === 0) {
    return (
      <NoSlots
        comuna={comuna}
        extended={horizon >= EXTENDED_HORIZON_DAYS}
        onExtend={() => setHorizon(EXTENDED_HORIZON_DAYS)}
        waitlisted={waitlisted}
        email={email}
      />
    );
  }

  const firstAvailable = days.find((d) => d.blocks.length > 0)!;
  const selectedDay = days.find((d) => d.date === pickedDate && d.blocks.length > 0) ?? firstAvailable;
  const selectedBlock: Block | undefined =
    selectedDay.blocks.find((b) => b.start === pickedStart) ?? undefined;

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-sm font-medium text-ink">1. Elige el día</legend>
        <div className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-6 sm:overflow-visible sm:px-0 sm:pb-0">
          {days.map((day) => {
            const parts = dateParts(day.date);
            const available = day.blocks.length;
            const checked = day.date === selectedDay.date;
            return (
              <label
                key={day.date}
                className={`relative flex w-[4.75rem] shrink-0 snap-start flex-col items-center rounded-xl border px-2 py-2.5 text-center transition-colors duration-150 sm:w-auto ${
                  available === 0
                    ? "cursor-not-allowed border-line/70 text-muted/70"
                    : checked
                      ? "cursor-pointer border-brand bg-brand text-on-brand"
                      : "cursor-pointer border-line bg-surface text-ink hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="dia"
                  value={day.date}
                  checked={checked}
                  disabled={available === 0}
                  onChange={() => {
                    setPickedDate(day.date);
                    setPickedStart(null);
                  }}
                  className="peer sr-only"
                  aria-label={`${capitalize(formatLongDate(day.date))}, ${
                    available === 0 ? "sin horarios" : `${available} ${available === 1 ? "horario" : "horarios"}`
                  }`}
                />
                <span className="text-xs capitalize opacity-80">{parts.weekday}</span>
                <span className="font-display text-xl leading-tight font-semibold">{parts.day}</span>
                <span className="text-xs capitalize opacity-80">{parts.month}</span>
                <span
                  className={`mt-1 text-xs font-medium ${
                    available === 0 ? "" : checked ? "text-on-brand/85" : "text-accent-ink"
                  }`}
                  aria-hidden="true"
                >
                  {available === 0 ? "Sin cupo" : `${available} ${available === 1 ? "cupo" : "cupos"}`}
                </span>
                <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring" />
              </label>
            );
          })}
        </div>
        {horizon < EXTENDED_HORIZON_DAYS && (
          <button
            type="button"
            onClick={() => setHorizon(EXTENDED_HORIZON_DAYS)}
            className="mt-3 text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
          >
            Ver más fechas
          </button>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-ink">
          2. Elige el bloque · {capitalize(formatLongDate(selectedDay.date))}
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {selectedDay.blocks.map((block) => {
            const checked = block.start === selectedBlock?.start;
            return (
              <label
                key={block.start}
                className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 transition-colors duration-150 ${
                  checked ? "border-brand ring-1 ring-brand" : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="bloque"
                  value={block.start}
                  checked={checked}
                  onChange={() => setPickedStart(block.start)}
                  className="peer sr-only"
                />
                <span className="font-mono text-base text-ink">
                  {block.start} – {block.end}
                </span>
                <span
                  className={`flex size-5 items-center justify-center rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${
                    checked ? "border-brand bg-brand text-on-brand" : "border-line-strong"
                  }`}
                  aria-hidden="true"
                >
                  {checked && <CheckIcon className="size-3" />}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">
          El técnico llega dentro del bloque que elijas.
        </p>
        <p className="mt-2 rounded-xl bg-bg-sunken px-3 py-2 text-sm text-muted">
          {techSlots
            ? `Demo interna: en ${comuna} estos horarios salen de la disponibilidad del técnico de prueba en el portal (/instalador). Si bloquea un bloque, desaparece aquí.`
            : `Demo interna: ${comuna} tiene cobertura baja y no está conectada al portal; estos horarios son ficticios.`}
        </p>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Al reservar, guardamos el horario por {HOLD_MINUTES} minutos para que lo confirmes.
        </p>
        <Button
          size="lg"
          disabled={!selectedBlock}
          onClick={() =>
            selectedBlock &&
            holdSlot(selectedDay.date, selectedBlock, now + HOLD_MINUTES * 60_000)
          }
        >
          {selectedBlock ? `Reservar ${selectedBlock.start}` : "Elige un bloque"}
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
