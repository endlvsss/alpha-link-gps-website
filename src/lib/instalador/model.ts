// Modelo del portal del técnico freelance (Especificación del módulo de
// instaladores v0.2, secciones 4–8). Datos ficticios hasta tener el CRM.

import type { Block } from "@/lib/agenda";
import type { IsoDate } from "@/lib/format";
import type { GeoPoint } from "@/lib/image";
import type { PlanId } from "@/lib/plans";

export type VisitType = "instalacion" | "segunda_visita" | "visita_tecnica" | "traslado";

/** Estado interno de la visita (sección 6.2). */
export type VisitStatus =
  | "agendada"
  | "confirmada"
  | "en_camino"
  | "en_sitio"
  | "en_instalacion"
  | "en_pruebas"
  | "cerrada_ok"
  | "fallida"
  | "no_show_cliente"
  | "tecnico_no_disponible";

/** Causas de instalación fallida (sección 8.3). */
export type FailureCause =
  | "electrico"
  | "incompatibilidad"
  | "falla_gps"
  | "senal"
  | "plataforma"
  | "falta_componente"
  | "otro";

export type TestId = "conexion" | "posicion" | "comunicacion" | "estado" | "tag" | "corte" | "sirena";
export type TestState = "pendiente" | "probando" | "ok" | "fallo";

export type CheckinPhotoId = "frontal" | "trasera" | "lateral_izq" | "lateral_der" | "tablero";
export type InstallPhotoId = "ubicacion" | "conexiones";

export interface Photo {
  id: string;
  thumb: string;
  bytes: number;
  takenAt: string;
  sample: boolean;
}

export interface ContactAttempt {
  tipo: "llamada" | "mensaje";
  at: string;
  resultado: string;
}

export interface Registro {
  step: number;
  checkin: {
    patente: string;
    fotos: Partial<Record<CheckinPhotoId, Photo>>;
    danos: Photo[];
    kilometraje: string;
    observaciones: string;
    at: string | null;
    geo: GeoPoint | null;
  };
  instalacion: {
    imei: string;
    accesorios: Record<string, boolean>;
    fotos: Partial<Record<InstallPhotoId, Photo>>;
  };
  pruebas: Partial<Record<TestId, TestState>>;
  verificacion: "idle" | "esperando" | "ok";
  checkout: {
    checklist: Record<string, boolean>;
    imeiFinal: string;
    fotoFinal: Photo | null;
    receptorNombre: string;
    receptorRut: string;
    firma: string | null;
    conformidad: boolean;
    at: string | null;
    geo: GeoPoint | null;
  };
}

export interface Visit {
  id: string;
  folio: string;
  tipo: VisitType;
  fecha: IsoDate;
  block: Block;
  estado: VisitStatus;
  cliente: { nombre: string; telefono: string };
  direccion: { calle: string; detalle: string; comuna: string; indicaciones: string };
  vehiculo: { patente: string; marca: string; modelo: string; anio: string; color: string };
  planId: PlanId;
  /** Origen de la visita: ticket, segunda visita o traslado. */
  motivo: string | null;
  notas: string;
  llegadaAt: string | null;
  closedAt: string | null;
  registro: Registro;
  falla: { causa: FailureCause; descripcion: string; fotos: Photo[]; imei: string; at: string; ticket: string } | null;
  noShow: { fotos: Photo[]; intentos: ContactAttempt[]; at: string | null };
  noPuedo: { motivo: string; at: string } | null;
  events: { label: string; at: string }[];
}

export interface Device {
  imei: string;
  modelo: string;
  sim: string;
  estado: "en_custodia" | "instalado";
  visitaId: string | null;
}

export interface AvailabilityException {
  id: string;
  date: IsoDate;
  /** null = todo el día. */
  block: string | null;
  motivo: string;
}

export interface Availability {
  /** Plantilla semanal: 1 = lunes … 6 = sábado → inicios de bloque ofrecidos. */
  template: Record<number, string[]>;
  cupoDiario: number;
  excepciones: AvailabilityException[];
  /** Lunes (YYYY-MM-DD) de cada semana confirmada. */
  semanasConfirmadas: IsoDate[];
}

export interface Technician {
  nombre: string;
  rut: string;
  telefono: string;
  email: string;
  comunas: string[];
  estado: "activo";
  validadoEn: IsoDate;
}

// ——— Parámetros (configurables por Operaciones, a validar) ———

/** Máximo de visitas por día que fija Operaciones (sección 4.1, I4). */
export const CUPO_MAX = 3;
/** El técnico ve teléfono y dirección exacta desde 24 h antes hasta 48 h después del cierre (sección 3). */
export const PRIVACY_BEFORE_H = 24;
export const PRIVACY_AFTER_H = 48;
/** Umbral propuesto para "técnico no inició trayecto" (sección 7.5). POR DEFINIR. */
export const TRIP_DEADLINE_MIN = 45;
/** Espera propuesta antes de registrar no-show (sección 8.2). POR DEFINIR. */
export const NO_SHOW_WAIT_MIN = 15;
export const NO_SHOW_MIN_ATTEMPTS = 2;

