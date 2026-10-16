"use client";

import { useState } from "react";
import { AlertIcon, SignalIcon } from "@/components/ui/icons";
import { SeverityChip } from "@/components/ui/tags";

export function DoubleSignalDemo() {
  const [decoupled, setDecoupled] = useState(false);

  return (
    <div className="rounded-3xl bg-white/[0.06] p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs tracking-[0.14em] text-on-deep-muted uppercase">
          Simulación
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-300 ${
            decoupled ? "bg-danger/20 text-on-deep" : "bg-accent/15 text-on-deep"
          }`}
        >
          <span className={`size-1.5 rounded-full ${decoupled ? "bg-danger" : "bg-accent"}`} />
          {decoupled ? "Desacoplados" : "GPS y TAG vinculados"}
        </span>
      </div>

      <svg viewBox="0 0 360 200" className="mt-4 h-auto w-full" role="img" aria-label={decoupled ? "El GPS dejó de reportar y se separó del TAG." : "El GPS y el TAG están vinculados dentro del vehículo."}>
        {/* Carrocería vista desde arriba (frente a la derecha) */}
        <rect x="34" y="34" width="292" height="132" rx="58" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2" />
        <path d="M232 46 C 262 56, 272 80, 272 100 S 262 144, 232 154" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2" />
        <path d="M98 50 C 82 64, 78 82, 78 100 S 82 136, 98 150" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2" />
        <rect x="78" y="22" width="44" height="14" rx="6" fill="currentColor" fillOpacity="0.18" />
        <rect x="236" y="22" width="44" height="14" rx="6" fill="currentColor" fillOpacity="0.18" />
        <rect x="78" y="164" width="44" height="14" rx="6" fill="currentColor" fillOpacity="0.18" />
        <rect x="236" y="164" width="44" height="14" rx="6" fill="currentColor" fillOpacity="0.18" />

        {/* Vínculo */}
        <path
          d="M226 88 C 190 70, 150 136, 112 122"
          fill="none"
          stroke={decoupled ? "var(--danger)" : "var(--accent)"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={decoupled ? "4 14" : "6 7"}
          className={`transition-[stroke] duration-300 ${decoupled ? "" : "motion-safe:[animation:dash_1.2s_linear_infinite]"}`}
        />

        {/* GPS */}
        <g className="transition-opacity duration-300" opacity={decoupled ? 0.45 : 1}>
          <circle cx="232" cy="88" r="16" fill={decoupled ? "var(--muted)" : "var(--accent)"} fillOpacity="0.2" />
          <circle cx="232" cy="88" r="8" fill={decoupled ? "var(--muted)" : "var(--accent)"} />
          <text x="232" y="122" textAnchor="middle" className="fill-current font-mono text-[11px]">GPS 4G</text>
        </g>

        {/* TAG */}
        <g>
          <circle cx="106" cy="122" r="16" fill="var(--amber-bright)" fillOpacity="0.2" />
          <circle cx="106" cy="122" r="7" fill="var(--amber-bright)" />
          <text x="106" y="156" textAnchor="middle" className="fill-current font-mono text-[11px]">TAG</text>
        </g>
      </svg>

      <div aria-live="polite" className="mt-4 min-h-[6.25rem]">
        {decoupled ? (
          <div className="flex items-start gap-3 rounded-2xl bg-danger/15 p-4 motion-safe:animate-rise">
            <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-on-deep" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-on-deep">Desacoplamiento GPS / TAG</p>
                <SeverityChip level="alta" />
              </div>
              <p className="mt-1 text-sm text-on-deep-muted">
                El GPS y el TAG se separaron. Revisa el mapa y el historial de tu vehículo.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4">
            <SignalIcon className="mt-0.5 size-5 shrink-0 text-accent" />
            <p className="text-sm text-on-deep-muted">
              Todo en orden: los dos equipos están juntos y el GPS reporta en vivo.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setDecoupled((v) => !v)}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/20 text-sm font-medium text-on-deep transition-colors duration-150 hover:bg-white/10 dark:border-line-strong dark:hover:bg-ink/[0.06]"
      >
        {decoupled ? "Restablecer" : "Simular que desconectan el GPS"}
      </button>
    </div>
  );
}
