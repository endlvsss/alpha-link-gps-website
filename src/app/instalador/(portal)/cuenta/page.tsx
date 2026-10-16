import type { Metadata } from "next";
import { AccountScreen } from "@/components/instalador/account-screen";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function CuentaPage() {
  return <AccountScreen />;
}
