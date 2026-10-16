// Cálculo de cupos de instalación (especificación del módulo de instaladores,
// sección 7.1). Parámetros iniciales propuestos, configurables y a validar con
// operaciones. La disponibilidad es FICTICIA pero determinista: la misma comuna
// y fecha siempre muestran los mismos cupos.

import { coverageTier } from "./comunas";
import { SANTIAGO_TZ, type IsoDate } from "./format";

export interface Block {
  start: string;
  end: string;
}

export const BLOCKS: Block[] = [
  { start: "09:00", end: "11:00" },
  { start: "11:00", end: "13:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
];

export const MIN_LEAD_HOURS = 24;
export const HORIZON_DAYS = 21;
export const EXTENDED_HORIZON_DAYS = 42;
export const HOLD_MINUTES = 10;

export interface DaySlots {
  date: IsoDate;
  blocks: Block[];
}

const nowFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SANTIAGO_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Fecha y minuto del día en Santiago para un instante dado. */
export function santiagoNow(nowMs: number): { date: IsoDate; minutes: number } {
  const parts = Object.fromEntries(
    nowFormatter.formatToParts(new Date(nowMs)).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function addDays(iso: IsoDate, days: number): { iso: IsoDate; weekday: number } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return { iso: date.toISOString().slice(0, 10), weekday: date.getUTCDay() };
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** FNV-1a de 32 bits: reparte cupos ficticios de forma estable. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function isAvailable(comuna: string, date: IsoDate, block: Block, dayIndex: number): boolean {
  const tier = coverageTier(comuna);
  const roll = hash(`${comuna}|${date}|${block.start}`) % 100;
  switch (tier) {
    case "alta":
      return roll < 62;
    case "media":
      return roll < 36;
    case "baja":
      return dayIndex > HORIZON_DAYS && roll < 30;
    default:
      return false;
  }
}

/**
 * Días de lunes a sábado dentro del horizonte, con solo los bloques que
 * respetan la anticipación mínima y tienen un técnico libre. `isFree` reemplaza
 * la disponibilidad ficticia cuando hay un técnico real (en la demo, el del portal).
 */
export function buildSchedule(
  comuna: string,
  nowMs: number,
  horizonDays: number,
  isFree?: (date: IsoDate, block: Block) => boolean,
): DaySlots[] {
  const now = santiagoNow(nowMs);
  const earliest = now.minutes + MIN_LEAD_HOURS * 60;
  const days: DaySlots[] = [];

  for (let i = 1; i <= horizonDays; i++) {
    const { iso, weekday } = addDays(now.date, i);
    if (weekday === 0) continue;
    const blocks = BLOCKS.filter(
      (block) =>
        i * 24 * 60 + toMinutes(block.start) >= earliest &&
        (isFree ? isFree(iso, block) : isAvailable(comuna, iso, block, i)),
    );
    days.push({ date: iso, blocks });
  }
  return days;
}

export function countSlots(days: DaySlots[]): number {
  return days.reduce((total, day) => total + day.blocks.length, 0);
}

/** Archivo .ics para agregar la visita al calendario. */
export function buildIcs(params: {
  date: IsoDate;
  block: Block;
  title: string;
  location: string;
  description: string;
  uid: string;
}): string {
  const stamp = (time: string) => `${params.date.replaceAll("-", "")}T${time.replace(":", "")}00`;
  const escape = (text: string) => text.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alpha Tecnologia//Alpha Link GPS//ES",
    "BEGIN:VEVENT",
    `UID:${params.uid}@alphalinkgps`,
    `DTSTART;TZID=${SANTIAGO_TZ}:${stamp(params.block.start)}`,
    `DTEND;TZID=${SANTIAGO_TZ}:${stamp(params.block.end)}`,
    `SUMMARY:${escape(params.title)}`,
    `LOCATION:${escape(params.location)}`,
    `DESCRIPTION:${escape(params.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
