"use client";

import { useSyncExternalStore } from "react";
import type { IsoDate } from "@/lib/format";
import type { GeoPoint } from "@/lib/image";
import { normalizeRut } from "@/lib/rut";
import {
  type Availability,
  type ContactAttempt,
  type Device,
  type FailureCause,
  type Photo,
  type Registro,
  type TestId,
  type Technician,
  type TestState,
  type Visit,
  type VisitStatus,
} from "./model";
import { isActive, todayIso } from "./rules";
import { DEMO_PASSWORD, DEMO_TECH, seedAvailability, seedDevices, seedVisits } from "./seed";

// Estado del portal guardado en el teléfono: el borrador de cada visita sobrevive
// a una recarga o a la falta de señal (sección 4.3, "borrador guardado en el
// dispositivo"). Es una simulación: no hay CRM, Service Desk ni plataforma GPS.

export interface PortalState {
  version: 1;
  seededFor: IsoDate;
  session: { rut: string; since: string } | null;
  tech: Technician;
  visits: Visit[];
  devices: Device[];
  availability: Availability;
}

const KEY = "alg-instalador-v1";

/** Las reservas del cliente (agenda online) y las asignadas desde el CRM (demo) sobreviven al cambio de día. */
const fromClient = (v: Visit) => v.id.startsWith("web-") || v.id.startsWith("crm-");

function fresh(session: PortalState["session"] = null, keep: Visit[] = []): PortalState {
  const today = todayIso(Date.now());
  return {
    version: 1,
    seededFor: today,
    session,
    tech: DEMO_TECH,
    visits: [...seedVisits(today), ...keep.filter((v) => fromClient(v) && v.fecha >= today)],
    devices: seedDevices(),
    availability: seedAvailability(),
  };
}

let state: PortalState | null = null;
const listeners = new Set<() => void>();

function load(): PortalState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PortalState;
      // Un día nuevo trae una agenda nueva de demo; la sesión se conserva.
      if (parsed.version === 1 && parsed.seededFor === todayIso(Date.now())) return { ...parsed, tech: { ...DEMO_TECH, ...parsed.tech, comunas: DEMO_TECH.comunas } };
      return fresh(parsed.session ?? null, parsed.visits ?? []);
    }
  } catch {
    // Almacenamiento bloqueado o dañado: se parte de cero.
  }
  return fresh();
}

function current(): PortalState {
  if (!state) state = load();
  return state;
}

let saveError = false;

function commit(next: PortalState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    saveError = false;
  } catch {
    // Sin espacio (fotos): el avance sigue en memoria mientras la pestaña esté abierta.
    saveError = true;
  }
  for (const l of listeners) l();
}

// Otra pestaña (la agenda del cliente o el portal) cambió el estado: se recarga.
// Se escucha siempre, no solo con pantallas suscritas: la confirmación de una
// reserva consulta el estado aunque nada lo esté mostrando.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = null;
    for (const l of listeners) l();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** null en el servidor y durante la hidratación. */
export function usePortal(): PortalState | null {
  return useSyncExternalStore(subscribe, current, () => null);
}

export function getPortal(): PortalState {
  return current();
}

export function lastSaveFailed(): boolean {
  return saveError;
}

const stamp = () => new Date().toISOString();
export const newId = () => Math.random().toString(36).slice(2, 10);

function updateVisit(id: string, fn: (v: Visit) => Visit) {
  const s = current();
  commit({ ...s, visits: s.visits.map((v) => (v.id === id ? fn(v) : v)) });
}

function withEvent(v: Visit, label: string): Visit["events"] {
  return [...v.events, { label, at: stamp() }];
}

// ——— Sesión ———

export function login(rut: string, password: string): string | null {
  if (normalizeRut(rut) !== normalizeRut(DEMO_TECH.rut) || password !== DEMO_PASSWORD) {
    return "RUT o contraseña incorrectos.";
  }
  commit({ ...current(), session: { rut: DEMO_TECH.rut, since: stamp() } });
  return null;
}

