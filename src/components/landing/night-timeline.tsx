"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BellIcon, CheckIcon, MapPinIcon, PhoneIcon, PowerIcon, SirenIcon } from "@/components/ui/icons";
import { reveal } from "@/lib/reveal";

// Lo que el dueño ve en pantalla en cada minuto: fragmentos de la plataforma con
// datos de prueba (los mismos de la animación del mapa en vivo).
const moments: { time: string; title: string; body: string; screen: ReactNode }[] = [
  {
    time: "3:12",
    title: "La plataforma lo detecta",
    body: "Alerta crítica de encendido sin autorización, en tu panel y en tu correo.",
    screen: <AlertScreen />,
  },
  {
    time: "3:13",
    title: "Lo ves en el mapa",
    body: "Dónde está, si se está moviendo y a qué velocidad, en vivo.",
    screen: <MapScreen />,
  },
  {
    time: "3:14",
    title: "Actúas a distancia",
    body: "Activas la sirena desde el celular. Con el vehículo detenido, cortas el suministro.",
    screen: <CommandScreen />,
  },
  {
    time: "3:15",
    title: "Llamas al 133 con la ubicación",
    body: "Compartes la posición exacta con Carabineros. No intervienes tú: para eso está el mapa.",
    screen: <ShareScreen />,
  },
];

/**
 * La noche del robo, como secuencia ilustrativa. El reloj avanza con el momento que está
 * en pantalla (en el celular queda fijo arriba mientras bajas). Siempre es de
 * noche: la escena es oscura en los dos temas.
 */
