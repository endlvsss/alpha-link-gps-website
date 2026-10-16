"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { CheckIcon, MinusIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { clp } from "@/lib/format";
import { plans, quote, type Billing, type Plan, type PlanId } from "@/lib/plans";
import { choosePlan } from "@/lib/purchase-store";
import { BillingToggle } from "./billing-toggle";

export function PlanCards({ defaultBilling = "anual" }: { defaultBilling?: Billing }) {
  const [billing, setBilling] = useState<Billing>(defaultBilling);
  // Celular y tablet: una tarjeta a la vez, elegida en el selector (con los precios a la vista).
  const [shown, setShown] = useState<PlanId>(plans.find((p) => p.recommended)?.id ?? plans[0].id);

  return (
    <div>
      <div className="flex justify-center">
        <BillingToggle value={billing} onChange={setBilling} />
      </div>

      <PlanPicker billing={billing} value={shown} onChange={setShown} />

      <ul className="mt-6 grid items-start gap-5 lg:mt-10 lg:grid-cols-3">
        {plans.map((plan) => (
          <li key={plan.id} id={`tarjeta-${plan.id}`} className={`h-full ${plan.id === shown ? "" : "max-lg:hidden"}`}>
            <PlanCard plan={plan} billing={billing} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Selector de plan para pantallas angostas: nombre y precio mensual de los tres. */
function PlanPicker({ billing, value, onChange }: { billing: Billing; value: PlanId; onChange: (id: PlanId) => void }) {
  return (
    <div role="group" aria-label="Ver plan" className="mt-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-surface p-1.5 lg:hidden">
      {plans.map((plan) => {
        const on = plan.id === value;
        const q = quote(plan, billing, plan.minVehicles);
        return (
          <button
            key={plan.id}
            type="button"
            aria-pressed={on}
            aria-controls={`tarjeta-${plan.id}`}
            onClick={() => onChange(plan.id)}
            className={`flex min-h-16 flex-col items-center justify-center rounded-xl px-1 py-2 transition-colors duration-150 active:scale-[0.98] ${
              on ? "bg-brand text-on-brand" : "text-ink"
            }`}
          >
            <span className="text-sm font-semibold">{plan.name}</span>
            <span className={`text-sm tabular-nums ${on ? "text-on-brand/85" : "text-ink-soft"}`}>
              {clp(q.perMonthEquivalent)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const q = quote(plan, billing, plan.minVehicles);
  const perVehicle = plan.minVehicles > 1;
  const titleId = `plan-${plan.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className={`relative flex h-full flex-col rounded-2xl bg-surface p-6 sm:p-7 ${
        plan.recommended
          ? "ring-2 ring-brand lg:-mt-3 lg:pb-10"
          : ""
      }`}
    >
      {plan.recommended && (
        <p className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-on-brand">
          Recomendado para autos
        </p>
      )}

      <h3 id={titleId} className="font-display text-2xl font-semibold text-ink">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-ink-soft">{plan.tagline}</p>

      <div className="mt-6">
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-[2.6rem] leading-none font-semibold tracking-tight text-ink">
            {clp(q.perMonthEquivalent)}
          </span>
          <span className="text-sm text-muted">/mes{perVehicle ? " por vehículo" : ""}</span>
        </p>
        <p className="mt-2 min-h-10 text-sm text-ink-soft">
          {billing === "anual" ? (
            <>
              Pagas {clp(q.periodTotal / q.vehicles)} al año{perVehicle ? " por vehículo" : ""}.{" "}
              <span className="font-medium text-amber">
                Ahorras {clp(q.annualSavings / q.vehicles)}.
              </span>
            </>
          ) : (
            <>Se cobra mes a mes{perVehicle ? ", por cada vehículo" : ""}.</>
          )}
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-bg px-4 py-3">
        <p className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-ink-soft">Equipo e instalación</span>
          <span className="font-semibold text-ink">
            {clp(plan.setup)}
            {perVehicle && <span className="font-normal text-muted"> c/u</span>}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted">{plan.setupIncludes}. Pago único.</p>
        <p className="mt-4 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium text-ink">Pagas hoy</span>
          <span className="font-display text-lg font-bold text-ink">{clp(q.dueToday)}</span>
        </p>
        <p className="text-xs text-muted">
          {billing === "anual"
            ? `Equipo e instalación + 12 meses de servicio${perVehicle ? `, ${q.vehicles} vehículos` : ""}.`
            : `Equipo e instalación + primer mes${perVehicle ? `, ${q.vehicles} vehículos` : ""}.`}
        </p>
      </div>

      <ul className="mt-6 space-y-2.5 text-base text-ink">
        {plan.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent-ink" />
            {h}
          </li>
        ))}
        {perVehicle && (
          <li className="flex items-start gap-2.5 text-ink-soft">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent-ink" />
            Desde {plan.minVehicles} vehículos
          </li>
        )}
        {plan.excludes?.map((x) => (
          <li key={x} className="flex items-start gap-2.5 text-muted">
            <MinusIcon className="mt-0.5 size-4 shrink-0" />
            {x}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Link
          href="/checkout"
          onClick={() => {
            choosePlan(plan.id, billing);
            track("elegir_plan", { plan: plan.id, periodicidad: billing, origen: "tarjetas" });
          }}
          className={buttonClasses(plan.recommended ? "primary" : "secondary", "lg", "w-full")}
        >
          Elegir {plan.name}
        </Link>
        <p className="mt-3 text-center text-xs text-muted">{plan.forWho}</p>
      </div>
    </article>
  );
}
