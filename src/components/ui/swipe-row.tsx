"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fila deslizable solo en pantallas angostas: scroll horizontal nativo con imán,
 * la tarjeta siguiente asomando y puntos para saber dónde estás. Desde `lg` los
 * hijos vuelven a la grilla del padre (display: contents) y los puntos se ocultan.
 */
export function SwipeRow({ label, children }: { label: string; children: ReactNode }) {
  const items = Children.toArray(children);
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const slides = [...root.children] as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(slides.indexOf(entry.target as HTMLElement));
        }
      },
      { root, threshold: 0.6 },
    );
    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  function go(i: number) {
    const slide = scroller.current?.children[i] as HTMLElement | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    slide?.scrollIntoView({ inline: "start", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <>
      <div
        ref={scroller}
        role="region"
        data-reveal-group
        aria-label={label}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:contents [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div key={i} className="flex w-[85%] max-w-sm shrink-0 snap-start *:w-full lg:contents">
            {child}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-1 lg:hidden">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir a la tarjeta ${i + 1} de ${items.length}`}
            aria-current={i === active ? "true" : undefined}
            className="flex size-6 items-center justify-center"
          >
            <span
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${i === active ? "w-5 bg-brand" : "w-1.5 bg-line-strong"}`}
            />
          </button>
        ))}
      </div>
    </>
  );
}
