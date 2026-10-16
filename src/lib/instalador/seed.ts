// Datos ficticios del portal (CLAUDE.md: hasta tener el CRM, datos ficticios).
// Las fechas se calculan desde "hoy" para que la demo siempre tenga agenda.

import { addDays, BLOCKS } from "@/lib/agenda";
import type { IsoDate } from "@/lib/format";
import { comunasConTecnicos } from "@/lib/comunas";
import { makeImei } from "@/lib/imei";
import type { PlanId } from "@/lib/plans";
import { computeDv } from "@/lib/rut";
import {
  emptyRegistro,
  type Availability,
  type Device,
  type Technician,
  type Visit,
  type VisitStatus,
  type VisitType,
} from "./model";

const rut = (body: string) => `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${computeDv(body)}`;

export const DEMO_TECH: Technician = {
  nombre: "Diego Fuentes",
  rut: rut("15678901"),
  telefono: "9 6543 2109",
  email: "diego.fuentes@correo.cl",
  // Demo: un solo técnico cubre todas las comunas con cobertura alta o media, así la
  // agenda del cliente queda conectada al portal con cualquier dirección de prueba.
  comunas: comunasConTecnicos,
  estado: "activo",
  validadoEn: "2026-10-01",
};

export const DEMO_PASSWORD = "alpha2026";

export function seedDevices(): Device[] {
  return ["86234506011234", "86234506011235", "86234506011236", "86234506011237", "86234506011238"].map(
    (body, i) => ({
      imei: makeImei(body),
      modelo: "VL103M",
      sim: `8956 0100 ${String(4401 + i).padStart(4, "0")}`,
      estado: "en_custodia",
      visitaId: null,
    }),
  );
}

export function seedAvailability(): Availability {
  const weekday = ["09:00", "11:00", "14:00", "16:00"];
  return {
    template: { 1: weekday, 2: weekday, 3: weekday, 4: weekday, 5: weekday, 6: ["09:00", "11:00"] },
    cupoDiario: 3,
    excepciones: [],
    semanasConfirmadas: [],
  };
}

interface SeedVisit {
  id: string;
  folio: number;
  day: number;
  block: number;
  tipo: VisitType;
  estado: VisitStatus;
  planId: PlanId;
  cliente: [string, string];
  direccion: [string, string, string, string];
  vehiculo: [string, string, string, string, string];
  motivo?: string;
  notas?: string;
}

const SEEDS: SeedVisit[] = [
  {
    id: "v1", folio: 431, day: 0, block: 0, tipo: "instalacion", estado: "confirmada", planId: "seguridad",
    cliente: ["María González Riquelme", "9 8123 4567"],
    direccion: ["Av. Irarrázaval 2401", "Depto. 1203", "Ñuñoa", "Estacionamiento subterráneo, nivel -2. Avisar en conserjería."],
    vehiculo: ["KJTR42", "Toyota", "Yaris", "2021", "Gris"],
  },
  {
    id: "v2", folio: 432, day: 0, block: 1, tipo: "instalacion", estado: "agendada", planId: "esencial",
    cliente: ["Juan López Soto", "9 7765 1032"],
    direccion: ["Los Leones 1580", "Oficina 504", "Providencia", "Auto en la calle frente al edificio."],
    vehiculo: ["LKPS21", "Kia", "Rio 5", "2019", "Rojo"],
  },
  {
    id: "v3", folio: 433, day: 0, block: 2, tipo: "visita_tecnica", estado: "agendada", planId: "seguridad",
    cliente: ["Carlos Rojas Muñoz", "9 6612 8890"],
    direccion: ["Av. Macul 3420", "", "Macul", "Casa con portón negro."],
    vehiculo: ["HFDT77", "Hyundai", "Tucson", "2018", "Blanco"],
    motivo: "Ticket SD-2041: el GPS no reporta hace 3 días. Revisar o reinstalar.",
  },
  {
    id: "v4", folio: 434, day: 1, block: 3, tipo: "instalacion", estado: "agendada", planId: "flota",
    cliente: ["Ana Torres Vidal", "9 5590 2214"],
    direccion: ["Echeñique 6120", "", "La Reina", "Camioneta del negocio en el patio."],
    vehiculo: ["RTGB55", "Toyota", "Hilux", "2022", "Negro"],
    notas: "Primer vehículo de 3 del plan Flota.",
  },
  {
    id: "v5", folio: 438, day: 1, block: 0, tipo: "instalacion", estado: "agendada", planId: "seguridad",
    cliente: ["Felipe Díaz Contreras", "9 9081 3345"],
    direccion: ["Vicuña Mackenna 7110", "Casa 14", "La Florida", "Condominio, pedir acceso en garita."],
    vehiculo: ["PZLK18", "Chevrolet", "Sail", "2020", "Azul"],
  },
  {
    id: "v6", folio: 439, day: 1, block: 2, tipo: "segunda_visita", estado: "agendada", planId: "seguridad",
    cliente: ["Paula Soto Fernández", "9 7302 5561"],
    direccion: ["Av. Grecia 8455", "", "Peñalolén", ""],
    vehiculo: ["JXWR90", "Suzuki", "Swift", "2023", "Blanco"],
    motivo: "Segunda visita tras falla de señal (VIS-2026-402). Reubicar la antena.",
  },
  {
    id: "v11", folio: 442, day: 2, block: 1, tipo: "traslado", estado: "agendada", planId: "seguridad",
    cliente: ["Rodrigo Pérez Lagos", "9 8854 1209"],
    direccion: ["Pedro de Valdivia 3780", "", "Ñuñoa", ""],
    vehiculo: ["SDKP43", "Mazda", "CX-30", "2024", "Rojo"],
    motivo: "Cambio de vehículo: desinstalar del Hyundai Accent (DRHL21) y reinstalar en el Mazda CX-30.",
  },
  {
    id: "v7", folio: 421, day: -1, block: 0, tipo: "instalacion", estado: "cerrada_ok", planId: "seguridad",
    cliente: ["Valentina Muñoz Araya", "9 6120 7788"],
    direccion: ["Av. Ossa 1670", "", "La Reina", ""],
    vehiculo: ["GKRT31", "Nissan", "Kicks", "2022", "Gris"],
  },
  {
    id: "v8", folio: 423, day: -1, block: 2, tipo: "instalacion", estado: "cerrada_ok", planId: "esencial",
    cliente: ["Ignacio Herrera Núñez", "9 7743 0021"],
    direccion: ["Av. Los Presidentes 7400", "", "Peñalolén", ""],
    vehiculo: ["BBTW62", "Peugeot", "208", "2021", "Blanco"],
  },
  {
    id: "v9", folio: 402, day: -2, block: 1, tipo: "instalacion", estado: "fallida", planId: "seguridad",
    cliente: ["Paula Soto Fernández", "9 7302 5561"],
    direccion: ["Av. Grecia 8455", "", "Peñalolén", ""],
    vehiculo: ["JXWR90", "Suzuki", "Swift", "2023", "Blanco"],
  },
  {
    id: "v10", folio: 405, day: -2, block: 3, tipo: "instalacion", estado: "no_show_cliente", planId: "esencial",
    cliente: ["Tomás Vergara Ruiz", "9 5521 9034"],
    direccion: ["Av. Tobalaba 1120", "", "Providencia", ""],
    vehiculo: ["CFZM74", "Fiat", "Mobi", "2020", "Negro"],
  },
];

