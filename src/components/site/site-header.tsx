import Link from "next/link";
import { LogoHorizontal } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { nav } from "@/lib/site";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="-m-1 rounded-lg p-1 text-ink" aria-label="Alpha Link GPS, inicio">
          <LogoHorizontal className="h-8 w-auto sm:h-9" />
        </Link>

        <nav aria-label="Principal" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <ButtonLink href="/planes" size="sm" className="max-sm:hidden">
            Contratar
          </ButtonLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