export function NightTimeline() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const items = refs.current.filter((el): el is HTMLLIElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const tone = active === 0 ? "text-night-danger" : "text-night-accent";

  return (
    <section aria-labelledby="noche-titulo" className="bg-night text-on-night">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-36">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p
            aria-hidden="true"
            className={`font-display text-[10rem] leading-none font-bold tracking-[-0.04em] tabular-nums transition-colors duration-500 max-lg:hidden ${tone}`}
          >
            <Clock time={moments[active].time} />
          </p>
          <h2
            id="noche-titulo"
            {...reveal(0)}
            className="max-w-md font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.025em] text-balance sm:text-4xl lg:mt-6"
          >
            Tu auto se enciende y no eres tú.
          </h2>
          <p {...reveal(1)} className="mt-4 max-w-md text-lg leading-relaxed text-on-night-muted">
            Sin un rastreador, lo descubres en la mañana. Así podría verse esa noche con Alpha Link GPS.
          </p>
          <div {...reveal(2)} className="max-lg:hidden">
            <Notes />
          </div>
        </div>

        <div>
          {/* Celular: el reloj queda fijo bajo la barra superior y avanza con cada minuto. */}
          <div
            aria-hidden="true"
            className="sticky top-[65px] z-10 -mx-4 flex items-end justify-between gap-4 bg-night px-4 pt-3 pb-4 sm:-mx-6 sm:px-6 lg:hidden"
          >
            <p className={`font-display text-[4.5rem] leading-[0.9] font-bold tracking-[-0.04em] tabular-nums transition-colors duration-500 ${tone}`}>
              <Clock time={moments[active].time} />
            </p>
            <span className="mb-2 flex gap-1.5">
              {moments.map((m, i) => (
                <span
                  key={m.time}
                  className={`h-1.5 w-6 rounded-full transition-colors duration-500 ${
                    i <= active ? (active === 0 ? "bg-night-danger" : "bg-night-accent") : "bg-night-surface"
                  }`}
                />
              ))}
            </span>
          </div>

          <ol className="space-y-4 lg:space-y-24 lg:pt-6">
            {moments.map((m, i) => (
              <li
                key={m.time}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-index={i}
                className={`rounded-3xl bg-night-surface p-4 transition-opacity duration-500 sm:p-5 lg:bg-transparent lg:p-0 lg:opacity-85 ${
                  active === i ? "lg:opacity-100" : ""
                }`}
              >
                {m.screen}
                <div className="px-1 pt-5 pb-1 lg:px-0">
                  <h3 className="font-display text-2xl leading-tight font-bold text-on-night sm:text-3xl">
                    <span
                      className={`block text-base font-semibold tabular-nums lg:hidden ${i === 0 ? "text-night-danger" : "text-night-accent"}`}
                    >
                      <Clock time={m.time} small />
                      <span className="sr-only"> · </span>
                    </span>
                    {m.title}
                  </h3>
                  <p className="mt-2 max-w-md text-lg leading-relaxed text-on-night-muted">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-2 lg:hidden">
            <Notes />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Hora de madrugada: «AM» más chico que la hora, pero legible. */
function Clock({ time, small = false }: { time: string; small?: boolean }) {
  return (
    <>
      {time}
      <span className={small ? "ml-1 text-[0.75em] font-semibold" : "ml-[0.14em] text-[0.3em] font-semibold tracking-[0.02em]"}>AM</span>
    </>
  );
}

function Notes() {
  return (
    <div className="mt-6 max-w-md space-y-2 text-sm text-on-night-muted">
      <p className="flex items-start gap-2">
        <PowerIcon className="mt-0.5 size-4 shrink-0" />
        Por seguridad vial, el corte de suministro se usa solo con el vehículo detenido.
      </p>
      <p className="pl-6">Secuencia ilustrativa con datos de prueba. Los tiempos reales dependen de la señal y de cuándo revises la alerta.</p>
    </div>
  );
}

/* ——— Pantallas de la plataforma (datos de prueba) ——— */

function Screen({ children }: { children: ReactNode }) {
  return (
    <div data-ui className="rounded-2xl bg-night p-4 lg:bg-night-surface">
      {children}
    </div>
  );
}

function AlertScreen() {
  return (
    <Screen>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night-danger/15 text-night-danger">
          <BellIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-on-night">Encendido sin autorización</p>
            <span className="shrink-0 rounded-full bg-night-danger px-2 py-0.5 text-xs font-semibold text-night">Crítica</span>
          </div>
          <p className="mt-1 text-sm text-on-night-muted">
            <span className="tabular-nums">AB·12·34</span> · Toyota Yaris · hoy 3:12 AM
          </p>
        </div>
      </div>
    </Screen>
  );
}

function MapScreen() {
  return (
    <div data-ui className="relative overflow-hidden rounded-2xl">
      <Image
        src="/videos/mapa-en-vivo-oscuro.jpg"
        alt="Mapa satelital de Estación Central con el vehículo AB·12·34 en movimiento a 32 km/h (simulación con datos de prueba)."
        width={1440}
        height={630}
        sizes="(min-width: 1024px) 520px, 100vw"
        className="aspect-[16/10] w-full object-cover object-[45%_50%]"
      />
    </div>
  );
}

function CommandScreen() {
  const rows = [
    { icon: SirenIcon, label: "Sirena", state: "Activada" },
    { icon: PowerIcon, label: "Corte de suministro", state: "Aplicado · vehículo detenido" },
  ];
  return (
    <Screen>
      <ul className="space-y-3">
        {rows.map(({ icon: Icon, label, state }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night-accent/15 text-night-accent">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-on-night">{label}</p>
              <p className="flex items-center gap-1 text-sm text-night-accent">
                <CheckIcon className="size-3.5 shrink-0" />
                {state}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function ShareScreen() {
  return (
    <Screen>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night-accent/15 text-night-accent">
          <MapPinIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-on-night">Av. 5 de Abril, Estación Central</p>
          <p className="mt-1 text-sm text-on-night-muted tabular-nums">−33,46453 · −70,70604 · hace 10 s</p>
        </div>
      </div>
      <p className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-night-accent/15 font-medium text-night-accent">
        <PhoneIcon className="size-4" />
        133 · Carabineros
      </p>
    </Screen>
  );
}