export const WEEKDAYS = [
  { n: 1, short: "Lun", long: "Lunes" },
  { n: 2, short: "Mar", long: "Martes" },
  { n: 3, short: "Mié", long: "Miércoles" },
  { n: 4, short: "Jue", long: "Jueves" },
  { n: 5, short: "Vie", long: "Viernes" },
  { n: 6, short: "Sáb", long: "Sábado" },
] as const;

export const VISIT_TYPE_LABEL: Record<VisitType, string> = {
  instalacion: "Instalación",
  segunda_visita: "Segunda visita",
  visita_tecnica: "Visita técnica",
  traslado: "Traslado de equipo",
};

export const FAILURE_CAUSES: { id: FailureCause; label: string; hint: string }[] = [
  { id: "electrico", label: "Eléctrico del vehículo", hint: "Batería, alimentación o ignición con problemas." },
  { id: "incompatibilidad", label: "Incompatibilidad", hint: "El vehículo no admite la instalación estándar." },
  { id: "falla_gps", label: "Falla del GPS", hint: "El equipo no enciende o está dañado." },
  { id: "senal", label: "Señal", hint: "El GPS no logra posición o comunicación." },
  { id: "plataforma", label: "Plataforma", hint: "El equipo reporta, pero la plataforma no lo muestra." },
  { id: "falta_componente", label: "Falta de componente", hint: "Falta un accesorio, relé o cable." },
  { id: "otro", label: "Otro", hint: "Descríbelo con detalle." },
];

export const CHECKIN_PHOTOS: { id: CheckinPhotoId; label: string }[] = [
  { id: "frontal", label: "Frontal" },
  { id: "trasera", label: "Trasera" },
  { id: "lateral_izq", label: "Lateral izquierdo" },
  { id: "lateral_der", label: "Lateral derecho" },
  { id: "tablero", label: "Tablero encendido" },
];

export const INSTALL_PHOTOS: { id: InstallPhotoId; label: string }[] = [
  { id: "ubicacion", label: "Ubicación del equipo" },
  { id: "conexiones", label: "Conexiones" },
];

/** Checklist técnico de check-out (sección 4.3; lista final con el equipo técnico). */
export const CHECKLIST: { id: string; label: string; onlyWithRelay?: boolean }[] = [
  { id: "alimentacion", label: "Alimentación conectada y firme" },
  { id: "tierra", label: "Tierra conectada" },
  { id: "ignicion", label: "Ignición detectada" },
  { id: "rele", label: "Relé de corte instalado", onlyWithRelay: true },
  { id: "fijado", label: "Equipo fijado y oculto" },
  { id: "antena", label: "Antena despejada" },
  { id: "cables", label: "Cables protegidos" },
  { id: "tablero", label: "Tablero sin testigos nuevos" },
];

export const TESTS: { id: TestId; label: string; hint: string; needsTag?: boolean; needsRelay?: boolean }[] = [
  { id: "conexion", label: "GPS conectado", hint: "El equipo enciende y queda alimentado." },
  { id: "posicion", label: "Posición", hint: "Obtiene posición GNSS." },
  { id: "comunicacion", label: "Comunicación", hint: "Reporta a la plataforma por 4G." },
  { id: "estado", label: "Estado del vehículo", hint: "Detecta encendido y apagado del motor." },
  { id: "tag", label: "TAG vinculado", hint: "El GPS y el TAG quedan asociados.", needsTag: true },
  { id: "corte", label: "Corte de suministro", hint: "Solo con el vehículo detenido.", needsRelay: true },
  { id: "sirena", label: "Sirena", hint: "Suena al enviar el comando.", needsRelay: true },
];

export function planHasRelay(planId: PlanId): boolean {
  return planId !== "esencial";
}

export function accessoriesFor(planId: PlanId): string[] {
  return planHasRelay(planId)
    ? ["GPS 4G VL103M", "TAG PB705", "Relé de corte", "Sirena"]
    : ["GPS 4G VL103M"];
}

export function testsFor(planId: PlanId) {
  const relay = planHasRelay(planId);
  return TESTS.filter((t) => (!t.needsTag || relay) && (!t.needsRelay || relay));
}

export function checklistFor(planId: PlanId) {
  return CHECKLIST.filter((c) => !c.onlyWithRelay || planHasRelay(planId));
}

export function emptyRegistro(): Registro {
  return {
    step: 0,
    checkin: { patente: "", fotos: {}, danos: [], kilometraje: "", observaciones: "", at: null, geo: null },
    instalacion: { imei: "", accesorios: {}, fotos: {} },
    pruebas: {},
    verificacion: "idle",
    checkout: {
      checklist: {},
      imeiFinal: "",
      fotoFinal: null,
      receptorNombre: "",
      receptorRut: "",
      firma: null,
      conformidad: false,
      at: null,
      geo: null,
    },
  };
}
