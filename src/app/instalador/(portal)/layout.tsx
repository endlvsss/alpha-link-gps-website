import type { Metadata } from "next";
import { PortalShell } from "@/components/instalador/portal-shell";

export const metadata: Metadata = {
  title: { default: "Portal técnicos", template: "%s · Portal técnicos" },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
