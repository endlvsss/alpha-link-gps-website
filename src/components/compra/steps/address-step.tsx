"use client";

import { AlertIcon, MapPinIcon } from "@/components/ui/icons";
import { comunasRM, coverageTier } from "@/lib/comunas";
import { updateAddress, type Address, type Purchase } from "@/lib/purchase-store";
import { Field, Select, TextArea, TextInput } from "../fields";
import type { FieldErrors, StepProps } from "./types";

export function validateAddress(p: Purchase): FieldErrors {
  const errors: FieldErrors = {};
  const calle = p.address.calle.trim();
  if (!calle) errors.calle = "Escribe la calle y el número.";
  else if (!/\d/.test(calle)) errors.calle = "Incluye el número de la dirección.";
  if (!comunasRM.includes(p.address.comuna)) errors.comuna = "Elige tu comuna.";
  return errors;
}

export function AddressStep({ p, errors, revalidate }: StepProps) {
  const a = p.address;
  const change = (field: keyof Address, value: string) => {
    updateAddress({ [field]: value });
    if (errors[field]) revalidate(field);
  };

  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-accent-ink" />
        Es donde el técnico hará la instalación. Por ahora atendemos solo en la Región
        Metropolitana.
      </p>

      <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
        <Field id="calle" label="Calle y número" error={errors.calle}>
          {(describedBy) => (
            <TextInput
              id="calle"
              autoComplete="address-line1"
              placeholder="Av. Irarrázaval 2401"
              value={a.calle}
              invalid={!!errors.calle}
              aria-describedby={describedBy}
              onChange={(e) => change("calle", e.target.value)}
              onBlur={() => revalidate("calle")}
            />
          )}
        </Field>

        <Field id="detalle" label="Depto., casa u oficina" optional>
          {(describedBy) => (
            <TextInput
              id="detalle"
              autoComplete="address-line2"
              value={a.detalle}
              aria-describedby={describedBy}
              onChange={(e) => change("detalle", e.target.value)}
            />
          )}
        </Field>
      </div>

      <Field
        id="comuna"
        label="Comuna"
        hint="En la agenda verás los horarios de técnicos que atienden tu comuna."
        error={errors.comuna}
      >
        {(describedBy) => (
          <Select
            id="comuna"
            autoComplete="address-level2"
            value={a.comuna}
            invalid={!!errors.comuna}
            aria-describedby={describedBy}
            onChange={(e) => change("comuna", e.target.value)}
            onBlur={() => revalidate("comuna")}
          >
            <option value="" disabled>
              Elige tu comuna
            </option>
            {comunasRM.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {a.comuna && coverageTier(a.comuna) === "sin_tecnicos" && (
        <p role="status" className="flex items-start gap-2.5 rounded-xl border border-amber/40 bg-amber-soft px-4 py-3 text-sm text-ink">
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-amber" />
          <span>
            Aún no tenemos técnicos en {a.comuna}. Si sigues, tu instalación quedará en lista de espera
            hasta que se libere un horario.
          </span>
        </p>
      )}

      <Field
        id="indicaciones"
        label="Indicaciones para el técnico"
        hint="Por ejemplo: estacionamiento subterráneo, portón negro, piso -2."
        optional
      >
        {(describedBy) => (
          <TextArea
            id="indicaciones"
            rows={3}
            value={a.indicaciones}
            aria-describedby={describedBy}
            onChange={(e) => change("indicaciones", e.target.value)}
          />
        )}
      </Field>
    </div>
  );
}
