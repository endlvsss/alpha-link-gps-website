"use client";

import { capitalize, formatLongDate } from "@/lib/format";
import { isActive } from "@/lib/instalador/rules";
import { usePortal } from "@/lib/instalador/store";
import { ScreenHeader, withPortal } from "./ui";
import { VisitCard } from "./visit-parts";

/** I8 · Historial de visitas cerradas. */
function HistoryScreenInner() {
  const portal = usePortal()!;
  const closed = portal.visits
    .filter((v) => !isActive(v))
    .sort((a, b) => (b.fecha + b.block.start).localeCompare(a.fecha + a.block.start));
  const byDate = new Map<string, typeof closed>();
  for (const v of closed) byDate.set(v.fecha, [...(byDate.get(v.fecha) ?? []), v]);

  const stats = [
    { label: "Cerradas", value: closed.filter((v) => v.estado === "cerrada_ok").length, tone: "text-ok" },
    { label: "Con incidencia", value: closed.filter((v) => v.estado === "fallida").length, tone: "text-danger" },
    { label: "No-show", value: closed.filter((v) => v.estado === "no_show_cliente").length, tone: "text-ink" },
  ];

  return (
    <div>
      <ScreenHeader title="Historial" subtitle="Tus visitas cerradas" />

      <dl className="mt-5 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface p-3 text-center">
            <dd className={`font-display text-3xl font-bold ${s.tone}`}>{s.value}</dd>
            <dt className="mt-1 text-xs text-ink-soft">{s.label}</dt>
          </div>
        ))}
      </dl>

      {closed.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-surface p-5 text-ink-soft">Aún no tienes visitas cerradas.</p>
      ) : (
        <ol className="mt-8 space-y-6">
          {[...byDate.entries()].map(([date, visits]) => (
            <li key={date}>
              <h2 className="font-display text-lg font-bold text-ink">{capitalize(formatLongDate(date))}</h2>
              <ul className="mt-2 space-y-2">
                {visits.map((v) => (
                  <li key={v.id}>
                    <VisitCard visit={v} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export const HistoryScreen = withPortal(HistoryScreenInner);
