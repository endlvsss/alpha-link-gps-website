"use client";

import { Button } from "@/components/ui/button";
import { BellIcon, CalendarIcon, CheckIcon } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/tags";
import { track } from "@/lib/analytics";
import { joinWaitlist } from "@/lib/purchase-store";

interface NoSlotsProps {
  comuna: string;
  extended: boolean;
  onExtend: () => void;
  waitlisted: boolean;
  email: string;
}

/** Sin cupo compatible: primero autoservicio (tramo 2B), después una persona. */
export function NoSlots({ comuna, extended, onExtend, waitlisted, email }: NoSlotsProps) {
  if (waitlisted) {
    return (
      <div role="status" className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <span className="flex size-11 items-center justify-center rounded-xl bg-ok-soft text-ok">
          <CheckIcon className="size-5" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
          Estás en la lista de espera de {comuna}
        </h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Cuando se libere un horario te escribiremos a{" "}
          <span className="font-medium text-ink">{email}</span> con un enlace para reservarlo. El
          enlace dura un tiempo limitado y los avisos se envían por orden de llegada.
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
          Si no aparece cupo, una persona de nuestro equipo te contactará.
          <ProvisionalTag>Plazo por definir</ProvisionalTag>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <span className="flex size-11 items-center justify-center rounded-xl bg-amber-soft text-amber">
        <CalendarIcon className="size-5" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
        No hay horarios en {comuna} en las próximas {extended ? "6" : "3"} semanas
      </h2>
      <p className="mt-2 leading-relaxed text-ink-soft">
        {extended
          ? "Nuestros técnicos aún no tienen disponibilidad en tu comuna. Te avisamos apenas se libere un horario."
          : "Puedes buscar en un rango más amplio o pedir que te avisemos cuando se libere un horario."}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {!extended && (
          <Button size="lg" onClick={onExtend}>
            Buscar hasta 6 semanas
          </Button>
        )}
        <Button
          size="lg"
          variant={extended ? "primary" : "secondary"}
          onClick={() => {
            joinWaitlist(comuna);
            track("lista_espera", { comuna });
          }}
        >
          <BellIcon className="size-4" />
          Avísame cuando haya horario
        </Button>
      </div>
    </div>
  );
}
