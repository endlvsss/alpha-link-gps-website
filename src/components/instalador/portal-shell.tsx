"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { CalendarIcon, HistoryIcon, HomeIcon, SlidersIcon, UserIcon, WifiOffIcon } from "@/components/ui/icons";
import { usePortal } from "@/lib/instalador/store";

const TABS = [
  { href: "/instalador", label: "Hoy", icon: HomeIcon },
  { href: "/instalador/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/instalador/disponibilidad", label: "Disponibilidad", icon: SlidersIcon },
  { href: "/instalador/historial", label: "Historial", icon: HistoryIcon },
  { href: "/instalador/cuenta", label: "Cuenta", icon: UserIcon },
];

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function PortalShell({ children }: { children: ReactNode }) {
  const portal = usePortal();
  const router = useRouter();
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);

  useEffect(() => {
    if (portal && !portal.session) router.replace("/instalador/ingreso");
  }, [portal, router]);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 bg-bg/95 pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          <Link href="/instalador" className="flex items-center gap-2.5 text-ink" aria-label="Portal técnicos, inicio">
            <LogoMark className="h-6 w-auto" />
            <span className="font-display font-bold">Portal técnicos</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        {!online && (
          <p role="status" className="flex items-center justify-center gap-2 bg-amber-soft px-4 py-2 text-sm font-medium text-amber">
            <WifiOffIcon className="size-4" />
            Sin conexión: tu avance queda guardado en el teléfono.
          </p>
        )}
      </header>

      <main
        id="contenido"
        className="mx-auto max-w-xl px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]"
      >
        {children}
      </main>

      {/* usePathname va dentro de Suspense para no bloquear el prerender de las rutas dinámicas. */}
      <Suspense fallback={null}>
        <TabBar />
      </Suspense>
    </div>
  );
}

function TabBar() {
  const pathname = usePathname();
  // Dentro del asistente y del reporte de falla, la barra inferior es la de acciones.
  if (/\/(registro|falla)$/.test(pathname)) return null;
  return (
    <nav
      aria-label="Portal"
      className="fixed inset-x-0 bottom-0 z-30 bg-surface pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-1px_0_var(--line)]"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/instalador" ? pathname === href || pathname.startsWith("/instalador/visita") : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium select-none active:bg-ink/[0.06] ${
                  active ? "text-accent-ink" : "text-muted"
                }`}
              >
                <Icon className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
