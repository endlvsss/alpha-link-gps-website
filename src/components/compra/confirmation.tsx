"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CalendarIcon, CheckIcon, ClockIcon } from "@/components/ui/icons";
import { clp } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { loadDemoPurchase, usePurchase } from "@/lib/purchase-store";
import { Journey } from "./journey";
import { FlowSkeleton, NoPurchase } from "./no-purchase";

const dateFormat = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function Confirmation() {
  const p = usePurchase();
  const [later, setLater] = useState(false);

  if (!p) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-6">
        <FlowSkeleton />
      </div>
    );
  }

  if (p.order?.status !== "pagada") {
    return (
      <div className="px-4 pt-16 sm:px-6">
        <NoPurchase
          title="Todavía no hay un pago aprobado"
          body="Cuando completes el pago, aquí verás la confirmación de tu compra."
          onUseDemo={() => loadDemoPurchase({ paid: true })}
        />
      </div>
    );
  }

  const plan = getPlan(p.planId);
  const order = p.order;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:pt-12">
      <Journey current={2} />

      <div className="mt-10 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-soft text-ok motion-safe:animate-rise">
          <CheckIcon className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-[-0.025em] text-balance text-ink sm:text-4xl">
          ¡Pago aprobado! Tu cuenta Alpha ya está creada.
        </h1>
        <p className="mt-3 text-ink-soft">
          Te enviamos la confirmación a <span className="font-medium text-ink">{p.customer.email}</span>.
        </p>
        <p className="mt-1 text-xs text-muted">(Simulación: no se envió ningún correo.)</p>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-soft text-amber">
            <ClockIcon className="size-4" />
          </span>
          <div>
            <p className="font-medium text-ink">Estado de tu cuenta: Instalación pendiente</p>
            <p className="mt-1 text-sm text-ink-soft">
              Verás tu vehículo en vivo en el panel cuando el técnico termine la instalación y las
              pruebas.
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-x-6 gap-y-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Pedido</dt>
            <dd className="font-mono text-ink">{order.folio}</dd>
          </div>
          <div>
            <dt className="text-muted">Plan</dt>
            <dd className="text-ink">
              {plan.name} · {p.billing === "anual" ? "Anual" : "Mensual"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Total pagado</dt>
            <dd className="text-ink">{clp(order.total)}</dd>
          </div>
          <div>
            <dt className="text-muted">Fecha</dt>
            <dd className="text-ink">{order.paidAt ? dateFormat.format(new Date(order.paidAt)) : "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 rounded-2xl bg-deep p-6 text-on-deep sm:p-8">
        <p className="font-mono text-xs tracking-[0.14em] text-on-deep-muted uppercase">
          Último paso
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Agenda la instalación</h2>
        <p className="mt-2 text-on-deep-muted">
          Elige día y bloque entre los horarios disponibles en {p.address.comuna || "tu comuna"}. Toma
          un minuto.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/agenda" variant="inverse" size="lg">
            <CalendarIcon className="size-4" />
            Elegir día y hora
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
          {!later && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setLater(true)}
              className="text-on-deep hover:bg-white/10"
            >
              Lo haré después
            </Button>
          )}
        </div>
        {later && (
          <p role="status" className="mt-4 text-sm text-on-deep-muted">
            Perfecto. Te enviaremos un enlace por correo para agendar cuando quieras.
          </p>
        )}
      </div>
    </div>
  );
}
