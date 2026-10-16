"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { CheckIcon, MinusIcon } from "@/components/ui/icons";
import { clp } from "@/lib/format";
import {
  featureMatrix,
  plans,
  quote,
  type Billing,
  type FeatureValue,
  type Plan,
  type PlanId,
} from "@/lib/plans";
import { track } from "@/lib/analytics";
import { choosePlan } from "@/lib/purchase-store";
import { BillingToggle } from "./billing-toggle";

function Value({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <>
        <CheckIcon className="mx-auto size-5 text-accent-ink" />
        <span className="sr-only">Incluido</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <MinusIcon className="mx-auto size-5 text-line-strong" />
        <span className="sr-only">No incluido</span>
      </>
    );
  }
  return <span className="text-sm font-medium text-ink">{value}</span>;
}

function PriceBlock({ plan, billing }: { plan: Plan; billing: Billing }) {
  const q = quote(plan, billing, plan.minVehicles);
  const perVehicle = plan.minVehicles > 1;
  return (
    <div>
      <p className="flex items-baseline gap-1">
        <span className="font-display text-3xl font-semibold tracking-tight text-ink">
          {clp(q.perMonthEquivalent)}
        </span>
        <span className="text-xs text-muted">/mes{perVehicle ? " c/u" : ""}</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        {billing === "anual"
          ? `${clp(q.periodTotal / q.vehicles)} al año`
          : "Mes a mes"}
        {" · "}+ {clp(plan.setup)} equipo e instalación
      </p>
      <p className="mt-1.5 text-sm text-ink">
        Pagas hoy <span className="font-semibold">{clp(q.dueToday)}</span>
      </p>
    </div>
  );
}

function ChooseLink({ plan, billing }: { plan: Plan; billing: Billing }) {
  return (
    <Link
      href="/checkout"
      onClick={() => {
        choosePlan(plan.id, billing);
        track("elegir_plan", { plan: plan.id, periodicidad: billing, origen: "comparador" });
      }}
      className={buttonClasses(plan.recommended ? "primary" : "secondary", "md", "w-full")}
    >
      Elegir {plan.name}
    </Link>
  );
}

export function Comparison() {
  const [billing, setBilling] = useState<Billing>("anual");
  const [mobilePlan, setMobilePlan] = useState<PlanId>("seguridad");
  const selected = plans.find((p) => p.id === mobilePlan) ?? plans[1];

  return (
    <div>
      <div className="flex justify-center">
        <BillingToggle value={billing} onChange={setBilling} />
      </div>

      {/* Escritorio: tabla completa */}
      <div className="mt-10 hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Comparación de funciones por plan</caption>
          <thead>
            <tr className="align-top">
              <td className="w-[34%] p-6" />
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={`p-6 font-normal ${plan.recommended ? "bg-accent-soft/50" : ""}`}
                >
                  <span className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                    {plan.name}
                    {plan.recommended && (
                      <span className="rounded-full bg-brand px-2 py-0.5 font-sans text-xs font-semibold text-on-brand">
                        Recomendado
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{plan.tagline}</span>
                  <div className="mt-4">
                    <PriceBlock plan={plan} billing={billing} />
                  </div>
                  <div className="mt-5">
                    <ChooseLink plan={plan} billing={billing} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {featureMatrix.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="border-t border-line bg-bg px-6 py-3 font-mono text-xs font-medium tracking-[0.14em] text-muted uppercase"
                >
                  {group.title}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <th scope="row" className="px-6 py-4 align-top font-normal">
                    <span className="block font-medium text-ink">{row.label}</span>
                    {row.hint && <span className="mt-0.5 block text-sm text-muted">{row.hint}</span>}
                  </th>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className={`px-6 py-4 text-center align-middle ${plan.recommended ? "bg-accent-soft/50" : ""}`}
                    >
                      <Value value={row.values[plan.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {/* Móvil: un plan a la vez */}
      <div className="mt-8 md:hidden">
        <div role="tablist" aria-label="Plan" className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              role="tab"
              id={`tab-${plan.id}`}
              aria-selected={plan.id === mobilePlan}
              aria-controls="panel-plan"
              onClick={() => setMobilePlan(plan.id)}
              className={`h-10 rounded-lg text-sm font-medium transition-colors duration-150 ${
                plan.id === mobilePlan ? "bg-brand text-on-brand" : "text-ink-soft"
              }`}
            >
              {plan.name}
            </button>
          ))}
        </div>

        <div
          id="panel-plan"
          role="tabpanel"
          aria-labelledby={`tab-${selected.id}`}
          className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card"
        >
          <p className="text-sm text-ink-soft">{selected.tagline}</p>
          <div className="mt-3">
            <PriceBlock plan={selected} billing={billing} />
          </div>
          <div className="mt-5">
            <ChooseLink plan={selected} billing={billing} />
          </div>
          {featureMatrix.map((group) => (
            <div key={group.title} className="mt-6">
              <h3 className="font-mono text-xs font-medium tracking-[0.14em] text-muted uppercase">
                {group.title}
              </h3>
              <ul className="mt-2 divide-y divide-line">
                {group.rows.map((row) => {
                  const value = row.values[selected.id];
                  return (
                    <li key={row.label} className="flex items-start justify-between gap-4 py-3">
                      <span className={value === false ? "text-muted" : "text-ink"}>{row.label}</span>
                      <span className="shrink-0">
                        <Value value={value} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
