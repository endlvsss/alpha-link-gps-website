"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { clp } from "@/lib/format";
import { plans } from "@/lib/plans";

const fromPrice = Math.min(...plans.map((p) => p.monthly));

// Mientras alguna de estas zonas esté en pantalla, la barra se oculta: ya hay un
// botón de compra a la vista (portada, planes, cierre) o se terminó la página.
const ZONES = ["#inicio", "#planes", "#cierre", "footer"];

/** Barra de compra fija en el celular, para no perder el botón durante el recorrido. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const zones = ZONES.map((s) => document.querySelector(s)).filter((el): el is Element => el !== null);
    const inView = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target);
        else inView.delete(e.target);
      }
      setVisible(inView.size === 0);
    });
    zones.forEach((z) => observer.observe(z));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[translate,opacity] duration-300 ease-out-quart sm:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm leading-tight text-ink-soft">
          Desde <span className="font-display text-base font-bold text-ink">{clp(fromPrice)}</span>/mes
          <span className="block text-xs text-muted">Instalación a domicilio · RM</span>
        </p>
        <Link
          href="#planes"
          onClick={() => track("cta_ver_planes", { origen: "barra_movil" })}
          className={buttonClasses("primary", "md", "shrink-0")}
        >
          Ver planes
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
