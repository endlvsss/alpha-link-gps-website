import { BellIcon, ClockIcon, GeofenceIcon, LockIcon, MapPinIcon, MoonIcon, PowerIcon, SirenIcon, UsersIcon } from "@/components/ui/icons";
import { Eyebrow, SeverityChip } from "@/components/ui/tags";
import { SwipeRow } from "@/components/ui/swipe-row";
import { LoopVideo } from "./loop-video";
import { reveal } from "@/lib/reveal";

function CardTitle({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">{icon}</span>
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

const alerts = [
  { label: "Encendido sin autorización", level: "critica" as const },
  { label: "Desacoplamiento GPS / TAG", level: "alta" as const },
  { label: "Salida de zona: Casa", level: "media" as const },
  { label: "Exceso de velocidad", level: "baja" as const },
];

const commandLog = [
  { label: "Sirena", state: "Aplicado", time: "03:14" },
  { label: "Corte de suministro", state: "Aplicado", time: "03:15" },
  { label: "Corte de suministro", state: "Revertido", time: "08:02" },
];

export function Features() {
  return (
    <section id="funciones" aria-labelledby="funciones-titulo" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          <Eyebrow>Funciones</Eyebrow>
          <h2
            {...reveal(1)}
            id="funciones-titulo"
            className="mt-4 font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-ink sm:text-5xl"
          >
            Todo lo que necesitas para cuidarlo.
          </h2>
          <p {...reveal(2)} className="mt-5 text-lg leading-relaxed text-ink-soft">
            Una plataforma web en español que abres desde el celular o el computador. Las animaciones usan mapas reales de la plataforma con
            datos de prueba.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          {/* Mapa en vivo */}
          <article {...reveal(2)} className="overflow-hidden rounded-2xl bg-surface lg:col-span-4">
            <div className="p-6 sm:p-8">
              <CardTitle
                icon={<MapPinIcon className="size-4" />}
                title="Mapa en vivo"
                body="Ubicación, velocidad, estado del motor y batería del GPS, sobre mapa satelital."
              />
            </div>
            <LoopVideo
              name="mapa-en-vivo"
              label="Animación con datos de prueba: un vehículo da la vuelta a una manzana en Estación Central mientras el panel muestra su velocidad y sus coordenadas en vivo."
              className="aspect-[16/10] sm:aspect-[1440/630]"
            />
          </article>

          {/* Celular: las otras cuatro funciones se deslizan de lado; escritorio: grilla. */}
          <SwipeRow label="Más funciones">
            {/* Alertas */}
            <article {...reveal(3)} className="flex flex-col rounded-2xl bg-surface p-6 sm:p-8 lg:col-span-2">
              <CardTitle
                icon={<BellIcon className="size-4" />}
                title="Alertas por gravedad"
                body="Te llegan por correo y quedan en el centro de alertas de tu panel."
              />
              <ul className="mt-6 space-y-2">
                {alerts.map((a) => (
                  <li key={a.label} className="flex items-center justify-between gap-3 rounded-xl bg-bg px-3.5 py-2.5">
                    <span className="text-sm text-ink">{a.label}</span>
                    <SeverityChip level={a.level} />
                  </li>
                ))}
              </ul>
            </article>

            {/* Geocercas */}
            <article {...reveal(4)} className="flex flex-col overflow-hidden rounded-2xl bg-surface lg:col-span-2">
              <div className="p-6 sm:p-8">
                <CardTitle
                  icon={<GeofenceIcon className="size-4" />}
                  title="Geocercas"
                  body="Casa, trabajo o colegio: dibuja zonas y elige si te avisamos al entrar, al salir o ambas."
                />
              </div>
              <LoopVideo
                name="geocerca"
                still="geocerca-alerta"
                label="Animación con datos de prueba: un vehículo sale de la zona Casa, en Colina, y aparece una alerta de salida de zona de gravedad media."
                className="mt-auto aspect-[12/7]"
              />
            </article>

            {/* Comandos remotos */}
            <article {...reveal(5)} className="flex flex-col rounded-2xl bg-surface p-6 sm:p-8 lg:col-span-2">
              <CardTitle
                icon={<PowerIcon className="size-4" />}
                title="Corte de suministro y sirena"
                body="Actúa a distancia. Cada comando queda registrado con su estado, fecha y hora."
              />
              <div className="mt-6 grid grid-cols-2 gap-2">
                <span className="flex h-10 items-center justify-center gap-2 rounded-xl bg-danger text-sm font-semibold text-white dark:text-bg">
                  <PowerIcon className="size-4" />
                  Cortar
                </span>
                <span className="flex h-10 items-center justify-center gap-2 rounded-xl bg-bg text-sm font-semibold text-ink">
                  <SirenIcon className="size-4" />
                  Sirena
                </span>
              </div>
              <ul className="mt-4 space-y-1 rounded-xl bg-bg p-1.5 text-sm">
                {commandLog.map((c, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 px-3.5 py-2">
                    <span className="text-ink">{c.label}</span>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      <span className={c.state === "Aplicado" ? "text-ok" : "text-ink-soft"}>{c.state}</span>
                      <span className="font-mono">{c.time}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            {/* Historial */}
            <article {...reveal(6)} className="flex flex-col rounded-2xl bg-surface p-6 sm:p-8 lg:col-span-2">
              <CardTitle
                icon={<ClockIcon className="size-4" />}
                title="Historial de recorridos"
                body="Revisa por dónde anduvo en un rango de fechas, con la hora y la velocidad de cada punto."
              />
              <RouteSketch />
            </article>
          </SwipeRow>
        </div>

        <ul className="mt-8 grid gap-3 text-sm text-ink-soft sm:grid-cols-3">
          <li className="flex items-center gap-2.5">
            <LockIcon className="size-4 shrink-0 text-accent-ink" />
            Entras con tu RUT, desde el navegador
          </li>
          <li className="flex items-center gap-2.5">
            <MoonIcon className="size-4 shrink-0 text-accent-ink" />
            Panel en español, con modo oscuro
          </li>
          <li className="flex items-center gap-2.5">
            <UsersIcon className="size-4 shrink-0 text-accent-ink" />
            Conductores y varios usuarios en el plan Flota
          </li>
        </ul>
      </div>
    </section>
  );
}

/** Ruta ilustrativa: puntos con hora y velocidad, como la tabla del historial. */
function RouteSketch() {
  const points = [
    { x: 18, y: 112, time: "18:02", speed: "0 km/h" },
    { x: 92, y: 74, time: "18:09", speed: "42 km/h" },
    { x: 168, y: 92, time: "18:16", speed: "57 km/h" },
    { x: 238, y: 30, time: "18:24", speed: "0 km/h" },
  ];
  return (
    <div className="mt-6 rounded-xl bg-bg p-3">
      <svg viewBox="0 0 256 140" className="h-auto w-full" aria-hidden="true">
        <path
          d="M18 112 C 48 100, 62 70, 92 74 S 140 100, 168 92 S 214 48, 238 30"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 7"
        />
        {points.map((p, i) => (
          <g key={p.time}>
            <circle cx={p.x} cy={p.y} r={i === points.length - 1 ? 6 : 4} fill="var(--surface)" stroke="var(--brand)" strokeWidth="2.5" />
          </g>
        ))}
      </svg>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs text-muted">
        {points.map((p) => (
          <li key={p.time} className="flex justify-between">
            <span>{p.time}</span>
            <span className="text-ink-soft">{p.speed}</span>
          </li>
        ))}
      </ul>
      <p className="sr-only">Ejemplo de recorrido con cuatro puntos registrados entre las 18:02 y las 18:24.</p>
    </div>
  );
}
