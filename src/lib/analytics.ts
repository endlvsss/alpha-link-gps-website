// Eventos del embudo del Service Blueprint (visita → plan → checkout → pago → agenda).
// No carga ningún script de terceros: deja los eventos en window.dataLayer para que
// Google Tag Manager, GA4 o el píxel de Meta los lean cuando el equipo elija la
// herramienta y se publique el aviso de cookies. En desarrollo se ven en la consola.

export type FunnelEvent =
  | "cta_ver_planes"
  | "comuna_consultada"
  | "elegir_plan"
  | "checkout_paso"
  | "pago_iniciado"
  | "pago_resultado"
  | "agenda_reservada"
  | "lista_espera"
  | "whatsapp_click";

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: FunnelEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  if (process.env.NODE_ENV === "development") {
    console.debug("[embudo]", event, params);
  }
}
