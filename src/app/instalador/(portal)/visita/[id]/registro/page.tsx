import type { Metadata } from "next";
import { Suspense } from "react";
import { RegistroFlow } from "@/components/instalador/registro/registro-flow";
import { PortalSkeleton } from "@/components/instalador/ui";

export const metadata: Metadata = { title: "Registro de la visita" };

export default function RegistroPage({ params }: PageProps<"/instalador/visita/[id]/registro">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <RegistroFlow params={params} />
    </Suspense>
  );
}
