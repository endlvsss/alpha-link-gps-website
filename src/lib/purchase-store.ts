"use client";

import { useSyncExternalStore } from "react";
import { getPlan, type Billing, type PlanId } from "./plans";
import type { Block } from "./agenda";
import type { IsoDate } from "./format";

// Estado de la compra en el navegador (sessionStorage). Es una simulación:
// no hay integración con el CRM, la pasarela ni la plataforma GPS.

export interface Customer {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
}

export interface Vehicle {
  patente: string;
  marca: string;
  modelo: string;
  anio: string;
}

export interface Address {
  calle: string;
  detalle: string;
  comuna: string;
  indicaciones: string;
}

export interface Order {
  folio: string;
  total: number;
  status: "pendiente" | "pagada" | "rechazada";
  attempts: number;
  paidAt: string | null;
}

export interface Hold extends Block {
  date: IsoDate;
  expiresAt: number;
}

export interface Booking extends Block {
  date: IsoDate;
  folio: string;
  confirmedAt: string;
}

export interface Waitlist {
  joinedAt: string;
  comuna: string;
}

export interface CrmEvent {
  label: string;
  at: string;
}

export interface Purchase {
  planId: PlanId;
  billing: Billing;
  step: number;
  customer: Customer;
  vehicles: Vehicle[];
  address: Address;
  consents: { terminos: boolean; novedades: boolean };
  order: Order | null;
  accountCreatedAt: string | null;
  hold: Hold | null;
  booking: Booking | null;
  waitlist: Waitlist | null;
  events: CrmEvent[];
}

const KEY = "alg-compra-v1";

const emptyVehicle = (): Vehicle => ({ patente: "", marca: "", modelo: "", anio: "" });

function initialPurchase(): Purchase {
  return {
    planId: "seguridad",
    billing: "anual",
    step: 0,
    customer: { nombre: "", rut: "", email: "", telefono: "" },
    vehicles: [emptyVehicle()],
    address: { calle: "", detalle: "", comuna: "", indicaciones: "" },
    consents: { terminos: false, novedades: false },
    order: null,
    accountCreatedAt: null,
    hold: null,
    booking: null,
    waitlist: null,
    events: [],
  };
}

let state: Purchase | null = null;
const listeners = new Set<() => void>();

function load(): Purchase {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) return { ...initialPurchase(), ...(JSON.parse(raw) as Partial<Purchase>) };
  } catch {
    // sessionStorage bloqueado o JSON inválido: se parte de cero.
  }
  return initialPurchase();
}

function current(): Purchase {
  if (!state) state = load();
  return state;
}

