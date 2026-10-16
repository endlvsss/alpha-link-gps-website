"use client";

import type { ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/button";
import { track, type FunnelEvent } from "@/lib/analytics";

type Props = ComponentProps<typeof ButtonLink> & {
  event: FunnelEvent;
  params?: Record<string, string>;
};

/** Botón-enlace que registra un evento del embudo al hacer clic. */
export function TrackedButtonLink({ event, params, onClick, ...props }: Props) {
  return (
    <ButtonLink
      {...props}
      onClick={(e) => {
        track(event, params);
        onClick?.(e);
      }}
    />
  );
}

type AnchorProps = ComponentProps<"a"> & {
  event: FunnelEvent;
  params?: Record<string, string>;
};

/** Enlace externo (WhatsApp, por ejemplo) que registra un evento del embudo. */
export function TrackedAnchor({ event, params, onClick, ...props }: AnchorProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, params);
        onClick?.(e);
      }}
    />
  );
}
