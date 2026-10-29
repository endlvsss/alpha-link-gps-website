"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { AlertIcon, ChevronLeftIcon, CloseIcon } from "@/components/ui/icons";
import { clientStatus, STATUS_LABEL, STATUS_TONE, type Tone } from "@/lib/instalador/rules";
import type { Visit, VisitStatus } from "@/lib/instalador/model";
import { usePortal } from "@/lib/instalador/store";
import { enlaceVisitaAlCrm } from "@/lib/integracion-crm";
import { URL_CRM } from "@/lib/eventos";

const toneClass: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent-ink",
  amber: "bg-amber-soft text-amber",
  ok: "bg-ok-soft text-ok",
  danger: "bg-danger-soft text-danger",
  muted: "bg-ink/[0.08] text-ink-soft",
};

export function StatusChip({ status }: { status: VisitStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClass[tone]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

/** Encabezado de pantalla interna con botón de volver. */
export function ScreenHeader({ back, title, subtitle, action }: { back?: string; title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {back && (
        <Link
          href={back}
          aria-label="Volver"
          className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-xl text-ink active:bg-ink/[0.08]"
        >
          <ChevronLeftIcon className="size-6" />
        </Link>
      )}
      <div className="min-w-0 flex-1 pt-1.5">
        <h1 className="font-display text-2xl leading-tight font-bold text-ink">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-ink-soft">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

/** Panel inferior (diálogo nativo): foco atrapado y Escape gratis. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-3xl bg-surface p-0 text-ink backdrop:bg-black/60 sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      <div className="px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mt-1 -mr-2 flex size-10 items-center justify-center rounded-xl text-ink-soft active:bg-ink/[0.08]"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}

/** Estado del cliente en el CRM, para revisar el flujo con el equipo. */
export function CrmPanel({ visit }: { visit: Visit }) {
  const st = clientStatus(visit);
  const time = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  return (
    <details className="group rounded-2xl bg-bg-sunken p-4 text-sm">
      <summary className="flex min-h-11 items-center gap-2 text-muted">
        Demo interna · CRM: <span className="font-semibold text-ink">{st.stage}</span>
        {st.substate && <span>/ {st.substate}</span>}
      </summary>
      <p className="mt-2 text-muted">
        Simulación: no se envía nada al Service Desk ni a la plataforma GPS. Al cerrar o reportar
        una falla, «Enviar resultado al CRM» abre el CRM de demo con el resultado listo para aplicar.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(visit.estado === "cerrada_ok" || visit.estado === "fallida") && (
          <button
            type="button"
            onClick={() => window.open(enlaceVisitaAlCrm(visit), "_blank", "noopener")}
            className="inline-flex min-h-11 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-bg active:opacity-90"
          >
            Enviar resultado al CRM ↗
          </button>
        )}
        <a
          href={`${URL_CRM}/ventas`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-4 text-sm font-medium text-ink-soft"
        >
          Abrir CRM ↗
        </a>
      </div>
      <ol className="mt-3 space-y-1.5">
        {visit.events.map((e, i) => (
          <li key={`${e.at}-${i}`} className="flex gap-3">
            <span className="shrink-0 text-muted tabular-nums">{time.format(new Date(e.at))}</span>
            <span className="text-ink">{e.label}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Barra de acciones fija abajo. Un espaciador copia su altura, así la barra nunca
 * tapa lo último de la pantalla aunque crezca con la lista de pendientes.
 */
export function ActionBar({ children }: { children: ReactNode }) {
  const bar = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div aria-hidden="true" style={{ height }} />
      <div
        ref={bar}
        className="fixed inset-x-0 bottom-0 z-30 bg-surface px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-1px_0_var(--line)]"
      >
        <div className="mx-auto max-w-xl">{children}</div>
      </div>
    </>
  );
}

/** Lista de lo que falta para avanzar, dentro de la barra de acciones. */
export function IssueList({ issues }: { issues: string[] }) {
  if (!issues.length) return null;
  return (
    <div role="alert" className="mb-3 max-h-[35dvh] overflow-y-auto overscroll-contain rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
      <ul className="space-y-1">
        {issues.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Comunas del técnico: las primeras a la vista y el resto desplegable. */
export function ComunaList({ comunas, visible = 6 }: { comunas: string[]; visible?: number }) {
  const chips = (list: string[]) => (
    <div className="flex flex-wrap gap-2">
      {list.map((c) => (
        <Chip key={c} tone="muted">
          {c}
        </Chip>
      ))}
    </div>
  );
  if (comunas.length <= visible + 2) return chips(comunas);
  return (
    <details className="group">
      <summary className="list-none">
        {chips(comunas.slice(0, visible))}
        <span className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent-ink group-open:hidden">
          Ver las {comunas.length} comunas
        </span>
      </summary>
      <div className="mt-2">{chips(comunas.slice(visible))}</div>
    </details>
  );
}

export function PortalSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="space-y-3">
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-ink/[0.06]" />
      <div className="h-28 animate-pulse rounded-2xl bg-ink/[0.05]" />
      <div className="h-28 animate-pulse rounded-2xl bg-ink/[0.05]" />
    </div>
  );
}

/**
 * Pantalla que necesita los datos del teléfono: en el servidor y antes de la sesión
 * muestra el esqueleto (así la página siempre se renderiza y Next la valida).
 */
export function withPortal<P extends object>(Inner: ComponentType<P>) {
  function WithPortal(props: P) {
    const portal = usePortal();
    if (!portal?.session) return <PortalSkeleton />;
    return <Inner {...props} />;
  }
  WithPortal.displayName = `withPortal(${Inner.displayName ?? Inner.name})`;
  return WithPortal;
}
