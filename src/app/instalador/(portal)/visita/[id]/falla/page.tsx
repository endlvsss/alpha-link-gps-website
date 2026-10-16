import type { Metadata } from "next";
import { Suspense } from "react";
import { FailureForm } from "@/components/instalador/failure-form";
import { PortalSkeleton } from "@/components/instalador/ui";

export const metadata: Metadata = { title: "Reportar instalación fallida" };

export default function FallaPage({ params }: PageProps<"/instalador/visita/[id]/falla">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <FailureForm params={params} />
    </Suspense>
  );
}
