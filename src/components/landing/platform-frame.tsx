import Image, { type StaticImageData } from "next/image";
import { LockIcon } from "@/components/ui/icons";

interface PlatformFrameProps {
  light: StaticImageData;
  dark?: StaticImageData;
  alt: string;
  caption?: string;
  sizes: string;
  eager?: boolean;
  className?: string;
}

/**
 * Marco de "ventana" para las capturas de la plataforma. Si hay versión
 * oscura, cada tema muestra la suya (la otra queda oculta y no se descarga).
 */
export function PlatformFrame({
  light,
  dark,
  alt,
  caption = "Panel Alpha Link GPS",
  sizes,
  eager = false,
  className = "",
}: PlatformFrameProps) {
  return (
    <div data-ui className={`overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-float ${className}`}>
      <div className="flex h-8 items-center gap-2 px-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong/70" />
          <span className="size-2.5 rounded-full bg-line-strong/50" />
        </span>
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-0.5 text-xs text-muted">
          <LockIcon className="size-3" />
          {caption}
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-line/80">
        <Image
          src={light}
          alt={alt}
          sizes={sizes}
          placeholder="blur"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className={`block h-auto w-full ${dark ? "dark:hidden" : ""}`}
        />
        {dark && (
          <Image
            src={dark}
            alt={alt}
            sizes={sizes}
            placeholder="blur"
            className="hidden h-auto w-full dark:block"
          />
        )}
      </div>
    </div>
  );
}
