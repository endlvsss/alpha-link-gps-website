"use client";

// Traduce el estado del sitio (compra y portal del técnico) a eventos de
// integración con el CRM, y al revés. DEMO: los eventos viajan por enlace
// (ver eventos.ts); en producción serán llamadas a la API del CRM.

import type { Purchase } from "./purchase-store";
import { checklistFor, emptyRegistro, type Visit } from "./instalador/model";
import { getPortal } from "./instalador/store";
import { enlaceEvento, nuevoEvento, URL_CRM, type VisitaAsignada } from "./eventos";

/** Prefijo de las visitas que llegan desde el CRM. */
export const CRM_PREFIX = "crm-";

/** Enlace que abre el CRM con la compra lista para aplicar. */
export function enlaceCompraAlCrm(p: Purchase): string {
  const portal = getPortal();
  const reserva = p.booking
    ? {
        folio: p.booking.folio,
        fecha: p.booking.date,
        bloque: p.booking.start,
        // El bloque salió del técnico del portal solo si cubre la comuna (ver bridge.ts).
        tecnicoRut: portal.tech.comunas.includes(p.address.comuna) ? portal.tech.rut : null,
      }
    : null;
  const evento = nuevoEvento("sitio.compra", {
    cliente: { ...p.customer },
    direccion: { ...p.address },
    vehiculos: p.vehicles.filter((v) => v.patente).map((v) => ({ ...v })),
    plan: p.planId,
    periodicidad: p.billing,
    consentimientoMarketing: p.consents.novedades,
    orden: p.order ? { folio: p.order.folio, total: p.order.total, estado: p.order.status, pagadaEn: p.order.paidAt } : null,
    reserva,
    listaEspera: p.waitlist !== null,
  });
  return enlaceEvento(URL_CRM, "/integraciones/entrada", evento);
}

/** Enlace que abre el CRM con el resultado de la visita (cierre o falla). */
export function enlaceVisitaAlCrm(v: Visit): string {
  const r = v.registro;
  const items = checklistFor(v.planId);
  const fotos =
    Object.keys(r.checkin.fotos).length + r.checkin.danos.length + Object.keys(r.instalacion.fotos).length + (r.checkout.fotoFinal ? 1 : 0) + (v.falla?.fotos.length ?? 0);
  const evento = nuevoEvento("portal.visita", {
    folioPortal: v.folio,
    patente: v.vehiculo.patente,
    tecnicoRut: getPortal().tech.rut,
    resultado: v.estado === "fallida" ? "fallida" : "cerrada_ok",
    imeiGps: r.checkout.imeiFinal || r.instalacion.imei || v.falla?.imei || null,
    checklistOk: items.filter((i) => r.checkout.checklist[i.id]).length,
    checklistTotal: items.length,
    fotos,
    firma: Boolean(r.checkout.firma),
    causa: v.falla?.causa ?? null,
    descripcion: v.falla?.descripcion ?? null,
    cerradaEn: v.closedAt ?? new Date().toISOString(),
  });
  return enlaceEvento(URL_CRM, "/integraciones/entrada", evento);
}

/** Visita asignada por Operaciones en el CRM → visita del portal, «Por confirmar». */
export function visitaDesdeCrm(d: VisitaAsignada, recibidaEn: string): Visit {
  return {
    id: CRM_PREFIX + d.folio,
    folio: d.folio,
    tipo: d.tipo,
    fecha: d.fecha,
    block: { start: d.bloque, end: d.fin },
    estado: "agendada",
    cliente: { ...d.cliente },
    direccion: { ...d.direccion },
    vehiculo: { ...d.vehiculo },
    planId: d.plan,
    motivo: d.tipo === "instalacion" ? null : "Asignada por Operaciones",
    notas: d.notas,
    llegadaAt: null,
    closedAt: null,
    registro: emptyRegistro(),
    falla: null,
    noShow: { fotos: [], intentos: [], at: null },
    noPuedo: null,
    events: [{ label: "INSTALACIÓN AGENDADA · asignada por Operaciones en el CRM", at: recibidaEn }],
  };
}
