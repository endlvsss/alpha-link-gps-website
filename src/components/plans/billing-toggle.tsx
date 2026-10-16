"use client";

import { useRef } from "react";
import { ANNUAL_FREE_MONTHS, type Billing } from "@/lib/plans";

interface BillingToggleProps {
  value: Billing;
  onChange: (value: Billing) => void;
  className?: string;
}

const options: { id: Billing; label: string; note?: string }[] = [
  { id: "mensual", label: "Mensual" },
  { id: "anual", label: "Anual", note: `${ANNUAL_FREE_MONTHS} meses gratis` },
];

/** Selector Mensual / Anual con el patrón de grupo de radio (flechas + foco rotativo). */
export function BillingToggle({ value, onChange, className = "" }: BillingToggleProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = (index + 1) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Forma de pago"
      className={`inline-flex rounded-xl border border-line bg-surface p-1 ${className}`}
    >
      {options.map((option, index) => {
        const checked = option.id === value;
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-150 ${
              checked ? "bg-brand text-on-brand" : "text-ink-soft hover:text-ink"
            }`}
          >
            {option.label}
            {option.note && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  checked ? "bg-on-brand/15 text-on-brand" : "bg-amber-soft text-amber"
                }`}
              >
                {option.note}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
