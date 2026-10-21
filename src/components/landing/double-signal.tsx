"use client";

import { useEffect, useRef, useState } from "react";
import { reveal } from "@/lib/reveal";

type SignalId = "p" | "r";

// Colores fijos de la escena (siempre sobre el campo petróleo profundo).
const PRINCIPAL = "#53d8ea";
const RESPALDO = "#63d29c";

const signals: { id: SignalId; name: string; body: string; more: string }[] = [
  {
    id: "p",
    name: "Señal 1 · Principal",
    body: "La señal de localización principal de tu vehículo.",
    more: "Es la que ves en el mapa de tu panel, con la hora de la última posición.",
  },
  {
    id: "r",
    name: "Señal 2 · Respaldo",
    body: "Una alternativa de localización como respaldo de la señal principal.",
    more: "Te da otra forma de buscar tu vehículo si dejas de recibir la principal.",
  },
];

// Escena de 1200 × 700, con el vehículo centrado en (600, 350).
const CX = 600;
const CY = 350;
const R_P = 238; // campo de la señal principal
const R_R = 292; // banda de la señal de respaldo
// Recuadro cuadrado que se muestra de la escena (celular y escritorio).
const BOX = { x: 260, y: 10, s: 680 };

// Banda de puntos del respaldo: tres anillos de puntos desfasados.
const backupDots = [280, 292, 304].flatMap((r, ring) => {
  const n = Math.round((2 * Math.PI * r) / 15);
  return Array.from({ length: n }, (_, i) => {
    const a = ((i + (ring % 2) * 0.5) / n) * Math.PI * 2;
    return {
      x: Math.round((CX + r * Math.cos(a)) * 10) / 10,
      y: Math.round((CY + r * Math.sin(a)) * 10) / 10,
      k: `${ring}-${i}`,
      o: ring === 1 ? 0.9 : 0.45,
    };
  });
});

/**
 * Señal principal y señal de respaldo, de forma conceptual: dos campos alrededor
 * del vehículo, sin indicar dónde van los equipos. La aparición en secuencia es
 * narrativa; no simula el comportamiento técnico.
 */
export function DoubleSignal() {
  const root = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<SignalId | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPlaying(entry.isIntersecting);
        if (entry.isIntersecting) setEntered(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const label = "Vehículo visto desde arriba, rodeado por dos campos de señal: uno principal y uno de respaldo.";

  return (
    <section id="doble-senal" aria-labelledby="doble-senal-titulo" className="scroll-mt-20 bg-deep text-on-deep">
      <div
        ref={root}
        data-sig={entered ? "in" : "out"}
        data-play={playing ? "on" : "off"}
        data-active={active ?? undefined}
        className="sig-root mx-auto grid max-w-6xl items-center gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14 lg:py-24"
      >
        <div>
          <h2
            id="doble-senal-titulo"
            {...reveal(0)}
            className="font-display text-[1.85rem] leading-[1.06] font-bold tracking-[-0.03em] min-[400px]:text-[2rem] sm:text-5xl lg:text-[2.35rem] xl:text-[2.7rem]"
          >
            Una señal principal.
            <br />
            Un respaldo adicional.
          </h2>
          <p {...reveal(1)} className="mt-4 max-w-md text-lg leading-relaxed text-on-deep-muted">
            Dos señales con un mismo propósito: ayudarte a localizar tu vehículo.
          </p>
          <div className="mt-8 grid gap-3 max-lg:hidden">
            {signals.map((s) => (
              <SignalCard key={s.id} signal={s} active={active} setActive={setActive} />
            ))}
          </div>
          <Conditions className="mt-6 max-lg:hidden" />
        </div>

        {/* La escena: cuadrada, con una etiqueta unida a cada campo. */}
        <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* El barrido va detrás de la escena para no sombrear el vehículo. */}
          <Sweep />
          <svg viewBox={`${BOX.x} ${BOX.y} ${BOX.s} ${BOX.s}`} className="relative block w-full" role="img" aria-label={label}>
            <Scene />
          </svg>
          <SceneTag signal="p" x={430} y={155} align="end">
            Principal
          </SceneTag>
          <SceneTag signal="r" x={758} y={655} align="start">
            Respaldo
          </SceneTag>
        </figure>

        {/* Celular y tablet: las tarjetas van bajo la escena. */}
        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
          {signals.map((s) => (
            <SignalCard key={s.id} signal={s} active={active} setActive={setActive} />
          ))}
          <Conditions className="mt-2 sm:col-span-2" />
        </div>
      </div>
    </section>
  );
}

