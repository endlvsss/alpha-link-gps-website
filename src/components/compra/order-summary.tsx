"use client";

import { ChevronDownIcon } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/tags";
import { clp } from "@/lib/format";
import { ANNUAL_MONTHS_CHARGED, getPlan, quote } from "@/lib/plans";
import type { Purchase } from "@/lib/purchase-store";

export function quoteFor(p: Purchase) {
  const plan = getPlan(p.planId);
  return { plan, q: quote(plan, p.billing, p.vehicles.length) };
}

function Lines({ p }: { p: Purchase }) {
  const { plan, q } = quoteFor(p);
  const multi = q.vehicles > 1;
  return (
    <>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">
            Equipo e instalación{multi && <span className="text-muted"> × {q.vehicles}</span>}
          </dt>
          <dd className="font-medium text-ink">{clp(q.setupTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">
            {p.billing === "anual"
              ? `Plan anual (12 meses, pagas ${ANNUAL_MONTHS_CHARGED})`
              : "Primer mes"}
            {multi && <span className="text-muted"> × {q.vehicles}</span>}
          </dt>
          <dd className="font-medium text-ink">{clp(q.periodTotal)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <span className="font-medium text-ink">Total hoy</span>
        <span className="font-display text-2xl font-semibold tracking-tight text-ink">
          {clp(q.dueToday)}
        </span>
      </div>
      {q.annualSavings > 0 && (
        <p className="mt-2 text-sm font-medium text-amber">
          Ahorras {clp(q.annualSavings)} frente a pagar mes a mes.
        </p>
      )}
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {p.billing === "anual"
          ? `Renovación: ${clp(q.periodTotal)} al año.`
          : `Luego, ${clp(plan.monthly * q.vehicles)} cada mes.`}{" "}
        Valores con IVA incluido.
      </p>
    </>
  );
}

/** Resumen lateral (escritorio). */
export function OrderSummary({ p }: { p: Purchase }) {
  const { plan, q } = quoteFor(p);
  return (
    <aside aria-label="Resumen de tu compra" className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.14em] text-muted uppercase">Tu plan</p>
          <p className="mt-1 font-display text-xl font-semibold text-ink">
            {plan.name} · {p.billing === "anual" ? "Anual" : "Mensual"}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {q.vehicles} {q.vehicles === 1 ? "vehículo" : "vehículos"}
          </p>
        </div>
        <ProvisionalTag />
      </div>
      <div className="mt-5 border-t border-line pt-5">
        <Lines p={p} />
      </div>
    </aside>
  );
}

/** Resumen plegable (móvil). */
export function OrderSummaryCompact({ p }: { p: Purchase }) {
  const { plan, q } = quoteFor(p);
  return (
    <details className="group rounded-2xl border border-line bg-surface">
      <summary className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm">
          <span className="font-medium text-ink">{plan.name}</span>
          <span className="text-muted"> · {p.billing === "anual" ? "Anual" : "Mensual"}</span>
        </span>
        <span className="flex items-center gap-2 font-display font-semibold text-ink">
          {clp(q.dueToday)}
          <ChevronDownIcon className="size-4 text-muted transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-line px-4 py-4">
        <Lines p={p} />
        <div className="mt-3">
          <ProvisionalTag>Precios provisorios</ProvisionalTag>
        </div>
      </div>
    </details>
  );
}
