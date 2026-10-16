import Link from "next/link";
import { CoverageCheck } from "@/components/plans/coverage-check";
import { PlanCards } from "@/components/plans/plan-cards";
import { Guarantee } from "@/components/site/guarantee";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Eyebrow, ProvisionalTag } from "@/components/ui/tags";
import { reveal } from "@/lib/reveal";

export function PlansSection() {
  return (
    <section id="planes" aria-labelledby="planes-titulo" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Planes</Eyebrow>
          <h2 {...reveal(1)}
            id="planes-titulo"
            className="mt-4 font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-ink sm:text-5xl"
          >
            Elige cómo quieres protegerlo.
          </h2>
          <p {...reveal(2)} className="mt-5 text-lg leading-relaxed text-ink-soft">
            Un pago único por el equipo y la instalación, y una mensualidad por la plataforma, los
            datos móviles y el soporte.
          </p>
        </div>

        <div className="mt-10">
          <CoverageCheck />
        </div>

        <div className="mt-12">
          <PlanCards />
        </div>

        <Guarantee className="mx-auto mt-8 max-w-3xl" />

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted">
            <ProvisionalTag>Precios provisorios</ProvisionalTag>
            Valores de referencia en CLP con IVA, cercanos al mercado. El equipo se vende con el
            plan; permanencia por definir.
          </p>
          <Link
            href="/planes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
          >
            Comparar todas las funciones
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
