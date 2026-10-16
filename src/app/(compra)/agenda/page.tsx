import type { Metadata } from "next";
import { Scheduler } from "@/components/agenda/scheduler";

export const metadata: Metadata = {
  title: "Agenda tu instalación",
};

export default function AgendaPage() {
  return <Scheduler />;
}
