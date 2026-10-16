import Link from "next/link";
import { LogoHorizontal } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ChatIcon, LockIcon } from "@/components/ui/icons";
import { site } from "@/lib/site";

export function CheckoutHeader() {
  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="-m-1 rounded-lg p-1 text-ink" aria-label="Alpha Link GPS, volver al inicio">
          <LogoHorizontal className="h-7 w-auto" />
        </Link>
        <p className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
          <LockIcon className="size-4" />
          Compra segura
        </p>
        <div className="ml-auto flex items-center gap-1">
          <a
            href={site.whatsapp.href}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <ChatIcon className="size-4" />
            <span className="hidden sm:inline">¿Dudas? Escríbenos</span>
            <span className="sr-only sm:hidden">Ayuda por WhatsApp</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
