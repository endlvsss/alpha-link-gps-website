"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { clp } from "@/lib/format";
import { getPurchase, goToStep, startPayment, usePurchase } from "@/lib/purchase-store";
import { Journey } from "./journey";
import { FlowSkeleton } from "./no-purchase";
import { OrderSummary, OrderSummaryCompact, quoteFor } from "./order-summary";
import { AddressStep, validateAddress } from "./steps/address-step";
import { CustomerStep, validateCustomer } from "./steps/customer-step";
import { PlanStep, validatePlan } from "./steps/plan-step";
import { ReviewStep, validateReview } from "./steps/review-step";
import type { FieldErrors } from "./steps/types";
import { VehiclesStep, validateVehicles } from "./steps/vehicles-step";

const STEPS = [
  {
    title: "Elige tu plan",
    description: "Puedes cambiarlo hasta antes de pagar.",
    Component: PlanStep,
    validate: validatePlan,
  },
  {
    title: "Tus datos",
    description: "Con ellos creamos tu cuenta y coordinamos la visita.",
    Component: CustomerStep,
    validate: validateCustomer,
  },
  {
    title: "Tu vehículo",
    description: "El técnico lo verifica antes de instalar.",
    Component: VehiclesStep,
    validate: validateVehicles,
  },
  {
    title: "Dirección de instalación",
    description: "Donde estará el vehículo el día de la visita.",
    Component: AddressStep,
    validate: validateAddress,
  },
  {
    title: "Revisa y paga",
    description: "Confirma que todo esté bien antes de ir a Webpay.",
    Component: ReviewStep,
    validate: validateReview,
  },
] as const;

export function CheckoutFlow() {
  const p = usePurchase();
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<number | null>(null);
  const step = p ? Math.min(p.step, STEPS.length - 1) : null;

  // Al cambiar de paso, el foco va al título para lectores de pantalla.
  useEffect(() => {
    if (step === null) return;
    if (previousStep.current !== null && previousStep.current !== step) {
      headingRef.current?.focus();
    }
    previousStep.current = step;
  }, [step]);

  if (!p || step === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <FlowSkeleton />
      </div>
    );
  }

  if (p.order?.status === "pagada") {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16 text-center sm:px-6">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-ok-soft text-ok">
          <CheckIcon className="size-5" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">Esta compra ya está pagada</h1>
        <p className="mt-2 text-ink-soft">Solo falta agendar la instalación.</p>
        <ButtonLink href="/agenda" size="lg" className="mt-6">
          Ir a la agenda
        </ButtonLink>
      </div>
    );
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const { q } = quoteFor(p);
  const errorCount = Object.keys(errors).length;

  function revalidate(field: string) {
    const found = current.validate(getPurchase());
    setErrors((prev) => {
      const next = { ...prev };
      if (found[field]) next[field] = found[field];
      else delete next[field];
      return next;
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = current.validate(getPurchase());
    const keys = Object.keys(found);
    if (keys.length > 0) {
      setErrors(found);
      requestAnimationFrame(() => document.getElementById(keys[0])?.focus());
      return;
    }
    setErrors({});
    if (!isLast) {
      track("checkout_paso", { paso: step! + 1, nombre: current.title });
      goToStep(step! + 1);
      return;
    }
    const total = quoteFor(getPurchase()).q.dueToday;
    track("pago_iniciado", { plan: getPurchase().planId, periodicidad: getPurchase().billing, valor: total });
    startPayment(total);
    router.push("/checkout/pago");
  }

  function back() {
    setErrors({});
    goToStep(step! - 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:pt-12">
      <Journey current={0} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <form noValidate onSubmit={onSubmit} aria-labelledby="paso-titulo" className="min-w-0">
          <div className="mb-8 lg:hidden">
            <OrderSummaryCompact p={p} />
          </div>

          <div className="flex items-center justify-between text-sm text-muted">
            <span>
              Paso {step + 1} de {STEPS.length}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out-quart"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <h1
            id="paso-titulo"
            ref={headingRef}
            tabIndex={-1}
            className="mt-7 font-display text-3xl font-bold tracking-[-0.025em] text-ink outline-none sm:text-4xl"
          >
            {current.title}
          </h1>
          <p className="mt-2 text-ink-soft">{current.description}</p>

          {errorCount > 0 && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {errorCount === 1
                ? "Revisa el campo marcado para continuar."
                : `Revisa los ${errorCount} campos marcados para continuar.`}
            </p>
          )}

          <div className="mt-8">
            <current.Component p={p} errors={errors} revalidate={revalidate} />
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={back}>
                <ArrowLeftIcon className="size-4" />
                Volver
              </Button>
            ) : (
              <ButtonLink href="/planes" variant="ghost">
                <ArrowLeftIcon className="size-4" />
                Ver planes
              </ButtonLink>
            )}
            <Button type="submit" size="lg" className="sm:min-w-56">
              {isLast ? `Pagar ${clp(q.dueToday)}` : "Continuar"}
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </form>

        <div className="hidden lg:block">
          <div className="sticky top-8">
            <OrderSummary p={p} />
          </div>
        </div>
      </div>
    </div>
  );
}
