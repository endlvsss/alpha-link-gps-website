import type { Metadata } from "next";
import { AvailabilityScreen } from "@/components/instalador/availability-screen";

export const metadata: Metadata = { title: "Disponibilidad" };

export default function DisponibilidadPage() {
  return <AvailabilityScreen />;
}
