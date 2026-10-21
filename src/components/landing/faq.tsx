import { ChatIcon, ChevronDownIcon } from "@/components/ui/icons";
import { clp } from "@/lib/format";
import { ANNUAL_FREE_MONTHS, plans } from "@/lib/plans";
import { reveal } from "@/lib/reveal";
import { site } from "@/lib/site";

const fromMonthly = Math.min(...plans.map((p) => p.monthly));
const fromSetup = Math.min(...plans.map((p) => p.setup));

const faqs = [
  {
    q: "¿Cuánto cuesta en total?",
    a: `Pagas una sola vez el equipo con la instalación (desde ${clp(fromSetup)}) y después una mensualidad desde ${clp(fromMonthly)}, o el año completo con ${ANNUAL_FREE_MONTHS} meses gratis. En cada plan verás cuánto pagas hoy antes de contratar. Precios provisorios, con IVA.`,
  },
  {
    q: "¿Cada cuánto se actualiza la ubicación?",
    a: `Con la configuración de fábrica, el GPS envía su posición cada ${site.device.reportSeconds} segundos, con el motor encendido o apagado. En tu panel siempre ves la hora de la última posición, así sabes de cuándo es el dato.`,
  },
  {
    q: "¿Cómo me llegan las alertas?",
    a: "Por correo electrónico y en el centro de alertas de tu panel. Tú eliges qué tipos de alerta recibir y puedes sumar a otras personas como destinatarias.",
  },
  {
    q: "¿Qué pasa si desconectan la batería del auto?",
    a: "El equipo principal tiene una batería interna de respaldo. Además, los planes Seguridad y Flota suman una señal de respaldo, como otra forma de ayudarte a localizar tu vehículo.",
  },
  {
    q: "¿Y si usan un inhibidor de señal?",
    a: "Ningún GPS es inmune a un inhibidor: mientras está encendido puede bloquear la señal. Si tu equipo deja de reportar, el panel lo muestra como «sin reporte» junto con la última posición conocida y su hora, para que actúes y llames al 133.",
  },
  {
    q: "¿Puedo cortar el suministro con el auto andando?",
    a: "Por seguridad vial, el corte de suministro se usa solo con el vehículo detenido. Cada comando queda registrado con fecha, hora y estado, y se puede revertir desde el panel.",
  },
  {
    q: "¿Tienen monitoreo 24/7?",
    a: "No. Alpha Link GPS es un servicio de autogestión: tú ves tu vehículo y recibes las alertas. Ante un robo, comparte la ubicación con Carabineros llamando al 133 y no intervengas personalmente.",
  },
  {
    q: "¿Sirve para mi vehículo?",
    a: "El GPS funciona con sistemas eléctricos de 12 y 24 V, así que sirve para autos, camionetas y camiones. Si tienes dudas sobre un modelo específico, escríbenos por WhatsApp antes de comprar.",
  },
  {
    q: "¿Hay una app?",
    a: "Por ahora entras desde el navegador del celular o del computador, con tu RUT. La app móvil está en desarrollo.",
  },
  {
    q: "¿Cuánto demora la instalación?",
    a: "Estamos definiendo el tiempo estándar con nuestros técnicos (por definir). Al agendar eliges un bloque de 2 horas y el técnico llega dentro de ese bloque; te avisamos cuando vaya en camino.",
  },
  {
    q: "¿Instalan en regiones?",
    a: "Por ahora solo en la Región Metropolitana. Si tu comuna no tiene horarios disponibles, te avisamos cuando se libere un cupo.",
  },
  {
    q: "¿Cuánto ahorro con el plan anual?",
    a: `Pagas 10 mensualidades y usas el servicio 12 meses: ${ANNUAL_FREE_MONTHS} meses gratis. El equipo y la instalación se pagan una sola vez en ambos casos.`,
  },
  {
    q: "¿Quién ve la ubicación de mi vehículo?",
    a: "Tú y las personas que autorices en tu cuenta. La ubicación es un dato personal: antes de instalar te pedimos tu consentimiento y te explicamos cómo se usa y protege.",
  },
];

export function Faq() {
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className="scroll-mt-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-28">
        <div className="lg:sticky lg:top-28 lg:self-start">
                    <h2
            id="preguntas-titulo"
            {...reveal(0)}
            className="font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-ink sm:text-5xl"
          >
            Lo que más nos preguntan.
          </h2>
          <p className="mt-5 text-ink-soft">¿Tienes otra duda? Escríbenos y te ayudamos.</p>
          <a
            href={site.whatsapp.href}
            className="mt-4 inline-flex items-center gap-2 font-medium text-accent-ink underline-offset-4 hover:underline"
          >
            <ChatIcon className="size-5" />
            Escríbenos por WhatsApp
          </a>
        </div>

        <div className="space-y-2">
          {faqs.map((item) => (
            <details key={item.q} className="group rounded-xl bg-surface px-5 open:pb-1">
              <summary className="flex min-h-14 items-center justify-between gap-4 py-3 text-left font-display text-lg font-medium text-ink">
                {item.q}
                <ChevronDownIcon className="size-5 shrink-0 text-muted transition-transform duration-200 ease-out-quart group-open:rotate-180" />
              </summary>
              <p className="pr-8 pb-5 text-lg leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
