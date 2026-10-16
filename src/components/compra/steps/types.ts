import type { Purchase } from "@/lib/purchase-store";

export type FieldErrors = Record<string, string>;

export interface StepProps {
  p: Purchase;
  errors: FieldErrors;
  /** Revalida un campo (al salir de él, o al escribir si ya tenía error). */
  revalidate: (field: string) => void;
}
