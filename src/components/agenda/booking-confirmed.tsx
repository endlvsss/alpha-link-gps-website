"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { BellIcon, CalendarIcon, CarIcon, CheckIcon, DownloadIcon, MapPinIcon } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/tags";
import { buildIcs } from "@/lib/agenda";
import { capitalize, formatLongDate } from "@/lib/format";
import { releaseBookingInPortal } from "@/lib/instalador/bridge";
import { cancelBooking, type Booking, type Purchase } from "@/lib/purchase-store";
import { formatPatente } from "@/lib/validation";
import { Journey } from "@/components/compra/journey";

export function BookingConfirmed({ p, booking }: { p: Purchase; booking: Booking }) {
  const address = [p.address.calle, p.address.detalle, p.address.comuna].filter(Boolean).join(", ");
  const longDate = capitalize(formatLongDate(booking.date));

  function downloadIcs() {
    const ics = buildIcs({
      date: booking.date,
      block: booking,
      title: "Instalación Alpha Link GPS",
      location: address,
      description: `Visita ${booking.folio}. Ten el vehículo disponible y a una persona mayor de edad para firmar el acta.`,
      uid: booking.folio,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "instalacion-alpha-link-gps.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:pt-12">
      <Journey current={3} />

      <div className="mt-10 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-soft text-ok motion-safe:animate-rise">
          <CheckIcon className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-[-0.025em] text-balance text-ink sm:text-4xl">
          Instalación agendada
        </h1>
        <p className="mt-3 text-ink-soft">Te esperamos. Esto es lo que viene.</p>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex items-start gap-4 p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
            <CalendarIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold text-ink">{longDate}</p>
            <p className="mt-0.5 font-mono text-lg text-ink-soft">
              {booking.start} – {booking.end}
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-ink-soft">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" />
              {address}
            </p>
            <p className="mt-1.5 flex items-start gap-2 text-sm text-ink-soft">
              <CarIcon className="mt-0.5 size-4 shrink-0" />
              {p.vehicles.map((v) => `${formatPatente(v.patente)} · ${v.marca} ${v.modelo}`).join(" / ")}
            </p>
            <p className="mt-3 font-mono text-xs text-muted">Visita {booking.folio}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-line bg-bg px-6 py-4 sm:flex-row">
          <Button variant="secondary" onClick={downloadIcs}>
            <DownloadIcon className="size-4" />
            Agregar a mi calendario
          </Button>
          <Button variant="ghost" onClick={() => {
              releaseBookingInPortal(booking.folio);
              cancelBooking();
            }}
          >
            Cambiar fecha u hora
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="flex items-center gap-2 font-medium text-ink">
            <BellIcon className="size-4 text-accent-ink" />
            Te avisamos
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>Recordatorios por correo 24&nbsp;h, 5&nbsp;h y 2&nbsp;h antes.</li>
            <li>Un aviso cuando el técnico vaya en camino.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="flex items-center gap-2 font-medium text-ink">
            <CheckIcon className="size-4 text-accent-ink" />
            Ten listo
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>El vehículo disponible, con sus llaves.</li>
            <li>Una persona mayor de edad, con su RUT, para firmar el acta.</li>
          </ul>
        </div>
      </div>

      <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-muted">
        Condiciones para reprogramar o cancelar
        <ProvisionalTag>Por definir</ProvisionalTag>
      </p>

      <div className="mt-8 text-center">
        <ButtonLink href="/" variant="ghost">
          Volver al inicio
        </ButtonLink>
      </div>
    </div>
  );
}
