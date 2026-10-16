import { CheckIcon } from "@/components/ui/icons";

const stages = ["Plan y datos", "Pago", "Agenda"] as const;

/** Etapa actual: 0 = plan y datos, 1 = pago, 2 = agenda, 3 = todo completo. */
export function Journey({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <nav aria-label="Etapas de la compra">
      <ol className="flex items-center gap-2 text-sm">
        {stages.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={`inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 ${
                  active ? "bg-surface text-ink shadow-card" : done ? "text-ink-soft" : "text-muted"
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-ok text-white dark:text-bg"
                      : active
                        ? "bg-brand text-on-brand"
                        : "border border-line-strong"
                  }`}
                >
                  {done ? <CheckIcon className="size-3.5" /> : i + 1}
                </span>
                <span className={active ? "" : "sr-only sm:not-sr-only"}>{label}</span>
                {done && <span className="sr-only">(completado)</span>}
              </span>
              {i < stages.length - 1 && <span className="h-px w-4 bg-line-strong sm:w-8" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
