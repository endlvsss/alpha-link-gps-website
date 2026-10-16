"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { InfoIcon } from "@/components/ui/icons";

/** Estado vacío cuando se entra directo a una etapa sin compra en curso. */
export function NoPurchase({
  title,
  body,
  onUseDemo,
}: {
  title: string;
  body: string;
  onUseDemo: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
      <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
        <InfoIcon className="size-5" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-ink-soft">{body}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/planes">Ver planes</ButtonLink>
        <Button variant="secondary" onClick={onUseDemo}>
          Usar datos de ejemplo
        </Button>
      </div>
    </div>
  );
}

export function FlowSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="space-y-4">
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-ink/[0.06]" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-ink/[0.05]" />
      <div className="h-64 animate-pulse rounded-2xl bg-ink/[0.04]" />
    </div>
  );
}
