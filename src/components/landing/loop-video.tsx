"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "@/components/site/theme-toggle";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// Una versión por tema. La oculta tiene display: none, así que nunca entra en
// pantalla: el observador no la descarga ni la reproduce.
const VARIANTS = [
  { tema: "oscuro", theme: "dark", className: "hidden dark:block" },
  { tema: "claro", theme: "light", className: "dark:hidden" },
] as const;

interface LoopVideoProps {
  /** Nombre base en /public/videos: {name}-{oscuro|claro}.webm, .mp4 y .jpg (primer cuadro). */
  name: string;
  /** Descripción para lectores de pantalla. */
  label: string;
  /** Imagen fija para quien prefiere reducir el movimiento (por defecto, el póster). */
  still?: string;
  className?: string;
}

/**
 * Animación en bucle hecha con Remotion. Solo se descarga y reproduce cuando
 * está en pantalla; respeta "reducir movimiento" y se puede pausar (WCAG 2.2.2).
 */
export function LoopVideo({ name, label, still, className = "" }: LoopVideoProps) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const [playing, setPlaying] = useState(false);
  const theme = useTheme();
  const shouldPlay = choice ? choice === "play" : !reduced;

  useEffect(() => {
    const videos = refs.current.filter((v): v is HTMLVideoElement => v !== null);
    if (!shouldPlay) {
      videos.forEach((v) => v.pause());
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.preload = "auto";
            video.play().catch(() => {
              // Reproducción automática bloqueada: queda el póster y el botón.
            });
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [shouldPlay]);

  const syncPlaying = () => setPlaying(refs.current.some((v) => v !== null && !v.paused));

  return (
    <div className={`relative overflow-hidden bg-deep ${className}`}>
      {VARIANTS.map(({ tema, theme: variantTheme, className: visibility }, i) => (
        <video
          key={tema}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`absolute inset-0 size-full object-cover ${visibility}`}
          // Solo la versión del tema activo pide su póster.
          poster={
            variantTheme === theme
              ? `/videos/${reduced && !playing ? (still ?? name) : name}-${tema}.jpg`
              : undefined
          }
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlay={syncPlaying}
          onPause={syncPlaying}
        >
          <source src={`/videos/${name}-${tema}.webm`} type="video/webm" />
          <source src={`/videos/${name}-${tema}.mp4`} type="video/mp4" />
        </video>
      ))}
      <p className="sr-only">{label}</p>
      <button
        type="button"
        onClick={() => setChoice(playing ? "pause" : "play")}
        aria-label={playing ? "Pausar animación" : "Reproducir animación"}
        className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white opacity-80 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100"
      >
        {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
      </button>
    </div>
  );
}