export function logout() {
  commit({ ...current(), session: null });
}

/** Vuelve la demo al inicio, incluidas las reservas hechas desde la agenda del cliente. */
export function resetDemo() {
  commit(fresh(current().session));
}

// ——— Puente con la agenda del cliente (demo, ver bridge.ts) ———

export function addClientVisit(visit: Visit) {
  const s = current();
  commit({ ...s, visits: [...s.visits.filter((v) => v.id !== visit.id), visit] });
}

export function removeClientVisit(id: string) {
  const s = current();
  commit({ ...s, visits: s.visits.filter((v) => v.id !== id) });
}

/** I9 · El técnico edita su teléfono y correo; RUT y comunas los gestiona Operaciones. */
export function updateContact(patch: Pick<Technician, "telefono" | "email">) {
  const s = current();
  commit({ ...s, tech: { ...s.tech, ...patch } });
}

// ——— Visita: antes de llegar ———

export function confirmAttendance(id: string) {
  updateVisit(id, (v) => ({ ...v, estado: "confirmada", events: withEvent(v, "Técnico confirmó asistencia") }));
}

export function startTrip(id: string) {
  updateVisit(id, (v) => ({
    ...v,
    estado: "en_camino",
    events: withEvent(v, "TÉCNICO EN CAMINO · aviso «Tu técnico va en camino» al cliente"),
  }));
}

export function arrive(id: string, geo: GeoPoint | null) {
  updateVisit(id, (v) => ({
    ...v,
    estado: "en_sitio",
    llegadaAt: v.llegadaAt ?? stamp(),
    registro: { ...v.registro, checkin: { ...v.registro.checkin, geo: v.registro.checkin.geo ?? geo } },
    events: withEvent(v, "Técnico llegó al lugar"),
  }));
}

export function cannotAttend(id: string, motivo: string) {
  updateVisit(id, (v) => ({
    ...v,
    estado: "tecnico_no_disponible",
    noPuedo: { motivo, at: stamp() },
    events: withEvent(v, "Técnico no puede asistir · reasignación automática y aviso al cliente"),
  }));
}

// ——— Registro (asistente) ———

export function updateRegistro(id: string, fn: (r: Registro) => Registro) {
  updateVisit(id, (v) => ({ ...v, registro: fn(v.registro) }));
}

export function setRegistroStep(id: string, step: number) {
  updateRegistro(id, (r) => ({ ...r, step }));
}

export function completeCheckin(id: string) {
  updateVisit(id, (v) => ({
    ...v,
    estado: "en_instalacion",
    registro: { ...v.registro, step: 1, checkin: { ...v.registro.checkin, at: stamp() } },
    events: withEvent(v, "EN INSTALACIÓN · check-in completo"),
  }));
}

export function completeInstall(id: string) {
  updateVisit(id, (v) => ({
    ...v,
    estado: "en_pruebas",
    registro: { ...v.registro, step: 2 },
    events: withEvent(v, `IMEI ${v.registro.instalacion.imei} instalado · pruebas`),
  }));
}

export function setTest(id: string, test: TestId, result: TestState) {
  updateRegistro(id, (r) => ({ ...r, pruebas: { ...r.pruebas, [test]: result } }));
}

export function setVerification(id: string, value: Registro["verificacion"]) {
  updateRegistro(id, (r) => ({ ...r, verificacion: value }));
}

