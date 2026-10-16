import type { Metadata } from "next";
import { AgendaScreen } from "@/components/instalador/agenda-screen";

export const metadata: Metadata = { title: "Mi agenda" };

export default function AgendaInstaladorPage() {
  return <AgendaScreen />;
}
