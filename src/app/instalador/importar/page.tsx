import type { Metadata } from "next";
import { ImportScreen } from "@/components/instalador/import-screen";

export const metadata: Metadata = { title: "Visita desde el CRM · Portal técnicos" };

export default function ImportarPage() {
  return <ImportScreen />;
}
