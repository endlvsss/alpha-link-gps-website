"use client";

import { FlowSkeleton, NoPurchase } from "@/components/compra/no-purchase";
import { Journey } from "@/components/compra/journey";
import { MapPinIcon } from "@/components/ui/icons";
import { loadDemoPurchase, usePurchase } from "@/lib/purchase-store";
import { useNow } from "@/lib/use-now";
import { BookingConfirmed } from "./booking-confirmed";
import { HoldPanel } from "./hold-panel";
import { SlotPicker } from "./slot-picker";

export function Scheduler() {
  const p = usePurchase();
  const now = useNow();

  if (!p || now === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        <FlowSkeleton />
      </div>
    );
  }

  if (p.order?.status !== "pagada") {
    return (
      <div className="px-4 pt-16 sm:px-6">
        <NoPurchase
          title="Primero, completa tu compra"
          body="La agenda se habilita cuando el pago está aprobado."
          onUseDemo={() => loadDemoPurchase({ paid: true })}
        />
      </div>
    );
  }

  if (p.booking) return <BookingConfirmed p={p} booking={p.booking} />;

  const comuna = p.address.comuna || "Santiago";

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:pt-12">
      <Journey current={2} />

      <h1 className="mt-8 font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl">
        Agenda tu instalación
      </h1>
      <p className="mt-3 flex items-start gap-2 text-ink-soft">
        <MapPinIcon className="mt-1 size-4 shrink-0 text-accent-ink" />
        <span>
          {p.address.calle ? `${p.address.calle}, ` : ""}
          {comuna}. Solo verás horarios con un técnico disponible en tu comuna.
        </span>
      </p>

      <div className="mt-8">
        {p.hold ? (
          <HoldPanel hold={p.hold} now={now} />
        ) : (
          <SlotPicker comuna={comuna} now={now} waitlisted={p.waitlist?.comuna === comuna} email={p.customer.email} />
        )}
      </div>
    </div>
  );
}
