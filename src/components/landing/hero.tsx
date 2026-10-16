import panelClaro from "@/assets/plataforma/panel-claro.jpg";
import panelOscuro from "@/assets/plataforma/panel-oscuro.jpg";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, PowerIcon } from "@/components/ui/icons";
import { SeverityChip } from "@/components/ui/tags";
import { clp } from "@/lib/format";
import { plans } from "@/lib/plans";
import { reveal } from "@/lib/reveal";
import { LoopVideo } from "./loop-video";
import { PlatformFrame } from "./platform-frame";
import { TrackedButtonLink } from "./tracked-link";

const fromPrice = Math.min(...plans.map((p) => p.monthly));

export function Hero() {
  return (
    <section id="inicio" className="relative isolate flex overflow-hidden lg:min-h-[calc(100svh-4rem-1px)]">
      {/* En escritorio llena la primera pantalla (menos la barra superior): la sección siguiente empieza bajo el borde. */}
      {/* Trama de mapa muy tenue: calles en diagonal, como en el panel. */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full text-line/60 [mask-image:radial-gradient(70%_60%_at_70%_40%,black,transparent)]"
      >
        <defs>
          <pattern id="calles" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
            <path d="M0 28h56M28 0v56" stroke="currentColor" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#calles)" />
      </svg>

      <div className="mx-auto grid w-full max-w-6xl gap-14 self-center px-4 pt-8 pb-16 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-28">
        <div>
          <p
            {...reveal(0)}
            className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1 pr-3.5 pl-2.5 text-xs font-medium text-ink-soft"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-accent motion-safe:animate-pulse-ring" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Rastreo GPS y anti-robo · Región Metropolitana
          </p>

          <h1
            {...reveal(1)}
            className="mt-6 font-display text-[2.3rem] leading-[1.02] min-[400px]:text-[2.6rem] font-bold tracking-[-0.025em] text-ink sm:text-6xl lg:text-[3.15rem] xl:text-[3.6rem]"
          >
            Tu vehículo,
            <br />
            siempre a la vista.
          </h1>

          <p {...reveal(2)} className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-soft">
            Ubicación en vivo, alertas de encendido y de zona, y corte de suministro a distancia.
            Un técnico lo instala donde estés y tú eliges el horario online.
          </p>

          <div {...reveal(3)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedButtonLink href="#planes" size="lg" event="cta_ver_planes" params={{ origen: "portada" }}>
              Ver planes y precios
              <ArrowRightIcon className="size-4" />
            </TrackedButtonLink>
            <ButtonLink href="#como-funciona" variant="secondary" size="lg">
              Cómo funciona
            </ButtonLink>
          </div>

          {/* En el celular el producto se ve en la primera pantalla. */}
          <figure className="mt-8 lg:hidden">
            <LoopVideo
              name="mapa-en-vivo"
              label="Animación con datos de prueba: un vehículo da la vuelta a una manzana en Estación Central mientras el panel muestra su velocidad y sus coordenadas en vivo."
              className="aspect-[16/10] rounded-2xl border border-line shadow-float"
            />
            <figcaption className="mt-2 text-xs text-muted">Plataforma real con datos de prueba.</figcaption>
          </figure>

          <ul
            {...reveal(4)}
            className="mt-8 grid max-w-lg gap-x-6 gap-y-3 border-t border-line pt-6 text-sm text-ink-soft sm:grid-cols-[auto_auto] sm:[&>li]:whitespace-nowrap sm:justify-start lg:mt-10"
          >
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 shrink-0 text-accent-ink" />
              Desde {clp(fromPrice)} al mes <span className="text-xs text-muted">(provisorio)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 shrink-0 text-accent-ink" />
              Instalación a domicilio
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 shrink-0 text-accent-ink" />
              Doble señal GPS 4G + TAG
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 shrink-0 text-accent-ink" />
              Pago online con Webpay
            </li>
          </ul>
        </div>

        {/* El panel crece hacia la derecha, fuera del ancho del texto, para que se lea. */}
        <figure {...reveal(2)} className="relative max-lg:hidden xl:w-[calc(100%+3rem)] min-[1440px]:w-[calc(100%+6rem)] 2xl:w-[calc(100%+8rem)]">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_60%_40%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent)] blur-2xl"
          />
          <PlatformFrame
            light={panelClaro}
            dark={panelOscuro}
            alt="Panel de Alpha Link GPS con el total de vehículos, el mapa de Santiago con la flota en vivo, el estado de las baterías y la última alerta."
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 600px, 100vw"
            eager
          />

          {/* Un evento completo: la alerta y la respuesta, sobre la esquina del panel. */}
          <div className="absolute bottom-8 -left-8 w-[20.5rem] rounded-2xl border border-line bg-surface/95 p-4 shadow-float backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex size-full rounded-full bg-danger motion-safe:animate-pulse-ring" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
                </span>
                Encendido sin autorización
              </p>
              <SeverityChip level="critica" />
            </div>
            <p className="mt-1 pl-4.5 font-mono text-xs text-muted">AB·12·34 · hoy 03:12</p>
            <div className="mt-3 flex items-center gap-2.5 border-t border-line pt-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
                <PowerIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Corte de suministro</p>
                <p className="flex items-center gap-1 text-xs text-ok">
                  <CheckIcon className="size-3.5" />
                  Aplicado · vehículo detenido
                </p>
              </div>
            </div>
          </div>

          <figcaption className="mt-3 text-right text-xs text-muted">Plataforma real con datos de prueba.</figcaption>
        </figure>
      </div>
    </section>
  );
}
