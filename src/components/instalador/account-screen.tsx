"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, TextInput } from "@/components/compra/fields";
import { Button } from "@/components/ui/button";
import { CheckIcon, LogOutIcon } from "@/components/ui/icons";
import { formatImei } from "@/lib/imei";
import { logout, resetDemo, updateContact, usePortal } from "@/lib/instalador/store";
import { formatPhone, validateEmail, validatePhone } from "@/lib/validation";
import { Chip, ComunaList, ScreenHeader, Section, Sheet, withPortal } from "./ui";

const DOCUMENTS = ["Cédula de identidad", "Certificado de antecedentes", "Licencia de conducir"];

/** I9 · Mi cuenta: datos, comunas, documentos de validación y equipos en custodia. */
function AccountScreenInner() {
  const portal = usePortal()!;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { tech } = portal;
  const custody = portal.devices.filter((d) => d.estado === "en_custodia");

  return (
    <div>
      <ScreenHeader title="Mi cuenta" />

      <div className="mt-5 rounded-3xl bg-surface p-5">
        <p className="font-display text-xl font-bold text-ink">{tech.nombre}</p>
        <p className="text-sm text-ink-soft tabular-nums">RUT {tech.rut}</p>
        <div className="mt-3">
          <Chip tone="ok">
            <CheckIcon className="size-3.5" />
            Técnico activo
          </Chip>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">Celular</dt>
            <dd className="font-medium text-ink tabular-nums">+56 {tech.telefono}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">Correo</dt>
            <dd className="truncate font-medium text-ink">{tech.email}</dd>
          </div>
        </dl>
        <Button variant="secondary" className="mt-5 w-full" onClick={() => setEditing(true)}>
          Editar contacto
        </Button>
      </div>

      <Section title="Comunas">
        <ComunaList comunas={tech.comunas} />
        <p className="mt-2 text-sm text-muted">Las asigna Operaciones.</p>
      </Section>

      <Section title="Documentos de validación">
        <ul className="space-y-2">
          {DOCUMENTS.map((d) => (
            <li key={d} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface px-4">
              <span className="text-ink">{d}</span>
              <Chip tone="ok">Validado</Chip>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Equipos en tu custodia (${custody.length})`}>
        <ul className="space-y-2">
          {custody.map((d) => (
            <li key={d.imei} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface px-4">
              <span className="font-medium text-ink tabular-nums">{formatImei(d.imei)}</span>
              <span className="text-sm text-muted">{d.modelo}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">Si te falta un equipo, avisa a Operaciones antes de tu visita.</p>
      </Section>

      <div className="mt-10 grid gap-2">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            logout();
            router.replace("/instalador/ingreso");
          }}
        >
          <LogOutIcon className="size-5" />
          Cerrar sesión
        </Button>
        <button type="button" onClick={() => resetDemo()} className="h-11 text-sm font-medium text-muted">
          Demo: reiniciar visitas y disponibilidad
        </button>
      </div>

      {editing && <ContactSheet onClose={() => setEditing(false)} />}
    </div>
  );
}

function ContactSheet({ onClose }: { onClose: () => void }) {
  const { tech } = usePortal()!;
  const [telefono, setTelefono] = useState(tech.telefono);
  const [email, setEmail] = useState(tech.email);
  const [tried, setTried] = useState(false);
  const phoneError = tried ? validatePhone(telefono) : null;
  const emailError = tried ? validateEmail(email) : null;

  function save() {
    setTried(true);
    if (validatePhone(telefono) || validateEmail(email)) return;
    updateContact({ telefono, email: email.trim() });
    onClose();
  }

  return (
    <Sheet open onClose={onClose} title="Editar contacto">
      <div className="space-y-5">
        <Field id="tel-tecnico" label="Celular" error={phoneError}>
          {(d) => (
            <TextInput
              id="tel-tecnico"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={telefono}
              invalid={!!phoneError}
              aria-describedby={d}
              onChange={(e) => setTelefono(formatPhone(e.target.value))}
            />
          )}
        </Field>
        <Field id="mail-tecnico" label="Correo" error={emailError}>
          {(d) => (
            <TextInput
              id="mail-tecnico"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              invalid={!!emailError}
              aria-describedby={d}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>
        <Button size="lg" className="w-full" onClick={save}>
          Guardar
        </Button>
      </div>
    </Sheet>
  );
}

export const AccountScreen = withPortal(AccountScreenInner);
