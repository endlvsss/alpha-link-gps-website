import { addDays, BLOCKS, type Block } from "@/lib/agenda";
import type { IsoDate } from "@/lib/format";
import type { Availability, AvailabilityException, Visit } from "./model";
import { isActive, mondayOf, weekdayOf } from "./rules";

export type SlotState = "reservado" | "disponible" | "bloqueado" | "sin_cupo" | "no_ofrecido";

export interface SlotView extends Block {
  state: SlotState;
  visit?: Visit;
  exception?: AvailabilityException;
}

export interface DayView {
  date: IsoDate;
  weekday: number;
  slots: SlotView[];
  reserved: number;
  /** Bloques que verían los clientes (disponibles y con cupo). */
  offered: number;
  dayException?: AvailabilityException;
}

/**
 * Cómo queda un día para el técnico (sección 7.1): un bloque se ofrece si está en
 * su plantilla, no hay una excepción que lo bloquee, no tiene visita y no llenó
 * su cupo diario.
 */
export function dayView(date: IsoDate, availability: Availability, visits: Visit[]): DayView {
  const weekday = weekdayOf(date);
  const template = availability.template[weekday] ?? [];
  const dayException = availability.excepciones.find((e) => e.date === date && e.block === null);
  const dayVisits = visits.filter((v) => v.fecha === date && isActive(v));
  const reserved = dayVisits.length;
  const full = reserved >= availability.cupoDiario;

  const slots: SlotView[] = BLOCKS.map((b) => {
    const visit = dayVisits.find((v) => v.block.start === b.start);
    if (visit) return { ...b, state: "reservado", visit };
    const exception =
      dayException ?? availability.excepciones.find((e) => e.date === date && e.block === b.start);
    if (exception) return { ...b, state: "bloqueado", exception };
    if (weekday === 0 || !template.includes(b.start)) return { ...b, state: "no_ofrecido" };
    if (full) return { ...b, state: "sin_cupo" };
    return { ...b, state: "disponible" };
  });

  return {
    date,
    weekday,
    slots,
    reserved,
    offered: slots.filter((s) => s.state === "disponible").length,
    dayException,
  };
}

/** Lunes a sábado de una semana. */
export function weekDays(monday: IsoDate): IsoDate[] {
  return [0, 1, 2, 3, 4, 5].map((i) => addDays(monday, i).iso);
}

export function nextMonday(today: IsoDate): IsoDate {
  return addDays(mondayOf(today), 7).iso;
}

export const SLOT_LABEL: Record<SlotState, string> = {
  reservado: "Reservado",
  disponible: "Disponible",
  bloqueado: "Bloqueado",
  sin_cupo: "Sin cupo",
  no_ofrecido: "No ofrecido",
};

export const BLOCK_MOTIVES = ["Personal", "Médico", "Vehículo en taller", "Otro trabajo", "Otro"];
