import { ArrowRightIcon, CheckIcon, ClockIcon, LockIcon } from "@/components/ui/icons";
import { clp } from "@/lib/format";
import { getPlan, quote } from "@/lib/plans";
import { reveal } from "@/lib/reveal";
import { StepsRail, type Step } from "./steps-rail";

const seguridad = getPlan("seguridad");
const anual = quote(seguridad, "anual", 1);

// Fragmentos reales del flujo de compra, a escala. Sus piezas usan --piece, el
// tono que contrasta con la "pantalla" del paso (cambia entre celular y escritorio).

function PlanFragment() {
  return (
    <div className="w-full space-y-3">
      <div className="inline-flex rounded-lg bg-(--piece) p-1 text-sm font-medium">
        <span className="px-3 py-1.5 text-muted">Mensual</span>
        <span className="rounded-md bg-brand px-3 py-1.5 text-on-brand">Anual</span>
      </div>
      <p className="font-display text-2xl font-bold text-ink">
        {clp(anual.perMonthEquivalent)}
        <span className="ml-1 text-sm font-normal text-muted">/mes</span>
      </p>
      <p className="text-sm text-ink-soft">Plan Seguridad · 2 meses gratis</p>
    </div>
  );
}

function PayFragment() {
  return (
    <div className="w-full space-y-3">
      <p className="flex items-baseline justify-between text-sm">
        <span className="text-ink-soft">Total hoy</span>
        <span className="font-display text-lg font-bold text-ink">{clp(anual.dueToday)}</span>
      </p>
      <span className="flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-base font-medium text-on-brand">
        Pagar con Webpay
      </span>
      <p className="flex items-center gap-1.5 text-sm text-muted">
        <LockIcon className="size-4" />
        Débito, crédito o prepago
      </p>
    </div>
  );
}

function AgendaFragment() {
  const days = [
    { d: "Sáb", n: 17, on: false },
    { d: "Lun", n: 19, on: true },
    { d: "Mar", n: 20, on: false },
  ];
  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {days.map((day) => (
          <span
            key={day.n}
            className={`flex flex-col items-center rounded-lg py-1.5 ${
              day.on ? "bg-brand text-on-brand" : "bg-(--piece) text-ink-soft"
            }`}
          >
            <span className="text-xs">{day.d}</span>
            <span className="font-display text-lg font-bold">{day.n}</span>
          </span>
        ))}
      </div>
      <p className="flex items-center gap-1.5 rounded-lg bg-(--piece) px-3 py-2 text-sm text-ink tabular-nums">
        <ClockIcon className="size-4 text-accent-ink" />
        11:00 – 13:00
      </p>
    </div>
  );
}

function ActiveFragment() {
  return (
    <div className="w-full space-y-3">
      <p className="flex items-center justify-between gap-3 rounded-xl bg-(--piece) px-4 py-3">
        <span className="font-medium text-ink tabular-nums">AB·12·34</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-ok">
          <span className="size-2 rounded-full bg-ok" />
          Activo
        </span>
      </p>
      <p className="flex items-center gap-1.5 text-sm text-ink-soft">
        <CheckIcon className="size-4 text-ok" />
        Pruebas OK
      </p>
      <p className="flex items-center gap-1.5 text-sm text-ink-soft">
        <CheckIcon className="size-4 text-ok" />
        Acta firmada
      </p>
    </div>
  );
}

const steps: Step[] = [
  {
    title: "Elige tu plan",
    body: "Mensual, o anual con 2 meses gratis. Ves cuánto pagas hoy antes de contratar.",
    fragment: <PlanFragment />,
  },
  {
    title: "Paga online",
    body: "Con Webpay, en pocos minutos. Tu cuenta Alpha se crea en ese momento.",
    fragment: <PayFragment />,
  },
  {
    title: "Agenda la instalación",
    body: "Eliges día y bloque entre horarios reales de técnicos de tu comuna.",
    fragment: <AgendaFragment />,
  },
  {
    title: "Instalamos y activamos",
    body: "El técnico instala, prueba todo y firman el acta. Tu vehículo aparece en vivo.",
    fragment: <ActiveFragment />,
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-titulo" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <h2
            id="como-titulo"
            {...reveal(0)}
            className="font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-ink sm:text-5xl"
          >
            Todo online, hasta tu puerta.
          </h2>
          <p {...reveal(1)} className="max-w-md text-lg leading-relaxed text-ink-soft">
            Cuatro pasos y sin llamadas: contratas, pagas y agendas desde el celular en unos
            minutos.
          </p>
        </div>

        <StepsRail steps={steps} />

        {/* Cuenta creada ≠ vehículo activo (Service Blueprint B2C v2). */}
        <div
          {...reveal(6)}
          className="mt-10 grid gap-4 rounded-2xl bg-bg p-5 sm:p-8 lg:mt-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10"
        >
          <div className="flex flex-col items-start gap-1.5 text-sm font-medium sm:flex-row sm:items-center sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-2.5 py-1.5 whitespace-nowrap text-amber sm:px-3">
              <ClockIcon className="size-4" />
              Instalación pendiente
            </span>
            <ArrowRightIcon className="ml-4 size-4 shrink-0 rotate-90 text-muted sm:ml-0 sm:rotate-0" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-2.5 py-1.5 whitespace-nowrap text-ok sm:px-3">
              <span className="size-2 rounded-full bg-ok" />
              Vehículo activo
            </span>
          </div>
          <p className="leading-relaxed text-ink-soft sm:text-lg">
            Tu cuenta se crea al pagar, pero el vehículo queda activo cuando el técnico termina las
            pruebas. Hasta entonces tu panel muestra «Instalación pendiente», nunca datos de ejemplo.
          </p>
        </div>
      </div>
    </section>
  );
}
