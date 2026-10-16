// IMEI: 14 dígitos + dígito verificador Luhn.

export function luhnCheckDigit(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    let d = Number(body[body.length - 1 - i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

export function makeImei(body14: string): string {
  return body14 + luhnCheckDigit(body14);
}

export function normalizeImei(value: string): string {
  return value.replace(/\D/g, "").slice(0, 15);
}

export type ImeiProblem = "largo" | "luhn" | null;

export function imeiProblem(value: string): ImeiProblem {
  if (!/^\d{15}$/.test(value)) return "largo";
  return luhnCheckDigit(value.slice(0, 14)) === value[14] ? null : "luhn";
}

/** 862345 060112 345 → "86 234506 011234 5" en grupos legibles. */
export function formatImei(value: string): string {
  const v = normalizeImei(value);
  return [v.slice(0, 2), v.slice(2, 8), v.slice(8, 14), v.slice(14)].filter(Boolean).join(" ");
}
