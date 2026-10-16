import type { Metadata } from "next";
import { TodayScreen } from "@/components/instalador/today-screen";

export const metadata: Metadata = { title: "Hoy" };

export default function InstaladorHoyPage() {
  return <TodayScreen />;
}
