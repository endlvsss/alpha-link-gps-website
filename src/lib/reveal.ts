import type { CSSProperties } from "react";

/**
 * Atributos para que un elemento entre en orden `i` dentro de su sección
 * (lo activa RevealObserver). Funciona en componentes de servidor y de cliente.
 */
export function reveal(i = 0) {
  return { "data-reveal": "", style: { "--i": i } as CSSProperties };
}
