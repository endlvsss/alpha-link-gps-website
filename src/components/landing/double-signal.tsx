import { Eyebrow } from "@/components/ui/tags";
import { DoubleSignalDemo } from "./double-signal-demo";
import { reveal } from "@/lib/reveal";

const devices = [
  {
    name: "GPS 4G",
    model: "VL103M",
    body: "Va cableado al vehículo y tiene batería interna de respaldo. Reporta la posición en vivo y ejecuta el corte de suministro y la sirena.",
  },
  {
    name: "TAG",
    model: "PB705",
    body: "Mide 42,5 mm, no lleva cables ni SIM y no depende de la red celular. Su pila dura hasta 36 meses según el fabricante.",
  },
];

export function DoubleSignal() {
  return (
    <section
      id="doble-senal"
      aria-labelledby="doble-senal-titulo"
      className="scroll-mt-20 bg-deep text-on-deep"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16 lg:py-28">
        <div>
          <Eyebrow onDeep>Nuestro diferencial</Eyebrow>
          <h2 {...reveal(1)}
            id="doble-senal-titulo"
            className="mt-4 font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance sm:text-5xl"
          >
            Dos señales. Si una se apaga, la otra avisa.
          </h2>
          <p {...reveal(2)} className="mt-6 text-lg leading-relaxed text-on-deep-muted">
            Los planes Seguridad y Flota suman al GPS un TAG: un segundo equipo, pequeño y a pilas,
            que va escondido en otro lugar del vehículo. Si el GPS y el TAG dejan de estar juntos, la
            plataforma te envía una alerta de desacoplamiento.
          </p>

          <dl {...reveal(3)} className="mt-10 grid gap-4 sm:grid-cols-2">
            {devices.map((d) => (
              <div key={d.name} className="rounded-2xl bg-white/[0.06] p-5">
                <dt className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-lg font-semibold">{d.name}</span>
                  <span className="font-mono text-xs text-on-deep-muted">{d.model}</span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-on-deep-muted">{d.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <DoubleSignalDemo />
      </div>
    </section>
  );
}
