"use client";

import { useState, useSyncExternalStore } from "react";
import { LogoStacked } from "@/components/brand/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { eventoDesdeHash, URL_CRM } from "@/lib/eventos";
import { CRM_PREFIX, visitaDesdeCrm } from "@/lib/integracion-crm";
import { getPlan } from "@/lib/plans";
import { normalizeRut } from "@/lib/rut";
import { addClientVisit, reservedOn, usePortal } from "@/lib/instalador/store";

function subscribe(fn: () => void) {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
}

const fecha = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/**
 * Recibe una visita asignada por Operaciones en el CRM (demo: llega en el enlace).
 * En producción el portal la leerá directamente del CRM.
 */
export function ImportScreen() {
  const portal = usePortal();
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => null);
  const [agregada, setAgregada] = useState(false);
  const leido = hash === null ? null : eventoDesdeHash(hash);

  let problema: string | null = null;
  let visita = null;
  if (leido && !leido.ok) problema = leido.error;
  else if (leido?.ok && leido.evento.tipo !== "crm.visita") problema = "Este enlace no trae una visita para el técnico.";
  else if (leido?.ok && leido.evento.tipo === "crm.visita" && portal) {
    const d = leido.evento.datos;
    if (normalizeRut(d.tecnicoRut) !== normalizeRut(portal.tech.rut)) problema = "La visita está asignada a otro técnico.";
    visita = d;
  }
  const id = visita ? CRM_PREFIX + visita.folio : "";
  const yaEsta = !!portal && portal.visits.some((v) => v.id === id);
  const choque = visita && !yaEsta ? reservedOn(visita.fecha, visita.bloque).find((v) => v.id !== id) : undefined;

  return (
    <main id="contenido" className="min-h-dvh bg-bg px-5 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto w-full max-w-md">
        <LogoStacked className="h-12 w-auto text-ink" />
        <p className="mt-8 font-mono text-xs font-medium tracking-[0.14em] text-accent-ink uppercase">Desde el CRM · demo</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Nueva visita asignada</h1>

        {!leido ? (
          <p className="mt-4 text-ink-soft">{hash === null ? "Cargando…" : "Este enlace no trae ninguna visita. Se abre desde «Enviar al portal del técnico» en una instalación del CRM."}</p>
        ) : problema ? (
          <p className="mt-4 flex gap-2 rounded-2xl bg-danger-soft p-4 text-danger"><AlertIcon className="mt-0.5 size-5 shrink-0" />{problema}</p>
        ) : visita ? (
          <>
            <dl className="mt-6 space-y-3 rounded-2xl bg-surface p-5 text-sm">
              <div><dt className="text-muted">Cuándo</dt><dd className="mt-0.5 text-base font-semibold text-ink capitalize">{fecha.format(new Date(`${visita.fecha}T12:00:00Z`))} · {visita.bloque}–{visita.fin}</dd></div>
              <div><dt className="text-muted">Dónde</dt><dd className="mt-0.5 text-ink">{visita.direccion.comuna}<span className="block text-xs text-muted">La dirección exacta y el teléfono se ven desde 24 h antes.</span></dd></div>
              <div><dt className="text-muted">Vehículo</dt><dd className="mt-0.5 text-ink">{visita.vehiculo.marca} {visita.vehiculo.modelo} · <span className="font-mono">{visita.vehiculo.patente}</span></dd></div>
              <div><dt className="text-muted">Plan</dt><dd className="mt-0.5 text-ink">{getPlan(visita.plan).name}</dd></div>
              <div><dt className="text-muted">Folio</dt><dd className="mt-0.5 font-mono text-ink">{visita.folio}</dd></div>
            </dl>
            {yaEsta || agregada ? (
              <div className="mt-6 space-y-3">
                <p className="rounded-2xl bg-ok-soft p-4 text-ok">La visita está en tu agenda como «Por confirmar».</p>
                <ButtonLink href={portal?.session ? `/instalador/visita/${id}` : "/instalador/ingreso"} className="w-full">
                  {portal?.session ? "Abrir la visita" : "Ingresar al portal"}
                </ButtonLink>
              </div>
            ) : choque ? (
              <p className="mt-6 flex gap-2 rounded-2xl bg-danger-soft p-4 text-danger">
                <AlertIcon className="mt-0.5 size-5 shrink-0" />
                Ya tienes la visita {choque.folio} en ese bloque. Avisa a Operaciones para reasignar.
              </p>
            ) : (
              <Button
                className="mt-6 w-full"
                onClick={() => {
                  addClientVisit(visitaDesdeCrm(visita, new Date().toISOString()));
                  setAgregada(true);
                }}
              >
                Agregar a mi agenda
              </Button>
            )}
          </>
        ) : (
          <p className="mt-4 text-ink-soft">Cargando…</p>
        )}
        <p className="mt-8 text-xs text-muted">
          Demo interna: la visita viaja en el enlace y queda solo en este teléfono. <a href={URL_CRM} className="underline" target="_blank" rel="noreferrer">Abrir CRM</a>
        </p>
      </div>
    </main>
  );
}