/** Barrido tipo radar sobre el campo principal (capa HTML alineada con la escena). */
function Sweep() {
  const pct = (v: number) => `${(v / BOX.s) * 100}%`;
  return (
    <div
      aria-hidden="true"
      className="sig-enter-p pointer-events-none absolute"
      style={{ left: pct(CX - R_P - BOX.x), top: pct(CY - R_P - BOX.y), width: pct(R_P * 2), height: pct(R_P * 2) }}
    >
      <div className="sig-p size-full">
        <div className="sig-sweep size-full rounded-full" />
      </div>
    </div>
  );
}

/** Etiqueta breve sobre la escena, en la punta del trazo de su campo. */
function SceneTag({ signal, x, y, align, children }: { signal: SignalId; x: number; y: number; align: "start" | "end"; children: string }) {
  const color = signal === "p" ? PRINCIPAL : RESPALDO;
  return (
    <span
      aria-hidden="true"
      className={`absolute -translate-y-1/2 ${align === "end" ? "-translate-x-full" : ""}`}
      style={{ left: `${((x - BOX.x) / BOX.s) * 100}%`, top: `${((y - BOX.y) / BOX.s) * 100}%` }}
    >
      <span className={`${signal === "p" ? "sig-enter-p" : "sig-enter-r"} block`}>
        <span className={`${signal === "p" ? "sig-p" : "sig-r"} inline-flex items-center gap-1.5 rounded-full bg-night/80 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-on-deep sm:text-sm`}>
          <span className="size-1.5 rounded-full" style={{ background: color }} />
          {children}
        </span>
      </span>
    </span>
  );
}

function Conditions({ className = "" }: { className?: string }) {
  return (
    <p className={`max-w-md text-sm leading-relaxed text-on-deep-muted ${className}`}>
      Incluida en los planes Seguridad y Flota. La localización depende de la cobertura y de las condiciones del lugar
      donde esté el vehículo.
    </p>
  );
}

