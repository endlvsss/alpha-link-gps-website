"use client";

import type { ComponentProps, ReactNode } from "react";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";

const inputBase =
  "block h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-base text-ink " +
  "placeholder:text-muted/70 outline-none transition-[border-color,box-shadow] duration-150 " +
  "focus:border-brand focus:ring-4 focus:ring-ring/20 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/20";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  className?: string;
  children: (describedBy: string | undefined) => ReactNode;
}

/** Etiqueta, ayuda y error conectados al control con aria-describedby. */
export function Field({ id, label, hint, error, optional, className = "", children }: FieldProps) {
  const hintId = hint ? `${id}-ayuda` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Opcional</span>}
      </label>
      <div className="mt-1.5">{children(describedBy)}</div>
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-1.5 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type InputProps = ComponentProps<"input"> & { invalid?: boolean };

export function TextInput({ invalid, className = "", ...props }: InputProps) {
  return <input aria-invalid={invalid || undefined} className={`${inputBase} ${className}`} {...props} />;
}

type SelectProps = ComponentProps<"select"> & { invalid?: boolean };

export function Select({ invalid, className = "", children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={`${inputBase} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%235a6a6e%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27/%3E%3C/svg%3E")] bg-[length:1.1rem] bg-[right_0.9rem_center] bg-no-repeat pr-10 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

type TextareaProps = ComponentProps<"textarea">;

export function TextArea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`${inputBase} h-auto min-h-24 py-3 leading-relaxed ${className}`}
      {...props}
    />
  );
}

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  error?: string | null;
}

export function Checkbox({ id, checked, onChange, children, error }: CheckboxProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-base leading-relaxed text-ink-soft">
        <span className="relative mt-0.5 flex size-5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className="peer size-5 cursor-pointer appearance-none rounded-md border border-line-strong bg-surface transition-colors checked:border-brand checked:bg-brand aria-[invalid=true]:border-danger"
          />
          <CheckIcon className="pointer-events-none absolute inset-0.5 size-4 text-on-brand opacity-0 peer-checked:opacity-100" />
        </span>
        <span>{children}</span>
      </label>
      {error && (
        <p id={errorId} className="mt-1.5 ml-8 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
