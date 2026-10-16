import type { Metadata } from "next";
import { PaymentSimulator } from "@/components/compra/payment-simulator";

export const metadata: Metadata = {
  title: "Pago",
};

export default function PagoPage() {
  return <PaymentSimulator />;
}
