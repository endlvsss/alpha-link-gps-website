"use client";

// Puente de DEMO entre la agenda del cliente y el portal del técnico. En
// producción ambos leen y escriben en el CRM; aquí comparten el localStorage del
// navegador, así que solo se sincronizan en el mismo navegador (otra pestaña sirve).

import { useMemo } from "react";
import type { Block } from "@/lib/agenda";
import type { IsoDate } from "@/lib/format";
import type { Purchase } from "@/lib/purchase-store";
import { dayView } from "./availability";
import { emptyRegistro, type Visit } from "./model";
import { addClientVisit, getPortal, removeClientVisit, usePortal, type PortalState } from "./store";

export type SlotFilter = (date: IsoDate, block: Block) => boolean;

/** Prefijo de las visitas que nacen de una reserva del cliente. */
const CLIENT_PREFIX = "web-";

function filterFor(portal: PortalState, comuna: string): SlotFilter | undefined {
  if (!portal.tech.comunas.includes(comuna)) return undefined;
  const cache = new Map<IsoDate, ReturnType<typeof dayView>>();
  return (date, block) => {
    let view = cache.get(date);
    if (!view) {
      view = dayView(date, portal.availability, portal.visits);
      cache.set(date, view);
    }
    return view.slots.some((s) => s.start === block.start && s.state === "disponible");
  };
}

/**
 * Bloques que el técnico de demo ofrece en esa comuna (semana tipo, bloqueos,
 * visitas y cupo). `undefined` si la comuna no es suya: rige la disponibilidad ficticia.
 */
export function useTechSlots(comuna: string): SlotFilter | undefined {
  const portal = usePortal();
  return useMemo(() => (portal ? filterFor(portal, comuna) : undefined), [portal, comuna]);
}

/** Comprueba en el momento de confirmar: el técnico pudo bloquear mientras tanto. */
export function techSlotStillFree(comuna: string, date: IsoDate, block: Block): boolean {
  const filter = filterFor(getPortal(), comuna);
  return filter ? filter(date, block) : true;
}

/** La reserva confirmada aparece como visita «Por confirmar» en el portal. */
export function sendBookingToPortal(p: Purchase) {
  const b = p.booking;
  if (!b || !getPortal().tech.comunas.includes(p.address.comuna)) return;
  const v = p.vehicles[0];
  const visit: Visit = {
    id: CLIENT_PREFIX + b.folio,
    folio: b.folio,
    tipo: "instalacion",
    fecha: b.date,
    block: { start: b.start, end: b.end },
    estado: "agendada",
    cliente: { nombre: p.customer.nombre, telefono: p.customer.telefono },
    direccion: { ...p.address },
    vehiculo: { patente: v?.patente ?? "", marca: v?.marca ?? "", modelo: v?.modelo ?? "", anio: v?.anio ?? "", color: "" },
    planId: p.planId,
    motivo: null,
    notas: "Reservada por el cliente en la agenda online.",
    llegadaAt: null,
    closedAt: null,
    registro: emptyRegistro(),
    falla: null,
    noShow: { fotos: [], intentos: [], at: null },
    noPuedo: null,
    events: [{ label: "INSTALACIÓN AGENDADA · reservada por el cliente · técnico asignado", at: b.confirmedAt }],
  };
  addClientVisit(visit);
}

/** Reprogramar libera el bloque del técnico. */
export function releaseBookingInPortal(folio: string) {
  removeClientVisit(CLIENT_PREFIX + folio);
}
