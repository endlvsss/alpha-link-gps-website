"use client";

import { Button } from "@/components/ui/button";
import { AlertIcon, CalendarIcon, ClockIcon } from "@/components/ui/icons";
import { capitalize, formatLongDate } from "@/lib/format";
import { track } from "@/lib/analytics";
import { useState } from "react";
import { sendBookingToPortal, techSlotStillFree } from "@/lib/instalador/bridge";
import { confirmBooking, getPurchase, releaseHold, type Hold } from "@/lib/purchase-store";

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Retención temporal del cupo (estado interno "reservando" de la visita). */
export function HoldPanel({ hold, now }: { hold: Hold; now: number }) {
  const [taken, setTaken] = useState(false);
  const remaining = hold.expiresAt - now;
  const expired = remaining <= 0;

  function confirm() {
    // Demo: el técnico pudo bloquear ese horario mientras el cliente decidía.
    if (!techSlotStillFree(getPurchase().address.comuna, hold.date, hold)) {
      setTaken(true);
      return;
    }
    confirmBooking();
    sendBookingToPortal(getPurchase());
    track("agenda_reservada", { fecha: hold.date, bloque: hold.start });
  }

  if (taken) {
    return (
      <div role="alert" className="rounded-2xl border border-amber/40 bg-amber-soft p-6">
        <p className="flex items-center gap-2 font-medium text-amber">
          <AlertIcon className="size-5" />
          Ese horario ya no está disponible
        </p>
        <p className="mt-2 text-ink-soft">
          El técnico de tu comuna dejó de tener libre el bloque de las {hold.start}. Elige otro horario.
        </p>
        <Button className="mt-5" onClick={() => releaseHold()}>
          Elegir horario
        </Button>
      </div>
    );
  }

  if (expired) {
    return (
      <div role="alert" className="rounded-2xl border border-amber/40 bg-amber-soft p-6">
        <p className="flex items-center gap-2 font-medium text-amber">
          <AlertIcon className="size-5" />
          Se acabó el tiempo para confirmar
        </p>
        <p className="mt-2 text-ink-soft">
          Liberamos el horario de las {hold.start} para que otra persona pueda usarlo. Elige
          nuevamente; si sigue libre, puedes tomarlo otra vez.
        </p>
        <Button className="mt-5" onClick={() => releaseHold()}>
          Elegir horario
        </Button>
      </div>
    );
  }

  const urgent = remaining < 60_000;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand bg-surface shadow-float ring-1 ring-brand">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <p className="font-medium text-ink">Horario reservado para ti</p>
        <p
          className={`flex items-center gap-1.5 font-mono text-sm ${urgent ? "text-danger" : "text-ink-soft"}`}
        >
          <ClockIcon className="size-4" />
          <span aria-hidden="true">{mmss(remaining)}</span>
          <span className="sr-only">Tiempo restante para confirmar: {mmss(remaining)}</span>
        </p>
      </div>
      <div className="flex items-start gap-4 px-6 py-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <CalendarIcon className="size-5" />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold text-ink">
            {capitalize(formatLongDate(hold.date))}
          </p>
          <p className="mt-1 font-mono text-lg text-ink-soft">
            {hold.start} – {hold.end}
          </p>
          <p className="mt-3 text-sm text-muted">
            Te asignamos un técnico disponible en tu comuna. Confirma antes de que termine el tiempo.
          </p>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-line bg-bg px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => releaseHold()}>
          Elegir otro horario
        </Button>
        <Button
          size="lg"
          onClick={confirm}
        >
          Confirmar instalación
        </Button>
      </div>
    </div>
  );
}
