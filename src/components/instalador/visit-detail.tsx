"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Select } from "@/components/compra/fields";
import { Button } from "@/components/ui/button";
import { AlertIcon, BanIcon, CheckIcon, LockIcon, MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import { capitalize, formatLongDate } from "@/lib/format";
import { formatImei } from "@/lib/imei";
import {
  accessoriesFor,
  FAILURE_CAUSES,
  NO_SHOW_MIN_ATTEMPTS,
  NO_SHOW_WAIT_MIN,
  VISIT_TYPE_LABEL,
  type Visit,
} from "@/lib/instalador/model";
import { canSeeContact, contactOpensAt, failureLabel, IN_PROGRESS, isActive } from "@/lib/instalador/rules";
import {
  addContactAttempt,
  addNoShowPhoto,
  cannotAttend,
  registerNoShow,
  usePortal,
} from "@/lib/instalador/store";
import { getPlan } from "@/lib/plans";
import { useNow } from "@/lib/use-now";
import { formatPatente } from "@/lib/validation";
import { PhotoSlot } from "./photo-input";
import { Chip, CrmPanel, ScreenHeader, Section, Sheet, StatusChip, withPortal } from "./ui";
import { NextStep } from "./visit-parts";

const CANNOT_ATTEND_REASONS = ["Enfermedad", "Problema con mi vehículo", "Emergencia familiar", "Otro"];

function VisitDetailInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const portal = usePortal()!;
  const now = useNow();
  const visit = portal.visits.find((v) => v.id === id);
  const [sheet, setSheet] = useState<"noPuedo" | "noShow" | null>(null);

  // Atajo desde el check-in (#cliente-no-esta). Next escribe la URL después del render,
  // por eso se lee en el primer frame; luego se limpia para que no se reabra al recargar.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (window.location.hash !== "#cliente-no-esta") return;
      setSheet("noShow");
      window.history.replaceState(window.history.state, "", window.location.pathname);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!visit) {
    return (
      <div>
        <ScreenHeader back="/instalador" title="Visita no encontrada" />
        <p className="mt-4 text-ink-soft">Puede que haya sido reasignada. Vuelve a tu agenda de hoy.</p>
      </div>
    );
  }

  const visible = canSeeContact(visit, now);
  const plan = getPlan(visit.planId);
  const address = [visit.direccion.calle, visit.direccion.detalle].filter(Boolean).join(", ");
  const query = encodeURIComponent(visible ? `${visit.direccion.calle}, ${visit.direccion.comuna}, Chile` : `${visit.direccion.comuna}, Chile`);
  const beforeCheckin = ["confirmada", "en_camino", "en_sitio"].includes(visit.estado) && !visit.registro.checkin.at;
  const canReportFailure = IN_PROGRESS.includes(visit.estado);

  return (
    <div>
      <ScreenHeader
        back="/instalador"
        title={VISIT_TYPE_LABEL[visit.tipo]}
        subtitle={
          <>
            {capitalize(formatLongDate(visit.fecha))} · <span className="tabular-nums">{visit.block.start} – {visit.block.end}</span>
          </>
        }
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusChip status={visit.estado} />
        <span className="text-sm text-muted tabular-nums">{visit.folio}</span>
      </div>

      {visit.motivo && <p className="mt-4 rounded-2xl bg-amber-soft p-4 text-ink">{visit.motivo}</p>}

      {isActive(visit) && (
        <div className="mt-5 rounded-3xl bg-surface p-5">
          <NextStep visit={visit} now={now} />
        </div>
      )}

      <ClosedSummary visit={visit} />

      <Section title="Cliente">
        <div className="rounded-2xl bg-surface p-4">
          <p className="font-medium text-ink">{visible ? visit.cliente.nombre : visit.cliente.nombre.split(" ")[0]}</p>
          {visible ? (
            <a
              href={`tel:+56${visit.cliente.telefono.replace(/\s/g, "")}`}
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-bg font-medium text-ink active:scale-[0.98]"
            >
              <PhoneIcon className="size-5" />
              Llamar · <span className="tabular-nums">+56 {visit.cliente.telefono}</span>
            </a>
          ) : (
            <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
              <LockIcon className="mt-0.5 size-4 shrink-0" />
              {visit.closedAt
                ? "Por privacidad, el teléfono y la dirección exacta ya no están visibles."
                : `Verás el teléfono y la dirección exacta desde el ${contactOpensAt(visit)}.`}
            </p>
          )}
        </div>
      </Section>

      <Section title="Dirección">
        <div className="rounded-2xl bg-surface p-4">
          <p className="flex items-start gap-2 text-ink">
            <MapPinIcon className="mt-0.5 size-5 shrink-0 text-muted" />
            <span>
              {visible && <span className="block font-medium">{address}</span>}
              {visit.direccion.comuna}, Región Metropolitana
            </span>
          </p>
          {visible && visit.direccion.indicaciones && (
            <p className="mt-3 rounded-xl bg-bg px-3 py-2 text-sm text-ink">{visit.direccion.indicaciones}</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center rounded-xl bg-bg text-sm font-medium text-ink active:scale-[0.98]"
            >
              Google Maps
            </a>
            <a
              href={`https://waze.com/ul?q=${query}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center rounded-xl bg-bg text-sm font-medium text-ink active:scale-[0.98]"
            >
              Waze
            </a>
          </div>
        </div>
      </Section>

      <Section title="Vehículo">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface p-4">
          <div>
            <p className="text-ink">
              {visit.vehiculo.marca} {visit.vehiculo.modelo} {visit.vehiculo.anio}
            </p>
            <p className="text-sm text-ink-soft">{visit.vehiculo.color}</p>
          </div>
          <p className="rounded-lg bg-bg px-3 py-1.5 font-display text-lg font-bold text-ink tabular-nums">
            {formatPatente(visit.vehiculo.patente)}
          </p>
        </div>
      </Section>

      <Section title={`Plan ${plan.name}`}>
        <ul className="space-y-2 rounded-2xl bg-surface p-4">
          {accessoriesFor(visit.planId).map((a) => (
            <li key={a} className="flex items-center gap-2 text-ink">
              <CheckIcon className="size-4 text-accent-ink" />
              {a}
            </li>
          ))}
        </ul>
        {visit.notas && <p className="mt-2 text-sm text-ink-soft">{visit.notas}</p>}
      </Section>

      {isActive(visit) && (
        <Section title="¿Algún problema?">
          <div className="grid gap-2">
            {beforeCheckin && visit.estado !== "confirmada" && (
              <Button variant="secondary" size="lg" onClick={() => setSheet("noShow")}>
                El cliente no está
              </Button>
            )}
            {canReportFailure && (
              <Link
                href={`/instalador/visita/${visit.id}/falla`}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-surface font-medium text-danger active:scale-[0.98]"
              >
                <AlertIcon className="size-5" />
                {failureLabel(visit)}
              </Link>
            )}
            {["agendada", "confirmada", "en_camino"].includes(visit.estado) && (
              <Button variant="secondary" size="lg" onClick={() => setSheet("noPuedo")}>
                <BanIcon className="size-5" />
                No puedo asistir
              </Button>
            )}
          </div>
        </Section>
      )}

      <div className="mt-8">
        <CrmPanel visit={visit} />
      </div>

      {sheet === "noPuedo" && <CannotAttendSheet visit={visit} onClose={() => setSheet(null)} />}
      {sheet === "noShow" && <NoShowSheet visit={visit} now={now} onClose={() => setSheet(null)} />}
    </div>
  );
}

function ClosedSummary({ visit }: { visit: Visit }) {
  const time = (iso: string | null) =>
    iso ? new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "—";
  if (visit.estado === "cerrada_ok") {
    const c = visit.registro.checkout;
    return (
      <div className="mt-5 rounded-3xl bg-ok-soft p-5">
        <p className="flex items-center gap-2 font-display text-lg font-bold text-ok">
          <CheckIcon className="size-5" />
          {visit.tipo === "visita_tecnica" ? "Visita cerrada · ticket resuelto" : "Instalado · vehículo activo"}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink-soft">Cierre</dt>
            <dd className="font-medium text-ink tabular-nums">{time(visit.closedAt)}</dd>
          </div>
          {visit.registro.instalacion.imei && (
            <div>
              <dt className="text-ink-soft">IMEI</dt>
              <dd className="font-medium text-ink tabular-nums">{formatImei(visit.registro.instalacion.imei)}</dd>
            </div>
          )}
          {c.receptorNombre && (
            <div className="col-span-2">
              <dt className="text-ink-soft">Recibió conforme</dt>
              <dd className="font-medium text-ink">{c.receptorNombre}</dd>
            </div>
          )}
        </dl>
      </div>
    );
  }
  if (visit.estado === "fallida" && visit.falla) {
    const cause = FAILURE_CAUSES.find((f) => f.id === visit.falla!.causa);
    return (
      <div className="mt-5 rounded-3xl bg-danger-soft p-5">
        <p className="font-display text-lg font-bold text-danger">Incidencia · {cause?.label}</p>
        <p className="mt-2 text-ink">{visit.falla.descripcion}</p>
        <p className="mt-3 text-sm text-ink-soft">
          Ticket <span className="font-medium text-ink">{visit.falla.ticket}</span> en el Service Desk. Soporte coordina una
          segunda visita o la reprogramación. Nunca se marca como instalado.
        </p>
      </div>
    );
  }
  if (visit.estado === "no_show_cliente") {
    return (
      <div className="mt-5 rounded-3xl bg-surface p-5">
        <p className="font-display text-lg font-bold text-ink">Cliente no estaba</p>
        <p className="mt-2 text-sm text-ink-soft">
          Quedó registrada la llegada con {visit.noShow.fotos.length} foto{visit.noShow.fotos.length === 1 ? "" : "s"} y{" "}
          {visit.noShow.intentos.length} intentos de contacto. El cliente recibió un enlace para reprogramar.
        </p>
      </div>
    );
  }
  if (visit.estado === "tecnico_no_disponible") {
    return (
      <div className="mt-5 rounded-3xl bg-surface p-5">
        <p className="font-display text-lg font-bold text-ink">Visita reasignada</p>
        <p className="mt-2 text-sm text-ink-soft">
          Motivo: {visit.noPuedo?.motivo}. Si hay otro técnico disponible se reasigna automáticamente; si no, el cliente recibe
          un enlace para elegir un horario nuevo.
        </p>
      </div>
    );
  }
  return null;
}

function CannotAttendSheet({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const [motivo, setMotivo] = useState(CANNOT_ATTEND_REASONS[0]);
  return (
    <Sheet open onClose={onClose} title="No puedo asistir">
      <p className="text-ink-soft">
        Liberamos tu bloque de las {visit.block.start} y buscamos otro técnico. El cliente siempre queda informado.
      </p>
      <label htmlFor="motivo-no-puedo" className="mt-5 block text-sm font-medium text-ink">
        Motivo
      </label>
      <Select id="motivo-no-puedo" className="mt-1.5" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
        {CANNOT_ATTEND_REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </Select>
      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={() => {
          cannotAttend(visit.id, motivo);
          onClose();
        }}
      >
        Confirmar: no puedo asistir
      </Button>
      <p className="mt-3 text-sm text-muted">Las cancelaciones frecuentes afectan tu puntualidad con Operaciones.</p>
    </Sheet>
  );
}

/** Cliente o auto no disponible (sección 8.2): llegada con fotos, hora y llamadas. */
function NoShowSheet({ visit, now, onClose }: { visit: Visit; now: number; onClose: () => void }) {
  const [skipWait, setSkipWait] = useState(false);
  const arrived = visit.llegadaAt ? Date.parse(visit.llegadaAt) : null;
  const waited = arrived && now ? Math.floor((now - arrived) / 60_000) : 0;
  const waitLeft = Math.max(0, NO_SHOW_WAIT_MIN - waited);
  const ready =
    !!arrived &&
    visit.noShow.fotos.length > 0 &&
    visit.noShow.intentos.length >= NO_SHOW_MIN_ATTEMPTS &&
    (waitLeft === 0 || skipWait);
  const time = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" });

  return (
    <Sheet open onClose={onClose} title="El cliente no está">
      {!arrived ? (
        <p className="rounded-xl bg-amber-soft px-4 py-3 text-sm text-ink">
          Primero registra tu llegada con «Llegué: empezar check-in»: así queda la hora y la ubicación.
        </p>
      ) : (
        <>
          <ol className="space-y-5">
            <li>
              <p className="font-medium text-ink">1. Foto de tu llegada</p>
              <p className="text-sm text-ink-soft">La fachada o el lugar donde debía estar el vehículo.</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {visit.noShow.fotos.map((p) => (
                  <PhotoSlot key={p.id} label="Llegada" photo={p} locked onChange={() => {}} />
                ))}
                {visit.noShow.fotos.length < 2 && (
                  <PhotoSlot label="Llegada" photo={null} onChange={(p) => p && addNoShowPhoto(visit.id, p)} />
                )}
              </div>
            </li>
            <li>
              <p className="font-medium text-ink">2. Intenta contactar ({visit.noShow.intentos.length}/{NO_SHOW_MIN_ATTEMPTS})</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => addContactAttempt(visit.id, { tipo: "llamada", resultado: "Sin respuesta" })}>
                  Llamé, no contesta
                </Button>
                <Button variant="secondary" onClick={() => addContactAttempt(visit.id, { tipo: "mensaje", resultado: "Enviado" })}>
                  Envié mensaje
                </Button>
              </div>
              {visit.noShow.intentos.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                  {visit.noShow.intentos.map((a, i) => (
                    <li key={i} className="tabular-nums">
                      {time.format(new Date(a.at))} · {a.tipo === "llamada" ? "Llamada" : "Mensaje"}: {a.resultado}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <p className="font-medium text-ink">3. Espera {NO_SHOW_WAIT_MIN} minutos</p>
              <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                {waitLeft > 0 && !skipWait ? `Faltan ${waitLeft} min desde tu llegada.` : "Tiempo de espera cumplido."}
                <Chip tone="amber">Propuesta, por definir</Chip>
              </p>
              {waitLeft > 0 && !skipWait && (
                <button type="button" onClick={() => setSkipWait(true)} className="mt-1 text-sm font-medium text-accent-ink">
                  Demo: omitir la espera
                </button>
              )}
            </li>
          </ol>
          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={!ready}
            onClick={() => {
              registerNoShow(visit.id);
              onClose();
            }}
          >
            Registrar que el cliente no estaba
          </Button>
          <p className="mt-3 text-sm text-muted">El cliente recibe un enlace para reprogramar. Cobro de visita: por definir.</p>
        </>
      )}
    </Sheet>
  );
}

export const VisitDetail = withPortal(VisitDetailInner);
