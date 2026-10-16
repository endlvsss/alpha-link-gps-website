import type { Metadata } from "next";
import { Confirmation } from "@/components/compra/confirmation";

export const metadata: Metadata = {
  title: "Compra confirmada",
};

export default function ConfirmacionPage() {
  return <Confirmation />;
}
