import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark, LogoStacked } from "@/components/brand/logo";
import { ChatIcon, LockIcon, MapPinIcon, ShieldIcon } from "@/components/ui/icons";
import { site } from "@/lib/site";

const columns: { title: string; links: { label: string; href?: string; note?: string }[] }[] = [
  {
    title: "Producto",
    links: [
      { label: "Cómo funciona", href: "/#como-funciona" },
      { label: "Funciones", href: "/#funciones" },
      { label: "Señal principal y de respaldo", href: "/#doble-senal" },
      { label: "Planes y precios", href: "/#planes" },
      { label: "Comparar planes", href: "/planes" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Preguntas frecuentes", href: "/#preguntas" },
      { label: "¿Instalamos en tu comuna?", href: "/#planes" },
      { label: "Agenda tu instalación", href: "/agenda" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos del servicio", note: "En revisión" },
      { label: "Aviso de privacidad", note: "En revisión" },
    ],
  },
];

const trust: { icon: ReactNode; text: string }[] = [
  { icon: <LockIcon className="size-5" />, text: "Pago seguro con Webpay" },
  { icon: <MapPinIcon className="size-5" />, text: "Instalación a domicilio en la RM" },
  { icon: <ShieldIcon className="size-5" />, text: "Señal principal y de respaldo" },
];

export function SiteFooter() {
  return (
    <footer className="bg-bg-sunken">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1.25fr_2fr] lg:gap-16">
          {/* Marca y contacto */}
          <div>
            <Link href="/" aria-label="Alpha Link GPS, inicio" className="inline-block text-ink">
              <LogoStacked className="h-14 w-auto sm:h-16" />
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-ink-soft sm:mt-6 sm:text-lg">
              Tu vehículo, siempre a la vista. Rastreo GPS y anti-robo con instalación a domicilio.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={site.whatsapp.href}
                className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-brand px-4 font-medium text-on-brand transition-colors duration-150 hover:bg-brand-strong"
              >
                <ChatIcon className="size-5" />
                Escríbenos por WhatsApp
              </a>
              <a
                href={`mailto:${site.email.display}`}
                className="inline-flex h-11 items-center rounded-xl bg-surface px-4 font-medium text-ink transition-colors duration-150 hover:bg-surface-2"
              >
                {site.email.display}
              </a>
            </div>
            <p className="mt-3 text-sm text-muted">
              WhatsApp {site.whatsapp.display} · contacto provisorio
            </p>
          </div>

          {/* Enlaces */}
          <nav aria-label="Pie de página" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 sm:gap-10">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-display text-base font-bold text-ink">{col.title}</h2>
                <ul className="mt-4 space-y-3 sm:mt-5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link href={link.href} className="text-ink-soft transition-colors duration-150 hover:text-accent-ink">
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-ink-soft">
                          {link.label}
                          {link.note && <span className="block text-sm text-muted">{link.note}</span>}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Lo que da confianza, de un vistazo */}
        <ul className="mt-12 grid gap-1 rounded-2xl bg-surface p-2 sm:mt-16 sm:grid-cols-3 sm:gap-3 sm:p-3">
          {trust.map((item) => (
            <li key={item.text} className="flex items-center gap-3 rounded-xl px-3 py-2 text-ink sm:px-4 sm:py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink sm:size-10">
                {item.icon}
              </span>
              <span className="font-medium">{item.text}</span>
            </li>
          ))}
        </ul>

        {/* Barra final */}
        <div className="mt-8 flex flex-col gap-3 text-sm text-muted sm:mt-10 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2.5">
            <LogoMark className="h-5 w-auto text-ink" />
            <span>
              © 2026 Un servicio de{" "}
              <a href={site.corporateUrl} className="font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                {site.company}
              </a>
            </span>
          </p>
          <p className="md:text-right">
            Precios, planes y condiciones provisorios · Capturas con datos de prueba
          </p>
        </div>
      </div>
    </footer>
  );
}
