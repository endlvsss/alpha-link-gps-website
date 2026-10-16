import { addDays, santiagoNow, toMinutes } from "@/lib/agenda";
import type { IsoDate } from "@/lib/format";
import {
  checklistFor,
  CHECKIN_PHOTOS,
  INSTALL_PHOTOS,
  PRIVACY_AFTER_H,
  PRIVACY_BEFORE_H,
  testsFor,
  type Visit,
  type VisitStatus,
} from "./model";
import { imeiProblem } from "@/lib/imei";
import { isValidRut } from "@/lib/rut";
import { normalizePatente } from "@/lib/validation";

/** Estados que ocupan el bloque del técnico (restricción única de la sección 5). */
export const ACTIVE_STATUSES: VisitStatus[] = [
  "agendada",
  "confirmada",
  "en_camino",
  "en_sitio",
  "en_instalacion",
  "en_pruebas",
];

export const IN_PROGRESS: VisitStatus[] = ["en_sitio", "en_instalacion", "en_pruebas"];

export function isActive(v: Visit): boolean {
  return ACTIVE_STATUSES.includes(v.estado);
}

export function isClosed(v: Visit): boolean {
  return !isActive(v);
}

export const STATUS_LABEL: Record<VisitStatus, string> = {
  agendada: "Por confirmar",
  confirmada: "Confirmada",
  en_camino: "En camino",
  en_sitio: "En el lugar",
  en_instalacion: "Instalando",
  en_pruebas: "En pruebas",
  cerrada_ok: "Cerrada",
  fallida: "Con incidencia",
  no_show_cliente: "Cliente no estaba",
  tecnico_no_disponible: "Reasignada",
};

export type Tone = "accent" | "amber" | "ok" | "danger" | "muted";

export const STATUS_TONE: Record<VisitStatus, Tone> = {
  agendada: "amber",
  confirmada: "accent",
  en_camino: "accent",
  en_sitio: "accent",
  en_instalacion: "accent",
  en_pruebas: "accent",
  cerrada_ok: "ok",
  fallida: "danger",
  no_show_cliente: "muted",
  tecnico_no_disponible: "muted",
};

/**
 * Estado del cliente según la taxonomía del Service Blueprint B2C v2 (sección 6.1).
 * Las visitas técnicas parten de un cliente ACTIVO con SOPORTE ABIERTO.
 */
export function clientStatus(v: Visit): { stage: string; substate: string | null } {
  const support = v.tipo === "visita_tecnica";
  switch (v.estado) {
    case "agendada":
    case "confirmada":
    case "tecnico_no_disponible":
    case "no_show_cliente":
      return support
        ? { stage: "ACTIVO", substate: "SOPORTE ABIERTO" }
        : { stage: "INSTALACIÓN AGENDADA", substate: null };
    case "en_camino":
      return support
        ? { stage: "ACTIVO", substate: "SOPORTE ABIERTO" }
        : { stage: "INSTALACIÓN AGENDADA", substate: "TÉCNICO EN CAMINO" };
    case "en_sitio":
    case "en_instalacion":
    case "en_pruebas":
      return support
        ? { stage: "ACTIVO", substate: "SOPORTE ABIERTO" }
        : { stage: "INSTALACIÓN AGENDADA", substate: "EN INSTALACIÓN" };
    case "cerrada_ok":
      return { stage: "ACTIVO", substate: null };
    case "fallida":
      return support
        ? { stage: "ACTIVO", substate: "SOPORTE ABIERTO" }
        : { stage: "INSTALACIÓN AGENDADA", substate: "INCIDENCIA INSTALACIÓN" };
  }
}

function dayDiff(from: IsoDate, to: IsoDate): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** Minutos desde ahora hasta el inicio del bloque (negativo si ya empezó). Hora de Santiago. */
export function minutesUntil(v: Pick<Visit, "fecha" | "block">, nowMs: number): number {
  const now = santiagoNow(nowMs);
  return dayDiff(now.date, v.fecha) * 1440 + toMinutes(v.block.start) - now.minutes;
}