export function closeVisit(id: string, geo: GeoPoint | null) {
  const s = current();
  const visit = s.visits.find((v) => v.id === id);
  if (!visit) return;
  const at = stamp();
  const support = visit.tipo === "visita_tecnica";
  commit({
    ...s,
    devices: s.devices.map((d) =>
      d.imei === visit.registro.instalacion.imei ? { ...d, estado: "instalado", visitaId: id } : d,
    ),
    visits: s.visits.map((v) =>
      v.id === id
        ? {
            ...v,
            estado: "cerrada_ok" as VisitStatus,
            closedAt: at,
            registro: { ...v.registro, step: 4, checkout: { ...v.registro.checkout, at, geo } },
            events: [
              ...v.events,
              { label: "Check-out con firma", at },
              {
                label: support
                  ? "Visita técnica cerrada · ticket RESUELTO"
                  : "INSTALADO · IMEI vinculado · VEHÍCULO ACTIVO · «ya está protegido»",
                at,
              },
            ],
          }
        : v,
    ),
  });
}

// ——— Excepciones ———

export function reportFailure(
  id: string,
  data: { causa: FailureCause; descripcion: string; fotos: Photo[]; imei: string },
) {
  const ticket = `SD-${2100 + Math.floor(Math.random() * 800)}`;
  updateVisit(id, (v) => {
    const at = stamp();
    return {
      ...v,
      estado: "fallida",
      closedAt: at,
      falla: { ...data, at, ticket },
      events: [
        ...v.events,
        { label: `INCIDENCIA INSTALACIÓN · ticket ${ticket} en el Service Desk`, at },
        { label: "Mensaje al cliente: qué pasó y qué sigue", at },
      ],
    };
  });
}

export function addNoShowPhoto(id: string, photo: Photo) {
  updateVisit(id, (v) => ({ ...v, noShow: { ...v.noShow, fotos: [...v.noShow.fotos, photo] } }));
}

export function addContactAttempt(id: string, attempt: Omit<ContactAttempt, "at">) {
  updateVisit(id, (v) => ({
    ...v,
    noShow: { ...v.noShow, intentos: [...v.noShow.intentos, { ...attempt, at: stamp() }] },
  }));
}

export function registerNoShow(id: string) {
  updateVisit(id, (v) => {
    const at = stamp();
    return {
      ...v,
      estado: "no_show_cliente",
      closedAt: at,
      noShow: { ...v.noShow, at },
      events: withEvent(v, "NO-SHOW CLIENTE con evidencia · enlace para reprogramar enviado"),
    };
  });
}

// ——— Disponibilidad (I4) ———

function setAvailability(fn: (a: Availability) => Availability) {
  const s = current();
  commit({ ...s, availability: fn(s.availability) });
}

export function toggleTemplateBlock(weekday: number, block: string) {
  setAvailability((a) => {
    const list = a.template[weekday] ?? [];
    const next = list.includes(block) ? list.filter((b) => b !== block) : [...list, block].sort();
    return { ...a, template: { ...a.template, [weekday]: next } };
  });
}

export function setCupoDiario(value: number) {
  setAvailability((a) => ({ ...a, cupoDiario: value }));
}

/** Visitas activas que ocupan una fecha (y bloque, si se indica). */
export function reservedOn(date: IsoDate, block?: string): Visit[] {
  return current().visits.filter(
    (v) => isActive(v) && v.fecha === date && (block === undefined || v.block.start === block),
  );
}

/** Bloquea un día o un bloque. Devuelve error si choca con una visita reservada. */
export function addException(date: IsoDate, block: string | null, motivo: string): string | null {
  const clash = reservedOn(date, block ?? undefined);
  if (clash.length) {
    return "Ese horario ya tiene una visita reservada. Para liberarlo usa «No puedo asistir» en la visita.";
  }
  setAvailability((a) => ({
    ...a,
    excepciones: [
      ...a.excepciones.filter((e) => !(e.date === date && (block === null || e.block === block))),
      { id: newId(), date, block, motivo },
    ],
  }));
  return null;
}

export function removeException(id: string) {
  setAvailability((a) => ({ ...a, excepciones: a.excepciones.filter((e) => e.id !== id) }));
}

export function confirmWeek(monday: IsoDate) {
  setAvailability((a) =>
    a.semanasConfirmadas.includes(monday) ? a : { ...a, semanasConfirmadas: [...a.semanasConfirmadas, monday] },
  );
}
