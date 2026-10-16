"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LogoStacked } from "@/components/brand/logo";
import { Field, TextInput } from "@/components/compra/fields";
import { Button } from "@/components/ui/button";
import { AlertIcon, LockIcon } from "@/components/ui/icons";
import { login, usePortal } from "@/lib/instalador/store";
import { DEMO_PASSWORD, DEMO_TECH } from "@/lib/instalador/seed";
import { formatRut } from "@/lib/rut";

/** I1 · Ingreso. En producción usa el login del CRM (Turnstile, bloqueo tras 5 intentos, sesión de 8 h). */
export function LoginForm() {
  const portal = usePortal();
  const router = useRouter();
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portal?.session) router.replace("/instalador");
  }, [portal, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = login(rut, password);
    setError(problem);
    if (!problem) router.replace("/instalador");
  }

  return (
    <main id="contenido" className="flex min-h-dvh flex-col justify-center bg-bg px-5 pt-[env(safe-area-inset-top,0px)] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto w-full max-w-sm">
        <LogoStacked className="h-14 w-auto text-ink" />
        <h1 className="mt-8 font-display text-3xl font-bold text-ink">Portal técnicos</h1>
        <p className="mt-2 text-ink-soft">Tu agenda, tus visitas y tu disponibilidad.</p>

        <form noValidate onSubmit={onSubmit} className="mt-8 space-y-5">
          <Field id="rut" label="RUT">
            {(d) => (
              <TextInput
                id="rut"
                autoComplete="username"
                inputMode="text"
                autoCapitalize="none"
                enterKeyHint="next"
                value={rut}
                aria-describedby={d}
                onChange={(e) => setRut(formatRut(e.target.value))}
              />
            )}
          </Field>
          <Field id="clave" label="Contraseña">
            {(d) => (
              <TextInput
                id="clave"
                type="password"
                autoComplete="current-password"
                enterKeyHint="go"
                value={password}
                aria-describedby={d}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full">
            <LockIcon className="size-4" />
            Ingresar
          </Button>
        </form>

        <div className="mt-8 rounded-2xl bg-surface p-4 text-sm text-ink-soft">
          <p className="font-medium text-ink">Demo</p>
          <p className="mt-1">
            RUT <span className="font-medium text-ink tabular-nums">{DEMO_TECH.rut}</span> · contraseña{" "}
            <span className="font-medium text-ink">{DEMO_PASSWORD}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setRut(DEMO_TECH.rut);
              setPassword(DEMO_PASSWORD);
            }}
            className="mt-3 font-medium text-accent-ink underline-offset-4 hover:underline"
          >
            Completar con los datos de demo
          </button>
        </div>
      </div>
    </main>
  );
}
