"use client";

import { crmStatus, resetPurchase, usePurchase } from "@/lib/purchase-store";
import { enlaceCompraAlCrm } from "@/lib/integracion-crm";
import { URL_CRM } from "@/lib/eventos";

const timeFormat = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" });

/**
 * Panel interno para revisar el flujo con el equipo: muestra el estado del
 * cliente según el Service Blueprint B2C v2. No es parte de la experiencia.
 */
export function DemoPanel() {
  const purchase = usePurchase();
  if (!purchase) return null;
  const status = crmStatus(purchase);

  return (
    <details className="group mx-auto mt-16 max-w-6xl px-4 pb-10 sm:px-6">
      <summary className="inline-flex items-center gap-2 rounded-full border border-dashed border-line-strong px-3 py-1.5 font-mono text-xs text-muted">
        Demo interna · CRM: <span className="font-semibold text-ink">{status.stage}</span>
        {status.substate && <span>/ {status.substate}</span>}
      </summary>
      <div className="mt-3 rounded-2xl border border-dashed border-line-strong p-5 text-sm">
        <p className="text-muted">
          Simulación: no se cobra ni se envía nada a la pasarela ni a la plataforma GPS. «Enviar al
          CRM» abre el CRM de demo con esta compra lista para aplicar (en producción llegará sola).
        </p>
        {purchase.events.length > 0 ? (
          <ol className="mt-4 space-y-1.5 font-mono text-xs">
            {purchase.events.map((e, i) => (
              <li key={`${e.at}-${i}`} className="flex gap-3">
                <span className="text-muted">{timeFormat.format(new Date(e.at))}</span>
                <span className="text-ink">{e.label}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 font-mono text-xs text-muted">Sin eventos todavía.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {purchase.order && (
            <button
              type="button"
              onClick={() => window.open(enlaceCompraAlCrm(purchase), "_blank", "noopener")}
              className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-bg hover:opacity-90"
            >
              Enviar al CRM (demo) ↗
            </button>
          )}
          <a
            href={URL_CRM}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-ink/[0.05]"
          >
            Abrir CRM ↗
          </a>
          <button
            type="button"
            onClick={() => resetPurchase()}
            className="rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-ink/[0.05]"
          >
            Reiniciar compra
          </button>
        </div>
        {!purchase.order && (
          <p className="mt-2 text-xs text-muted">«Enviar al CRM» aparece cuando la compra llega al pago.</p>
        )}
      </div>
    </details>
  );
}
