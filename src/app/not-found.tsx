import { LogoHorizontal } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <LogoHorizontal className="h-9 w-auto text-ink" />
      <p className="mt-10 font-mono text-sm text-muted">Error 404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
        No encontramos esta página
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Puede que el enlace esté incompleto o que la página ya no exista.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          Ir al inicio
        </ButtonLink>
        <ButtonLink href="/planes" variant="secondary" size="lg">
          Ver planes
        </ButtonLink>
      </div>
    </main>
  );
}
