"use client";

import { BillingToggle } from "@/components/plans/billing-toggle";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { clp } from "@/lib/format";
import { getPlan, plans, quote } from "@/lib/plans";
import { setBilling, setPlan, setVehicleCount } from "@/lib/purchase-store";
import type { StepProps } from "./types";

export function PlanStep({ p }: StepProps) {
  const selected = getPlan(p.planId);

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-sm font-medium text-ink">Plan</legend>
        <div className="mt-3 grid gap-3">
          {plans.map((plan) => {
            const checked = plan.id === p.planId;
            const q = quote(plan, p.billing, plan.minVehicles);
            return (
              <label
                key={plan.id}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border bg-surface p-4 transition-colors duration-150 sm:p-5 ${
                  checked ? "border-brand ring-1 ring-brand" : "border-line hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={checked}
                  onChange={() => setPlan(plan.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${
                    checked ? "border-brand bg-brand text-on-brand" : "border-line-strong"
                  }`}
                >
                  {checked && <CheckIcon className="size-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-display text-lg font-semibold text-ink">
                      {plan.name}
                      {plan.recommended && (
                        <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 align-middle font-sans text-xs font-semibold text-accent-ink">
                          Recomendado
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-ink-soft">
                      <span className="font-semibold text-ink">{clp(q.perMonthEquivalent)}</span>/mes
                      {plan.minVehicles > 1 ? " c/u" : ""}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{plan.forWho}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <p id="periodicidad" className="text-sm font-medium text-ink">
          Forma de pago
        </p>
        <BillingToggle value={p.billing} onChange={setBilling} className="mt-3" />
        <p className="mt-2 text-sm text-muted">
          {p.billing === "anual"
            ? "Pagas 10 mensualidades y usas 12 meses."
            : "Se cobra cada mes. Puedes cambiar a anual cuando quieras."}
        </p>
      </div>

      {selected.minVehicles > 1 && (
        <div>
          <p id="cantidad-label" className="text-sm font-medium text-ink">
            Cantidad de vehículos
          </p>
          <div className="mt-3 inline-flex items-center rounded-xl border border-line-strong bg-surface" role="group" aria-labelledby="cantidad-label">
            <button
              type="button"
              onClick={() => setVehicleCount(p.vehicles.length - 1)}
              disabled={p.vehicles.length <= selected.minVehicles}
              aria-label="Quitar un vehículo"
              className="flex size-12 items-center justify-center text-ink disabled:text-line-strong"
            >
              <MinusIcon className="size-4" />
            </button>
            <output aria-live="polite" className="w-12 text-center font-display text-lg font-semibold text-ink">
              {p.vehicles.length}
            </output>
            <button
              type="button"
              onClick={() => setVehicleCount(p.vehicles.length + 1)}
              disabled={p.vehicles.length >= selected.maxVehicles}
              aria-label="Agregar un vehículo"
              className="flex size-12 items-center justify-center text-ink disabled:text-line-strong"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            Entre {selected.minVehicles} y {selected.maxVehicles} vehículos. Para más, escríbenos.
          </p>
        </div>
      )}
    </div>
  );
}

export function validatePlan(): Record<string, string> {
  return {};
}