/**
 * Minimización de datos (Ley 21.719): teléfono y dirección exacta solo desde 24 h
 * antes de la visita y hasta 48 h después del cierre. Fuera de la ventana: comuna,
 * vehículo y horario.
 */
export function canSeeContact(v: Visit, nowMs: number): boolean {
  if (!nowMs) return false;
  const until = minutesUntil(v, nowMs);
  if (until > PRIVACY_BEFORE_H * 60) return false;
  if (v.closedAt) return nowMs - Date.parse(v.closedAt) <= PRIVACY_AFTER_H * 3_600_000;
  return true;
}

/** Cuándo se abre la ventana, para explicárselo al técnico. */
export function contactOpensAt(v: Visit): string {
  const prev = addDays(v.fecha, -1).iso;
  return `${prev.slice(8, 10)}/${prev.slice(5, 7)} a las ${v.block.start}`;
}

export function todayIso(nowMs: number): IsoDate {
  return santiagoNow(nowMs || Date.now()).date;
}

/** Lunes de la semana de una fecha. */
export function mondayOf(iso: IsoDate): IsoDate {
  const d = new Date(`${iso}T12:00:00Z`);
  const wd = d.getUTCDay() || 7;
  return addDays(iso, 1 - wd).iso;
}

export function weekdayOf(iso: IsoDate): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

// ——— Validaciones del asistente (precondiciones duras, sección 6.2) ———

export function checkinIssues(v: Visit): string[] {
  const c = v.registro.checkin;
  const issues: string[] = [];
  const entered = normalizePatente(c.patente);
  if (!entered) issues.push("Escribe la patente que ves en el vehículo.");
  else if (entered !== normalizePatente(v.vehiculo.patente)) issues.push("La patente no coincide con la orden.");
  const missing = CHECKIN_PHOTOS.filter((p) => !c.fotos[p.id]);
  if (missing.length) issues.push(`Faltan ${missing.length} foto${missing.length > 1 ? "s" : ""} obligatoria${missing.length > 1 ? "s" : ""}.`);
  return issues;
}

export function patenteMismatch(v: Visit): boolean {
  const entered = normalizePatente(v.registro.checkin.patente);
  return entered.length === 6 && entered !== normalizePatente(v.vehiculo.patente);
}

export function installIssues(v: Visit, imeiError: string | null): string[] {
  const i = v.registro.instalacion;
  const issues: string[] = [];
  if (imeiError) issues.push(imeiError);
  const missing = INSTALL_PHOTOS.filter((p) => !i.fotos[p.id]);
  if (missing.length) issues.push("Faltan las fotos de ubicación y conexiones.");
  return issues;
}

export function testsDone(v: Visit): boolean {
  return testsFor(v.planId).every((t) => v.registro.pruebas[t.id] === "ok") && v.registro.verificacion === "ok";
}

export function anyTestFailed(v: Visit): boolean {
  return Object.values(v.registro.pruebas).includes("fallo");
}

export function checkoutIssues(v: Visit): string[] {
  const c = v.registro.checkout;
  const issues: string[] = [];
  if (!checklistFor(v.planId).every((item) => c.checklist[item.id])) issues.push("Completa el checklist técnico.");
  if (imeiProblem(c.imeiFinal) || c.imeiFinal !== v.registro.instalacion.imei)
    issues.push("Confirma el IMEI final: debe ser el mismo que instalaste.");
  if (!c.fotoFinal) issues.push("Falta la foto final del vehículo.");
  if (c.receptorNombre.trim().split(/\s+/).length < 2) issues.push("Escribe nombre y apellido de quien recibe.");
  if (!isValidRut(c.receptorRut)) issues.push("Revisa el RUT de quien recibe.");
  if (!c.firma) issues.push("Falta la firma de quien recibe.");
  if (!c.conformidad) issues.push("Falta la conformidad con el estado registrado en el check-in.");
  return issues;
}

/** Texto del reporte de falla según el tipo: una visita técnica no es una instalación. */
export function failureLabel(visit: Visit): string {
  return visit.tipo === "visita_tecnica" ? "Reportar visita sin solución" : "Reportar instalación fallida";
}
