import { CheckIcon } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/tags";
import { reveal } from "@/lib/reveal";
import { site } from "@/lib/site";

// El acta que firma el cliente al cerrar la visita (especificación del módulo de
// instaladores, check-in → instalación → pruebas → check-out). Datos de ejemplo.
const acta = [
  { label: "Patente verificada", value: "KJ·TR·42" },
  { label: "Fotos del vehículo antes de instalar", value: "5" },
  { label: "GPS 4G conectado y oculto", value: "OK" },
  { label: "TAG instalado en otro lugar", value: "OK" },
  { label: "Prueba de posición y comunicación", value: "OK" },
  { label: "Corte y sirena probados, vehículo detenido", value: "OK" },
];

const facts = [
  { term: "Dónde", detail: `En tu casa o tu trabajo, en la ${site.coverage}.` },
  { term: "Cuándo", detail: "Bloques de 2 horas, de lunes a sábado. Tú eliges el horario." },
  { term: "Qué necesitas", detail: "El vehículo disponible y una persona mayor de edad que firme el acta." },
];

export function Installation() {
  return (
    <section aria-labelledby="instalacion-titulo" className="bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:gap-14 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20 lg:py-32">
        <div>
          <h2
            id="instalacion-titulo"
            {...reveal(0)}
            className="font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-ink sm:text-5xl"
          >
            Vamos a tu casa o tu trabajo.
          </h2>
          <p {...reveal(1)} className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            Un técnico de nuestra red instala los equipos donde está tu vehículo, prueba que todo
            funcione y te deja el acta firmada.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6 sm:mt-10 sm:block sm:space-y-7">
            {facts.map((f, i) => (
              <div key={f.term} {...reveal(i + 2)}>
                <dt className="font-display text-lg font-bold text-ink sm:text-xl">{f.term}</dt>
                <dd className="mt-1 max-w-md leading-relaxed text-ink-soft sm:text-lg">{f.detail}</dd>
              </div>
            ))}
            <div {...reveal(5)}>
              <dt className="font-display text-lg font-bold text-ink sm:text-xl">Cuánto demora</dt>
              <dd className="mt-2">
                <ProvisionalTag>Por definir</ProvisionalTag>
              </dd>
            </div>
          </dl>
        </div>

        {/* El acta de instalación: lo que el cliente recibe al terminar. */}
        <figure {...reveal(2)} data-ui className="rounded-3xl bg-bg p-5 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-xl font-bold text-ink">Acta de instalación</p>
            <p className="text-sm text-muted tabular-nums">VIS-2026-417</p>
          </div>
          <p className="mt-1 text-sm text-ink-soft">Toyota Yaris 2021 · Ñuñoa</p>

          <ul className="mt-5 space-y-2 sm:mt-6 sm:space-y-3">
            {acta.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 rounded-xl bg-surface px-3.5 py-2.5 sm:px-4 sm:py-3">
                <span className="flex items-center gap-3 text-ink">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {row.label}
                </span>
                <span className="shrink-0 text-sm font-medium text-ink-soft tabular-nums">{row.value}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-end justify-between gap-6 rounded-xl bg-surface px-4 py-4">
            <div>
              <p className="text-sm text-muted">Recibe conforme</p>
              <p className="mt-0.5 font-medium text-ink">Juan López</p>
            </div>
            <svg viewBox="0 0 160 48" className="h-10 w-32 text-ink" aria-label="Firma del cliente" role="img">
              <path
                d="M4 34c10-14 18-26 26-26 7 0-4 30 4 30 9 0 10-18 18-18s2 14 10 14 12-12 20-12 4 10 12 10 16-14 28-14 18 4 32 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <figcaption className="mt-4 text-sm text-muted">Acta de ejemplo.</figcaption>
        </figure>
      </div>
    </section>
  );
}
