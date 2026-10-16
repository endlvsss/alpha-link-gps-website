import { ArrowRightIcon, ChatIcon } from "@/components/ui/icons";
import { reveal } from "@/lib/reveal";
import { site } from "@/lib/site";
import { TrackedAnchor, TrackedButtonLink } from "./tracked-link";

export function FinalCta() {
  return (
    <section id="cierre" aria-labelledby="cta-titulo" className="px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-deep px-6 py-14 text-on-deep sm:px-12 sm:py-16">
        <h2
          id="cta-titulo"
          {...reveal(0)}
          className="max-w-2xl font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance sm:text-5xl"
        >
          Contrata y agenda en minutos.
        </h2>
        <p className="mt-5 max-w-xl text-lg text-on-deep-muted">
          Pagas online, eliges un horario real y un técnico llega a tu puerta.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <TrackedButtonLink href="#planes" variant="inverse" size="lg" event="cta_ver_planes" params={{ origen: "cierre" }}>
            Elegir mi plan
            <ArrowRightIcon className="size-4" />
          </TrackedButtonLink>
          <TrackedAnchor
            event="whatsapp_click"
            params={{ origen: "cierre" }}
            href={site.whatsapp.href}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-6 text-base font-medium text-on-deep transition-colors duration-150 hover:bg-white/10"
          >
            <ChatIcon className="size-5" />
            Tengo una duda
          </TrackedAnchor>
        </div>
      </div>
    </section>
  );
}
