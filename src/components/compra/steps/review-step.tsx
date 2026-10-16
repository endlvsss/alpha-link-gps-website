"use client";

import type { ReactNode } from "react";
import { Guarantee } from "@/components/site/guarantee";
import { CardIcon, LockIcon } from "@/components/ui/icons";
import { getPlan } from "@/lib/plans";
import { goToStep, setConsent, type Purchase } from "@/lib/purchase-store";
import { formatPatente } from "@/lib/validation";
import { Checkbox } from "../fields";
import type { FieldErrors, StepProps } from "./types";

export function validateReview(p: Purchase): FieldErrors {
  return p.consents.terminos
    ? {}
    : { terminos: "Para continuar necesitamos que aceptes los términos y el aviso de privacidad." };
}

function Section({ title, step, children }: { title: string; step: number; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-muted">{title}</h2>
        <div className="mt-1 text-ink">{children}</div>
      </div>
      <button
        type="button"
        onClick={() => goToStep(step)}
        className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-accent-ink hover:bg-accent-soft"
      >
        Editar<span className="sr-only"> {title.toLowerCase()}</span>
      </button>
    </div>
  );
}

export function ReviewStep({ p, errors, revalidate }: StepProps) {
  const plan = getPlan(p.planId);
  const { customer: c, address: a } = p;

  return (
    <div className="space-y-6">
      <div className="divide-y divide-line rounded-2xl border border-line bg-surface px-5">
        <Section title="Plan" step={0}>
          {plan.name} · {p.billing === "anual" ? "Anual" : "Mensual"}
          {p.vehicles.length > 1 && ` · ${p.vehicles.length} vehículos`}
        </Section>
        <Section title="Tus datos" step={1}>
          <p>{c.nombre}</p>
          <p className="text-sm text-ink-soft">
            {c.rut} · {c.email} · +56 {c.telefono}
          </p>
        </Section>
        <Section title={p.vehicles.length > 1 ? "Vehículos" : "Vehículo"} step={2}>
          <ul className="space-y-0.5">
            {p.vehicles.map((v, i) => (
              <li key={i}>
                <span className="font-mono tracking-wider">{formatPatente(v.patente)}</span>
                <span className="text-ink-soft">
                  {" "}
                  · {v.marca} {v.modelo} {v.anio}
                </span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Instalación" step={3}>
          <p>
            {a.calle}
            {a.detalle && `, ${a.detalle}`}
          </p>
          <p className="text-sm text-ink-soft">{a.comuna}, Región Metropolitana</p>
        </Section>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <CardIcon className="size-5" />
        </span>
        <div>
          <p className="font-medium text-ink">Webpay</p>
          <p className="text-sm text-ink-soft">Tarjeta de débito, crédito o prepago.</p>
        </div>
        <LockIcon className="ml-auto size-4 text-muted" />
      </div>

      <Guarantee compact />

      <div className="space-y-4">
        <Checkbox
          id="terminos"
          checked={p.consents.terminos}
          onChange={(value) => {
            setConsent("terminos", value);
            if (errors.terminos) revalidate("terminos");
          }}
          error={errors.terminos}
        >
          Acepto los términos del servicio y el aviso de privacidad, y autorizo el uso de la
          ubicación del vehículo para prestar el servicio.{" "}
          <span className="text-muted">(Textos en revisión legal.)</span>
        </Checkbox>
        <Checkbox
          id="novedades"
          checked={p.consents.novedades}
          onChange={(value) => setConsent("novedades", value)}
        >
          Quiero recibir novedades y ofertas de Alpha Link GPS por correo.{" "}
          <span className="text-muted">Opcional.</span>
        </Checkbox>
      </div>
    </div>
  );
}