/** Corre `n` días hábiles (lunes a sábado): los domingos no se agenda. */
function workDay(from: IsoDate, n: number): IsoDate {
  let d = from;
  while (addDays(d, 0).weekday === 0) d = addDays(d, 1).iso;
  const step = n < 0 ? -1 : 1;
  for (let left = Math.abs(n); left > 0; ) {
    d = addDays(d, step).iso;
    if (addDays(d, 0).weekday !== 0) left--;
  }
  return d;
}

export function seedVisits(today: IsoDate): Visit[] {
  return SEEDS.map((s) => {
    const fecha = workDay(today, s.day);
    const block = BLOCKS[s.block];
    const at = `${fecha}T${block.end}:00-03:00`;
    const visit: Visit = {
      id: s.id,
      folio: `VIS-${fecha.slice(0, 4)}-${s.folio}`,
      tipo: s.tipo,
      fecha,
      block,
      estado: s.estado,
      cliente: { nombre: s.cliente[0], telefono: s.cliente[1] },
      direccion: { calle: s.direccion[0], detalle: s.direccion[1], comuna: s.direccion[2], indicaciones: s.direccion[3] },
      vehiculo: { patente: s.vehiculo[0], marca: s.vehiculo[1], modelo: s.vehiculo[2], anio: s.vehiculo[3], color: s.vehiculo[4] },
      planId: s.planId,
      motivo: s.motivo ?? null,
      notas: s.notas ?? "",
      llegadaAt: null,
      closedAt: null,
      registro: emptyRegistro(),
      falla: null,
      noShow: { fotos: [], intentos: [], at: null },
      noPuedo: null,
      events: [{ label: "INSTALACIÓN AGENDADA · técnico asignado", at: `${addDays(fecha, -3).iso}T10:00:00-03:00` }],
    };
    if (s.estado === "cerrada_ok") {
      visit.closedAt = at;
      visit.events.push({ label: "INSTALADO · VEHÍCULO ACTIVO", at });
    }
    if (s.estado === "fallida") {
      visit.closedAt = at;
      visit.falla = {
        causa: "senal",
        descripcion: "El GPS no logra comunicación estable dentro del estacionamiento subterráneo.",
        fotos: [],
        imei: "",
        at,
        ticket: "SD-2033",
      };
      visit.events.push({ label: "INCIDENCIA INSTALACIÓN · ticket SD-2033", at });
    }
    if (s.estado === "no_show_cliente") {
      visit.closedAt = at;
      visit.noShow = {
        fotos: [],
        intentos: [
          { tipo: "llamada", at, resultado: "Sin respuesta" },
          { tipo: "mensaje", at, resultado: "Enviado" },
        ],
        at,
      };
      visit.events.push({ label: "NO-SHOW CLIENTE · enlace para reprogramar enviado", at });
    }
    return visit;
  });
}
