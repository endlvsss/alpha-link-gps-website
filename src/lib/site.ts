// Datos de contacto y cobertura. Todo lo marcado como provisorio debe
// reemplazarse con los datos reales antes de publicar.
export const site = {
  name: "Alpha Link GPS",
  company: "Alpha Tecnología",
  tagline: "Tu vehículo, siempre a la vista.",
  coverage: "Región Metropolitana",
  whatsapp: {
    display: "+56 9 0000 0000",
    href: "https://wa.me/56900000000",
    provisional: true,
  },
  email: {
    display: "hola@alphalinkgps.cl",
    provisional: true,
  },
  corporateUrl: "https://alphatecnologia.cl",
  /** Propuesta de garantía para reducir el riesgo de pagar antes de instalar. POR APROBAR. */
  guarantee: {
    title: "Si no podemos instalar, te devolvemos todo",
    body: "Si un técnico no puede instalar el equipo en tu vehículo o en tu dirección, te devolvemos el 100% de lo pagado.",
    provisional: true,
  },
  /** Ficha técnica del GPS VL103M (manual del fabricante). */
  device: {
    reportSeconds: 10,
  },
} as const;

export const nav = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#funciones", label: "Funciones" },
  { href: "/#doble-senal", label: "Dos señales" },
  { href: "/#planes", label: "Planes" },
  { href: "/#preguntas", label: "Preguntas" },
] as const;