function commit(next: Purchase) {
  state = next;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Sin persistencia: la compra sigue viva en memoria.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Estado actual, para validar justo después de una acción. Solo en el cliente. */
export function getPurchase(): Purchase {
  return current();
}

/** null en el servidor y durante la hidratación. */
export function usePurchase(): Purchase | null {
  return useSyncExternalStore(subscribe, current, () => null);
}

const stamp = () => new Date().toISOString();

function withEvent(p: Purchase, label: string): CrmEvent[] {
  return [...p.events, { label, at: stamp() }];
}

function fitVehicles(vehicles: Vehicle[], planId: PlanId): Vehicle[] {
  const plan = getPlan(planId);
  const n = Math.min(Math.max(vehicles.length, plan.minVehicles), plan.maxVehicles);
  const fitted = vehicles.slice(0, n);
  while (fitted.length < n) fitted.push(emptyVehicle());
  return fitted;
}

// ——— Acciones ———

export function choosePlan(planId: PlanId, billing: Billing) {
  const p = current();
  const resetOrder = p.order?.status === "pagada" ? {} : { order: null };
  commit({
    ...p,
    ...resetOrder,
    planId,
    billing,
    step: 0,
    vehicles: fitVehicles(p.vehicles, planId),
    events: withEvent(p, `INTERESADO · eligió ${getPlan(planId).name} (${billing})`),
  });
}

export function setPlan(planId: PlanId) {
  const p = current();
  commit({ ...p, planId, vehicles: fitVehicles(p.vehicles, planId) });
}

export function setBilling(billing: Billing) {
  commit({ ...current(), billing });
}

export function setVehicleCount(count: number) {
  const p = current();
  const plan = getPlan(p.planId);
  const n = Math.min(Math.max(count, plan.minVehicles), plan.maxVehicles);
  const vehicles = p.vehicles.slice(0, n);
  while (vehicles.length < n) vehicles.push(emptyVehicle());
  commit({ ...p, vehicles });
}

export function updateCustomer(patch: Partial<Customer>) {
  const p = current();
  commit({ ...p, customer: { ...p.customer, ...patch } });
}

export function updateVehicle(index: number, patch: Partial<Vehicle>) {
  const p = current();
  commit({
    ...p,
    vehicles: p.vehicles.map((v, i) => (i === index ? { ...v, ...patch } : v)),
  });
}

export function updateAddress(patch: Partial<Address>) {
  const p = current();
  commit({ ...p, address: { ...p.address, ...patch } });
}

export function setConsent(key: "terminos" | "novedades", value: boolean) {
  const p = current();
  commit({ ...p, consents: { ...p.consents, [key]: value } });
}

export function goToStep(step: number) {
  const p = current();
  const firstTime = step > 0 && !p.events.some((e) => e.label.startsWith("CHECKOUT INICIADO"));
  commit({
    ...p,
    step,
    events: firstTime ? withEvent(p, "CHECKOUT INICIADO") : p.events,
  });
}

export function startPayment(total: number) {
  const p = current();
  if (p.order && p.order.status !== "rechazada" && p.order.total === total) return;
  const year = new Date().getFullYear();
  const folio = `ORD-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
  commit({
    ...p,
    order: { folio, total, status: "pendiente", attempts: p.order?.attempts ?? 0, paidAt: null },
  });
}

export function resolvePayment(approved: boolean) {
  const p = current();
  if (!p.order) return;
  const order: Order = {
    ...p.order,
    attempts: p.order.attempts + 1,
    status: approved ? "pagada" : "rechazada",
    paidAt: approved ? stamp() : null,
  };
  if (!approved) {
    commit({ ...p, order, events: withEvent(p, "Pago rechazado · se invita a reintentar") });
    return;
  }
  const at = stamp();
  commit({
    ...p,
    order,
    accountCreatedAt: at,
    events: [...p.events, { label: "PAGADO", at }, { label: "CUENTA CREADA (sin GPS aún)", at }],
  });
}

export function holdSlot(date: IsoDate, block: Block, expiresAt: number) {
  const p = current();
  commit({ ...p, hold: { date, ...block, expiresAt } });
}

export function releaseHold() {
  commit({ ...current(), hold: null });
}

export function confirmBooking() {
  const p = current();
  if (!p.hold || Date.now() > p.hold.expiresAt) return;
  const { date, start, end } = p.hold;
  const folio = `VIS-${date.slice(0, 4)}-${String(Math.floor(Math.random() * 900) + 100)}`;
  commit({
    ...p,
    hold: null,
    waitlist: null,
    booking: { date, start, end, folio, confirmedAt: stamp() },
    events: withEvent(p, "INSTALACIÓN AGENDADA"),
  });
}

export function cancelBooking() {
  const p = current();
  commit({ ...p, booking: null, events: withEvent(p, "Reprogramación solicitada") });
}

export function joinWaitlist(comuna: string) {
  const p = current();
  commit({
    ...p,
    waitlist: { joinedAt: stamp(), comuna },
    events: withEvent(p, `Lista de espera · ${comuna}`),
  });
}

export function resetPurchase() {
  commit(initialPurchase());
}

/** Datos ficticios para revisar el flujo sin llenar el formulario. */
export function loadDemoPurchase(options: { paid: boolean }) {
  const base = initialPurchase();
  const at = stamp();
  const year = new Date().getFullYear();
  const paid = options.paid;
  commit({
    ...base,
    step: 4,
    customer: {
      nombre: "Juan López Soto",
      rut: "12.345.678-5",
      email: "juan.lopez@correo.cl",
      telefono: "9 8765 4321",
    },
    vehicles: [{ patente: "KJTR42", marca: "Toyota", modelo: "Yaris", anio: "2021" }],
    address: {
      calle: "Av. Irarrázaval 2401",
      detalle: "Depto. 1203",
      comuna: "Ñuñoa",
      indicaciones: "Estacionamiento subterráneo, nivel -2.",
    },
    consents: { terminos: true, novedades: false },
    order: paid
      ? { folio: `ORD-${year}-417`, total: 219890, status: "pagada", attempts: 1, paidAt: at }
      : null,
    accountCreatedAt: paid ? at : null,
    events: paid
      ? [
          { label: "INTERESADO · eligió Seguridad (anual)", at },
          { label: "CHECKOUT INICIADO", at },
          { label: "PAGADO", at },
          { label: "CUENTA CREADA (sin GPS aún)", at },
        ]
      : [{ label: "INTERESADO · eligió Seguridad (anual)", at }],
  });
}

export type CrmStage = "LEAD" | "PAGADO" | "INSTALACIÓN AGENDADA";

/** Estado del cliente según la taxonomía del Service Blueprint B2C v2. */
export function crmStatus(p: Purchase): { stage: CrmStage; substate: string | null } {
  if (p.booking) return { stage: "INSTALACIÓN AGENDADA", substate: null };
  if (p.order?.status === "pagada") return { stage: "PAGADO", substate: null };
  const started = p.events.some((e) => e.label.startsWith("CHECKOUT INICIADO"));
  return { stage: "LEAD", substate: started ? "CHECKOUT INICIADO" : "INTERESADO" };
}
