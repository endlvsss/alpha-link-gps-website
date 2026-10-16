"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { AlertIcon, CardIcon, LockIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { clp } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import {
  getPurchase,
  loadDemoPurchase,
  resolvePayment,
  startPayment,
  usePurchase,
} from "@/lib/purchase-store";
import { Journey } from "./journey";
import { FlowSkeleton, NoPurchase } from "./no-purchase";
import { quoteFor } from "./order-summary";

export function PaymentSimulator() {
  const p = usePurchase();
  const router = useRouter();
  const [processing, setProcessing] = useState<"aprobar" | "rechazar" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!p) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-12 sm:px-6">
        <FlowSkeleton />
      </div>
    );
  }

  if (!p.order) {
    return (
      <div className="px-4 pt-16 sm:px-6">
        <NoPurchase
          title="No hay un pago pendiente"
          body="Elige un plan y completa tus datos para llegar a esta etapa."
          onUseDemo={() => {
            loadDemoPurchase({ paid: false });
            startPayment(quoteFor(getPurchase()).q.dueToday);
          }}
        />
      </div>
    );
  }

  if (p.order.status === "pagada") {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Este pedido ya está pagado</h1>
        <ButtonLink href="/checkout/confirmacion" size="lg" className="mt-6">
          Ver confirmación
        </ButtonLink>
      </div>
    );
  }

  const order = p.order;
  const plan = getPlan(p.planId);
  const rejected = order.status === "rechazada";

  function simulate(approved: boolean) {
    setProcessing(approved ? "aprobar" : "rechazar");
    timer.current = setTimeout(() => {
      resolvePayment(approved);
      track("pago_resultado", { aprobado: approved, plan: p!.planId, valor: order.total });
      setProcessing(null);
      if (approved) router.push("/checkout/confirmacion");
    }, 900);
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 sm:px-6 lg:pt-12">
      <Journey current={1} />

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <p className="flex items-center gap-2 font-medium text-ink">
            <LockIcon className="size-4 text-muted" />
            Pasarela de pago
          </p>
          <span className="rounded-full border border-dashed border-line-strong px-2.5 py-0.5 font-mono text-xs text-muted">
            Simulación
          </span>
        </div>

        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted">Total a pagar</p>
          <p className="mt-1 font-display text-5xl font-semibold tracking-tight text-ink">
            {clp(order.total)}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {plan.name} · {p.billing === "anual" ? "Anual" : "Mensual"} · Pedido{" "}
            <span className="font-mono">{order.folio}</span>
          </p>
        </div>

        <div className="space-y-4 border-t border-line bg-bg px-6 py-6">
          <p className="flex items-start gap-3 text-sm text-ink-soft">
            <CardIcon className="mt-0.5 size-5 shrink-0 text-accent-ink" />
            En producción, aquí se abre Webpay para pagar con tarjeta de débito, crédito o prepago.
            En esta demo puedes elegir el resultado.
          </p>

          {rejected && !processing && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                <strong className="font-semibold">El pago fue rechazado.</strong> No se hizo ningún
                cargo. Revisa los datos de tu tarjeta o intenta con otra.
              </span>
            </div>
          )}

          <p aria-live="polite" className="sr-only">
            {processing ? "Procesando el pago" : ""}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" disabled={processing !== null} onClick={() => simulate(true)}>
              {processing === "aprobar" ? "Procesando…" : "Simular pago aprobado"}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={processing !== null}
              onClick={() => simulate(false)}
            >
              {processing === "rechazar" ? "Procesando…" : "Simular rechazo"}
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/checkout" className="text-muted underline-offset-4 hover:text-ink hover:underline">
          Volver a revisar mi compra
        </Link>
      </p>
    </div>
  );
}
