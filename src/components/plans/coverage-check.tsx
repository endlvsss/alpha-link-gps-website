"use client";

import { Select } from "@/components/compra/fields";
import { CalendarIcon, ChatIcon, CheckIcon, MapPinIcon } from "@/components/ui/icons";
import { buildSchedule, EXTENDED_HORIZON_DAYS } from "@/lib/agenda";
import { track } from "@/lib/analytics";
import { comunasRM, coverageTier } from "@/lib/comunas";
import { capitalize, formatLongDate } from "@/lib/format";
import { useTechSlots } from "@/lib/instalador/bridge";
import { updateAddress, usePurchase } from "@/lib/purchase-store";
import { site } from "@/lib/site";
import { useNow } from "@/lib/use-now";

/** "¿Instalamos en tu comuna?" antes de elegir plan: evita pagar sin cobertura. */
export function CoverageCheck() {
  const now = useNow();
  // La comuna vive en la compra: queda precargada en el checkout.
  const comuna = usePurchase()?.address.comuna ?? "";
  const techSlots = useTechSlots(comuna);

  function choose(value: string) {
    updateAddress({ comuna: value });
    track("comuna_consultada", { comuna: value, cobertura: coverageTier(value) });
  }

  const first =
    comuna && now
      ? buildSchedule(comuna, now, EXTENDED_HORIZON_DAYS, techSlots).find((d) => d.blocks.length > 0)
      : undefined;

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-surface p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr] sm:items-end">
        <div>
          <label htmlFor="comuna-cobertura" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <MapPinIcon className="size-5 text-accent-ink" />
            ¿Instalamos en tu comuna?
          </label>
          <p className="mt-1 text-sm text-ink-soft">Revísalo antes de elegir tu plan.</p>
        </div>
        <Select
          id="comuna-cobertura"
          value={comuna}
          onChange={(e) => choose(e.target.value)}
          aria-describedby="cobertura-resultado"
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
      </div>

      <div id="cobertura-resultado" aria-live="polite" className="empty:hidden">
        {comuna && now > 0 && (
          <div className="mt-5 rounded-xl bg-bg p-4">
            {first ? (
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok">
                  <CheckIcon className="size-4" />
                </span>
                <div>
                  <p className="font-medium text-ink">Sí, instalamos en {comuna}.</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-soft">
                    <CalendarIcon className="size-4" />
                    Primer horario disponible: {capitalize(formatLongDate(first.date))}, {first.blocks[0].start}{" "}
                    <span className="text-xs text-muted">(agenda de ejemplo)</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber">
                  <MapPinIcon className="size-4" />
                </span>
                <div>
                  <p className="font-medium text-ink">Aún no tenemos técnicos en {comuna}.</p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    Te recomendamos esperar antes de comprar.{" "}
                    <a
                      href={site.whatsapp.href}
                      onClick={() => track("whatsapp_click", { origen: "cobertura", comuna })}
                      className="inline-flex items-center gap-1 font-medium text-accent-ink underline-offset-4 hover:underline"
                    >
                      <ChatIcon className="size-4" />
                      Escríbenos y te avisamos cuando lleguemos
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