function SignalCard({
  signal,
  active,
  setActive,
}: {
  signal: (typeof signals)[number];
  active: SignalId | null;
  setActive: (id: SignalId | null | ((cur: SignalId | null) => SignalId | null)) => void;
}) {
  const on = active === signal.id;
  const pointer = useRef<string | null>(null);
  const color = signal.id === "p" ? PRINCIPAL : RESPALDO;

  return (
    <button
      type="button"
      aria-pressed={on}
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(signal.id)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
      onClick={() => {
        // Con mouse manda el cursor; con el dedo o el teclado, el toque alterna.
        if (pointer.current !== "mouse") setActive((cur) => (cur === signal.id ? null : signal.id));
        pointer.current = null;
      }}
      className={`${signal.id === "p" ? "sig-enter-p" : "sig-enter-r"} block w-full rounded-2xl p-5 text-left transition-colors duration-200 active:scale-[0.99] ${
        on ? "bg-white/[0.11]" : "bg-white/[0.05]"
      }`}
    >
      <span className="flex items-center gap-3">
        <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true" className="shrink-0">
          <line
            x1="1"
            y1="5"
            x2="21"
            y2="5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={signal.id === "r" ? "0.1 4.5" : undefined}
          />
          <circle cx="24" cy="5" r="3" fill={color} />
        </svg>
        <span className="font-display text-lg font-semibold text-on-deep">{signal.name}</span>
      </span>
      <span className="mt-2 block leading-relaxed text-on-deep-muted">{signal.body}</span>
      <span className={`grid transition-[grid-template-rows] duration-300 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <span className="overflow-hidden">
          <span className="block pt-2 text-sm leading-relaxed text-on-deep">{signal.more}</span>
        </span>
      </span>
    </button>
  );
}

function Scene() {
  const circ = Math.round(2 * Math.PI * R_P);
  return (
    <>
      <defs>
        <radialGradient id="sig-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={PRINCIPAL} stopOpacity="0.1" />
          <stop offset="70%" stopColor={PRINCIPAL} stopOpacity="0.03" />
          <stop offset="100%" stopColor={PRINCIPAL} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Fondo de instrumento: anillos y ejes muy tenues */}
      <g stroke="#e4ecee" strokeOpacity="0.06" fill="none">
        {[150, 210, 380, 450].map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} />
        ))}
        <path d={`M ${CX - 470} ${CY} H ${CX - 350} M ${CX + 350} ${CY} H ${CX + 470} M ${CX} ${CY - 345} V ${CY - 300} M ${CX} ${CY + 300} V ${CY + 345}`} />
      </g>

      {/* Respaldo: banda de puntos, ritmo lento */}
      <g className="sig-enter-r">
        <g className="sig-r">
          <g className="sig-breathe">
            {backupDots.map((d) => (
              <circle key={d.k} cx={d.x} cy={d.y} r="2.1" fill={RESPALDO} opacity={d.o} />
            ))}
          </g>
          <circle className="sig-pulse sig-pulse-r" cx={CX} cy={CY} r={R_R} fill="none" stroke={RESPALDO} strokeWidth="1.5" />
          <path d="M 700 624 L 726 655 H 752" stroke={RESPALDO} strokeOpacity="0.7" strokeWidth="1.4" strokeDasharray="0.1 5" strokeLinecap="round" fill="none" />
          <circle cx="700" cy="624" r="4.5" fill={RESPALDO} />
        </g>
      </g>

      {/* Principal: campo preciso, se dibuja al entrar y late a ritmo corto */}
      <g className="sig-enter-p">
        <g className="sig-p">
          <circle cx={CX} cy={CY} r={R_P} fill="url(#sig-floor)" />
          <circle
            className="sig-draw"
            cx={CX}
            cy={CY}
            r={R_P}
            fill="none"
            stroke={PRINCIPAL}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circ}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ ["--len" as string]: circ }}
          />
          <circle className="sig-pulse sig-pulse-p" cx={CX} cy={CY} r={R_P} fill="none" stroke={PRINCIPAL} strokeWidth="1.6" />
          <circle className="sig-pulse sig-pulse-p sig-pulse-p2" cx={CX} cy={CY} r={R_P} fill="none" stroke={PRINCIPAL} strokeWidth="1.6" />
          <path d="M 436 155 H 463" stroke={PRINCIPAL} strokeOpacity="0.7" strokeWidth="1.4" fill="none" />
          <circle cx="463.5" cy="155" r="4.5" fill={PRINCIPAL} />
        </g>
      </g>

      <g transform={`translate(${CX} ${CY}) scale(0.86)`}>
        <Car uid="s" />
      </g>
    </>
  );
}

/**
 * Sedán moderno en vista superior, mirando a la derecha, centrado en (0, 0).
 * Volumen con tonos (centro claro, bordes oscuros), techo panorámico y luces LED.
 * Sin equipos ni puntos de instalación.
 */
function Car({ uid }: { uid: string }) {
  const id = (name: string) => `car-${name}-${uid}`;
  return (
    <g className="sig-car">
      <defs>
        <linearGradient id={id("body")} x1="0" y1="-100" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0d1e24" />
          <stop offset="0.16" stopColor="#1f3f47" />
          <stop offset="0.5" stopColor="#36636d" />
          <stop offset="0.84" stopColor="#1f3f47" />
          <stop offset="1" stopColor="#0d1e24" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="-130" y1="0" x2="130" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b1a20" />
          <stop offset="0.5" stopColor="#13303a" />
          <stop offset="1" stopColor="#081419" />
        </linearGradient>
        <linearGradient id={id("roof")} x1="0" y1="-72" x2="0" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#081419" />
          <stop offset="0.45" stopColor="#163742" />
          <stop offset="0.55" stopColor="#163742" />
          <stop offset="1" stopColor="#081419" />
        </linearGradient>
        <filter id={id("shadow")} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      {/* Sombra al piso, desplazada */}
      <ellipse cx="6" cy="14" rx="262" ry="112" fill="#01080b" opacity="0.7" filter={`url(#${id("shadow")})`} />

      {/* Ruedas asomando bajo los pasos de rueda */}
      {[
        [124, -110],
        [-182, -110],
        [124, 96],
        [-182, 96],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="62" height="14" rx="5" fill="#04080a" />
          <rect x={x + 8} y={y + (y < 0 ? 2 : 8)} width="46" height="4" rx="2" fill="#5a6f75" opacity="0.5" />
        </g>
      ))}

      {/* Carrocería */}
      <path
        d="M -230 -66 C -238 -36, -238 36, -230 66 C -224 86, -204 96, -176 98 C -146 101, -106 100, -60 98 C 10 96, 96 99, 150 99 C 192 98, 222 90, 236 70 C 247 48, 247 -48, 236 -70 C 222 -90, 192 -98, 150 -99 C 96 -99, 10 -96, -60 -98 C -106 -100, -146 -101, -176 -98 C -204 -96, -224 -86, -230 -66 Z"
        fill={`url(#${id("body")})`}
      />
      {/* Brillo y sombra de los cantos */}
      <path d="M -170 -92 C -90 -95, 60 -93, 150 -94" stroke="#cfe6ea" strokeOpacity="0.16" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M -170 92 C -90 95, 60 93, 150 94" stroke="#000" strokeOpacity="0.25" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Capó: nervios */}
      <path d="M 134 -30 C 176 -27, 210 -22, 234 -14 M 134 30 C 176 27, 210 22, 234 14" stroke="#cfe6ea" strokeOpacity="0.13" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 134 -2 C 180 -1, 214 0, 238 0" stroke="#cfe6ea" strokeOpacity="0.07" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Maletero */}
      <path d="M -196 -82 C -208 -44, -208 44, -196 82" stroke="#000" strokeOpacity="0.35" strokeWidth="1.6" fill="none" />
      <path d="M -150 -84 C -160 -40, -160 40, -150 84" stroke="#cfe6ea" strokeOpacity="0.08" strokeWidth="1.4" fill="none" />

      {/* Líneas de puertas */}
      {[-56, 22].map((x) => (
        <g key={x} stroke="#000" strokeOpacity="0.4" strokeWidth="1.4">
          <path d={`M ${x} -98 L ${x + 2} -86`} />
          <path d={`M ${x} 98 L ${x + 2} 86`} />
        </g>
      ))}

      {/* Ventanas laterales (franjas vistas desde arriba) */}
      <path d="M -112 -80 C -40 -86, 40 -88, 104 -84 L 100 -76 C 40 -79, -40 -78, -108 -73 Z" fill="#0a171c" />
      <path d="M -112 80 C -40 86, 40 88, 104 84 L 100 76 C 40 79, -40 78, -108 73 Z" fill="#0a171c" />

      {/* Parabrisas */}
      <path d="M 60 -72 L 104 -82 C 120 -84, 130 -60, 130 0 C 130 60, 120 84, 104 82 L 60 72 C 67 30, 67 -30, 60 -72 Z" fill={`url(#${id("glass")})`} />
      <path d="M 70 -60 C 92 -64, 108 -66, 118 -58" stroke="#d9f7fb" strokeOpacity="0.22" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Techo panorámico de vidrio */}
      <path d="M -66 -70 L 52 -71 C 59 -30, 59 30, 52 71 L -66 70 C -72 30, -72 -30, -66 -70 Z" fill={`url(#${id("roof")})`} />
      <path d="M -50 -40 C -10 -44, 24 -44, 44 -38" stroke="#d9f7fb" strokeOpacity="0.14" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M -54 -24 C -16 -27, 18 -27, 40 -22" stroke="#d9f7fb" strokeOpacity="0.07" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Luneta trasera */}
      <path d="M -74 -70 L -114 -77 C -128 -79, -134 -52, -134 0 C -134 52, -128 79, -114 77 L -74 70 C -80 30, -80 -30, -74 -70 Z" fill={`url(#${id("glass")})`} />

      {/* Espejos */}
      <path d="M 92 -97 C 94 -110, 108 -118, 120 -112 C 124 -106, 116 -99, 104 -97 Z" fill="#1f3f47" />
      <path d="M 92 97 C 94 110, 108 118, 120 112 C 124 106, 116 99, 104 97 Z" fill="#1f3f47" />

      {/* Focos LED delanteros */}
      <path d="M 212 -88 C 226 -80, 236 -66, 240 -50 L 234 -48 C 230 -62, 222 -74, 208 -82 Z" fill="#eafcff" />
      <path d="M 212 88 C 226 80, 236 66, 240 50 L 234 48 C 230 62, 222 74, 208 82 Z" fill="#eafcff" />
      <path d="M 214 -86 C 228 -77, 237 -64, 241 -50" stroke={PRINCIPAL} strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 214 86 C 228 77, 237 64, 241 50" stroke={PRINCIPAL} strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Barra de luz trasera */}
      <path d="M -229 -60 C -235 -30, -235 30, -229 60" stroke="#ff5d63" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M -229 -60 C -235 -30, -235 30, -229 60" stroke="#ff5d63" strokeOpacity="0.25" strokeWidth="10" fill="none" strokeLinecap="round" />
    </g>
  );
}
