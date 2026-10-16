import type { Metadata } from "next";
import { LoginForm } from "@/components/instalador/login-form";

export const metadata: Metadata = { title: "Ingreso · Portal técnicos" };

export default function IngresoPage() {
  return <LoginForm />;
}
