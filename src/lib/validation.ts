import { isValidRut } from "./rut";

export type Validator = (value: string) => string | null;

export const required =
  (message: string): Validator =>
  (value) =>
    value.trim() ? null : message;

export const validateName: Validator = (value) => {
  const v = value.trim();
  if (!v) return "Escribe tu nombre y apellido.";
  if (v.split(/\s+/).length < 2) return "Incluye al menos un apellido.";
  return null;
};

export const validateRut: Validator = (value) => {
  if (!value.trim()) return "Escribe tu RUT.";
  return isValidRut(value) ? null : "Revisa el RUT: el dígito verificador no coincide.";
};

export const validateEmail: Validator = (value) => {
  const v = value.trim();
  if (!v) return "Escribe tu correo.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "Revisa el correo, por ejemplo nombre@correo.cl.";
};

/** Celular chileno: 9 dígitos que parten con 9. */
export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("56")) digits = digits.slice(2);
  return digits.slice(0, 9);
}

export function formatPhone(value: string): string {
  const d = normalizePhone(value);
  return [d.slice(0, 1), d.slice(1, 5), d.slice(5, 9)].filter(Boolean).join(" ");
}

export const validatePhone: Validator = (value) => {
  const d = normalizePhone(value);
  if (!d) return "Escribe tu celular.";
  return /^9\d{8}$/.test(d) ? null : "Debe tener 9 dígitos y partir con 9.";
};

/** Patente chilena: BBBB12 (actual) o AB1234 (antigua). */
export function normalizePatente(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

export function formatPatente(value: string): string {
  const p = normalizePatente(value);
  if (p.length < 6) return p;
  return `${p.slice(0, 2)}·${p.slice(2, 4)}·${p.slice(4, 6)}`;
}

export const validatePatente: Validator = (value) => {
  const p = normalizePatente(value);
  if (!p) return "Escribe la patente.";
  return /^[A-Z]{4}\d{2}$/.test(p) || /^[A-Z]{2}\d{4}$/.test(p)
    ? null
    : "Usa el formato BBBB12 o AB1234.";
};

export function validateYear(value: string, currentYear: number): string | null {
  if (!value.trim()) return "Escribe el año.";
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1990 || year > currentYear + 1) {
    return `Debe estar entre 1990 y ${currentYear + 1}.`;
  }
  return null;
}
