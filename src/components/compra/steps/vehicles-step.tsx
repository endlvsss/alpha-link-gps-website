"use client";

import { updateVehicle, type Purchase, type Vehicle } from "@/lib/purchase-store";
import { normalizePatente, required, validatePatente, validateYear } from "@/lib/validation";
import { Field, TextInput } from "../fields";
import type { FieldErrors, StepProps } from "./types";

const brands = [
  "Chevrolet", "Toyota", "Hyundai", "Kia", "Suzuki", "Nissan", "Peugeot", "Mazda", "Ford",
  "MG", "Chery", "Mitsubishi", "Volkswagen", "Renault", "Subaru", "Great Wall", "JAC",
  "Changan", "BYD", "Honda", "Citroën", "Jeep", "RAM", "Mercedes-Benz", "BMW",
];

export function validateVehicles(p: Purchase): FieldErrors {
  const year = new Date().getFullYear();
  const errors: FieldErrors = {};
  p.vehicles.forEach((v, i) => {
    const checks = {
      [`patente-${i}`]: validatePatente(v.patente),
      [`marca-${i}`]: required("Escribe la marca.")(v.marca),
      [`modelo-${i}`]: required("Escribe el modelo.")(v.modelo),
      [`anio-${i}`]: validateYear(v.anio, year),
    };
    for (const [key, message] of Object.entries(checks)) if (message) errors[key] = message;
  });
  return errors;
}

export function VehiclesStep({ p, errors, revalidate }: StepProps) {
  const multiple = p.vehicles.length > 1;

  const change = (index: number, field: keyof Vehicle, value: string) => {
    updateVehicle(index, { [field]: value });
    const key = `${field}-${index}`;
    if (errors[key]) revalidate(key);
  };

  return (
    <div className="space-y-8">
      <datalist id="marcas">
        {brands.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>

      {p.vehicles.map((v, i) => (
        <fieldset key={i} className={multiple ? "rounded-2xl border border-line p-5" : ""}>
          <legend className={multiple ? "px-2 font-display font-semibold text-ink" : "sr-only"}>
            Vehículo {i + 1}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={`patente-${i}`}
              label="Patente"
              hint="El técnico la compara con el vehículo al llegar."
              error={errors[`patente-${i}`]}
            >
              {(describedBy) => (
                <TextInput
                  id={`patente-${i}`}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="KJTR42"
                  className="font-mono tracking-[0.12em] uppercase"
                  value={v.patente}
                  invalid={!!errors[`patente-${i}`]}
                  aria-describedby={describedBy}
                  onChange={(e) => change(i, "patente", normalizePatente(e.target.value))}
                  onBlur={() => revalidate(`patente-${i}`)}
                />
              )}
            </Field>

            <Field id={`anio-${i}`} label="Año" error={errors[`anio-${i}`]}>
              {(describedBy) => (
                <TextInput
                  id={`anio-${i}`}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  placeholder="2021"
                  value={v.anio}
                  invalid={!!errors[`anio-${i}`]}
                  aria-describedby={describedBy}
                  onChange={(e) => change(i, "anio", e.target.value.replace(/\D/g, ""))}
                  onBlur={() => revalidate(`anio-${i}`)}
                />
              )}
            </Field>

            <Field id={`marca-${i}`} label="Marca" error={errors[`marca-${i}`]}>
              {(describedBy) => (
                <TextInput
                  id={`marca-${i}`}
                  list="marcas"
                  autoComplete="off"
                  value={v.marca}
                  invalid={!!errors[`marca-${i}`]}
                  aria-describedby={describedBy}
                  onChange={(e) => change(i, "marca", e.target.value)}
                  onBlur={() => revalidate(`marca-${i}`)}
                />
              )}
            </Field>

            <Field id={`modelo-${i}`} label="Modelo" error={errors[`modelo-${i}`]}>
              {(describedBy) => (
                <TextInput
                  id={`modelo-${i}`}
                  autoComplete="off"
                  value={v.modelo}
                  invalid={!!errors[`modelo-${i}`]}
                  aria-describedby={describedBy}
                  onChange={(e) => change(i, "modelo", e.target.value)}
                  onBlur={() => revalidate(`modelo-${i}`)}
                />
              )}
            </Field>
          </div>
        </fieldset>
      ))}
    </div>
  );
}
