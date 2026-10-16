import type { Metadata } from "next";
import { HistoryScreen } from "@/components/instalador/history-screen";

export const metadata: Metadata = { title: "Historial" };

export default function HistorialPage() {
  return <HistoryScreen />;
}
