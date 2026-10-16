"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";
import { reveal } from "@/lib/reveal";

export interface Step {
  title: string;
  body: string;
  fragment: ReactNode;
}

const DESKTOP = "(min-width: 64rem)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Recorrido de compra. Escritorio: cuatro columnas, todas con su pantalla.
 * Celular y tablet: riel vertical tipo acordeón; solo el paso abierto muestra su
 * pantalla, así la sección no se alarga con cuatro pantallas apiladas.
 */
export function StepsRail({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState(0);
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);

  return (
    <ol className="mt-10 lg:mt-16 lg:grid lg:grid-cols-4 lg:gap-5">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const isOpen = desktop || open === i;
        const panelId = `paso-${i}`;
        return (
          <li
            key={step.title}
            {...reveal(i + 2)}
            className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-7 last:pb-0 lg:flex lg:flex-col lg:pb-0"
          >
            {!last && (
              <span aria-hidden="true" className="absolute top-11 bottom-1 left-[1.0625rem] w-0.5 rounded-full bg-brand/30 lg:hidden" />
            )}
            <div className="lg:mb-4 lg:flex lg:items-center lg:gap-3">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold transition-colors duration-200 ${
                  last ? "bg-ok text-white dark:text-bg" : open === i ? "bg-brand text-on-brand" : "bg-brand/25 text-ink lg:bg-brand lg:text-on-brand"
                }`}
                aria-hidden="true"
              >
                {last ? <CheckIcon className="size-4" /> : i + 1}
              </span>
              {!last && <span aria-hidden="true" className="hidden h-0.5 flex-1 rounded-full bg-brand/30 lg:block" />}
            </div>

            <div className="flex min-w-0 flex-col lg:flex-1 lg:rounded-2xl lg:bg-bg lg:p-3">
              <div
                id={panelId}
                data-ui
                className={`mt-4 max-w-sm rounded-2xl bg-bg p-4 [--piece:var(--surface)] lg:mt-0 lg:flex lg:h-44 lg:max-w-none lg:items-center lg:rounded-xl lg:bg-surface lg:[--piece:var(--bg)] ${
                  open === i ? "max-lg:motion-safe:animate-rise" : "max-lg:hidden"
                }`}
              >
                {step.fragment}
              </div>
              <div className="order-first lg:order-none lg:px-2 lg:pt-5 lg:pb-3">
                <h3 className="font-display text-xl font-bold text-ink">
                  {desktop ? (
                    <>
                      <span className="sr-only">Paso {i + 1}: </span>
                      {step.title}
                    </>
                  ) : (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(i)}
                      className="flex min-h-9 w-full items-center justify-between gap-3 text-left"
                    >
                      <span>
                        <span className="sr-only">Paso {i + 1}: </span>
                        {step.title}
                      </span>
                      <ChevronDownIcon
                        className={`size-5 shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </h3>
                <p className="mt-1 leading-relaxed text-ink-soft lg:mt-2">{step.body}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
