import type { Metadata } from "next";
import Link from "next/link";
import { Comparison } from "@/components/plans/comparison";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Eyebrow, ProvisionalTag } from "@/components/ui/tags";

export const metadata: Metadata = {
  title: "Planes",
  description: "Compara los planes Esencial, Seguridad y Flota de Alpha Link GPS.",
};

export default function PlanesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:pb-28">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="size-4" />
        Volver al inicio
      </Link>

      <div className="mx-auto mt-8 max-w-2xl text-center">
        <Eyebrow>Comparar planes</Eyebrow>
        <h1 className="mt-4 font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-ink sm:text-5xl">
          Encuentra el plan para tu vehículo.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Todos incluyen instalación a domicilio en la Región Metropolitana y acceso al panel desde
          el celular o el computador.
        </p>
      </div>

      <div className="mt-10">
        <Comparison />
      </div>

      <p className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted">
        <ProvisionalTag>Provisorio</ProvisionalTag>
        Nombres, funciones por plan y precios son una referencia de trabajo. Valores en CLP con IVA.
      </p>
    </div>
  );
}
