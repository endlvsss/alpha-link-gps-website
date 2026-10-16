"use client";

import { useEffect } from "react";

/**
 * Activa las entradas de la landing: cada elemento con data-reveal recibe
 * data-shown al entrar en pantalla (una sola vez). El escalonado sale de --i.
 */
export function RevealObserver() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // En una fila deslizable, las tarjetas fuera de pantalla entran junto con la visible.
          const group = entry.target.closest("[data-reveal-group]");
          const targets = group ? group.querySelectorAll<HTMLElement>("[data-reveal]") : [entry.target];
          for (const el of targets) {
            el.setAttribute("data-shown", "");
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
