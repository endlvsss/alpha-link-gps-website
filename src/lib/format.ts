const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

/** $12.990 */
export function clp(value: number): string {
  return clpFormatter.format(value);
}

export const SANTIAGO_TZ = "America/Santiago";

/** Fecha civil (sin hora) en formato YYYY-MM-DD. */
export type IsoDate = string;

const longDate = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const shortWeekday = new Intl.DateTimeFormat("es-CL", { weekday: "short", timeZone: "UTC" });
const shortMonth = new Intl.DateTimeFormat("es-CL", { month: "short", timeZone: "UTC" });

function isoToUtcDate(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** "martes 21 de octubre" */
export function formatLongDate(iso: IsoDate): string {
  return longDate.format(isoToUtcDate(iso));
}

/** { weekday: "mar", day: 21, month: "oct" } */
export function dateParts(iso: IsoDate) {
  const date = isoToUtcDate(iso);
  return {
    weekday: shortWeekday.format(date).replace(".", ""),
    day: date.getUTCDate(),
    month: shortMonth.format(date).replace(".", ""),
  };
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
