"use client";

import { formatRut } from "@/lib/rut";
import { updateCustomer, type Purchase } from "@/lib/purchase-store";
import { formatPhone, validateEmail, validateName, validatePhone, validateRut } from "@/lib/validation";
import { Field, TextInput } from "../fields";
import type { FieldErrors, StepProps } from "./types";

export function validateCustomer(p: Purchase): FieldErrors {
  const errors: FieldErrors = {};
  const checks = {
    nombre: validateName(p.customer.nombre),
    rut: validateRut(p.customer.rut),
    email: validateEmail(p.customer.email),
    telefono: validatePhone(p.customer.telefono),
  };
  for (const [key, message] of Object.entries(checks)) if (message) errors[key] = message;
  return errors;
}

export function CustomerStep({ p, errors, revalidate }: StepProps) {
  const c = p.customer;
  const change = (field: keyof typeof c, value: string) => {
    updateCustomer({ [field]: value });
    if (errors[field]) revalidate(field);
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="nombre" label="Nombre y apellido" error={errors.nombre} className="sm:col-span-2">
        {(describedBy) => (
          <TextInput
            id="nombre"
            autoComplete="name"
            value={c.nombre}
            invalid={!!errors.nombre}
            aria-describedby={describedBy}
            onChange={(e) => change("nombre", e.target.value)}
            onBlur={() => revalidate("nombre")}
          />
        )}
      </Field>

      <Field id="rut" label="RUT" hint="Lo usarás para entrar a tu panel." error={errors.rut}>
        {(describedBy) => (
          <TextInput
            id="rut"
            inputMode="text"
            autoComplete="off"
            placeholder="12.345.678-5"
            value={c.rut}
            invalid={!!errors.rut}
            aria-describedby={describedBy}
            onChange={(e) => change("rut", formatRut(e.target.value))}
            onBlur={() => revalidate("rut")}
          />
        )}
      </Field>

      <Field id="telefono" label="Celular" hint="Para coordinar la instalación." error={errors.telefono}>
        {(describedBy) => (
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base text-muted">
              +56
            </span>
            <TextInput
              id="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="9 1234 5678"
              className="pl-14"
              value={c.telefono}
              invalid={!!errors.telefono}
              aria-describedby={describedBy}
              onChange={(e) => change("telefono", formatPhone(e.target.value))}
              onBlur={() => revalidate("telefono")}
            />
          </div>
        )}
      </Field>

      <Field
        id="email"
        label="Correo"
        hint="Aquí te llegan la confirmación, los recordatorios y las alertas."
        error={errors.email}
        className="sm:col-span-2"
      >
        {(describedBy) => (
          <TextInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={c.email}
            invalid={!!errors.email}
            aria-describedby={describedBy}
            onChange={(e) => change("email", e.target.value)}
            onBlur={() => revalidate("email")}
          />
        )}
      </Field>
    </div>
  );
}
