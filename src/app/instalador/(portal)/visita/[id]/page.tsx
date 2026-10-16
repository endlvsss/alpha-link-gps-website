import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalSkeleton } from "@/components/instalador/ui";
import { VisitDetail } from "@/components/instalador/visit-detail";

export const metadata: Metadata = { title: "Visita" };

export default function VisitaPage({ params }: PageProps<"/instalador/visita/[id]">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <VisitDetail params={params} />
    </Suspense>
  );
}
