import { LockIcon, ShieldIcon } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/tags";
import { site } from "@/lib/site";

/** Garantía y pago seguro: reduce el riesgo de pagar antes de la instalación. */
export function Guarantee({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const g = site.guarantee;
  return (
    <div className={`rounded-2xl bg-surface ${compact ? "p-4" : "p-5 sm:p-6"} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ok-soft text-ok">
          <ShieldIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
            {g.title}
            {g.provisional && <ProvisionalTag>Por aprobar</ProvisionalTag>}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{g.body}</p>
          {!compact && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <LockIcon className="size-4" />
              Pago seguro con Webpay. No guardamos los datos de tu tarjeta.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
