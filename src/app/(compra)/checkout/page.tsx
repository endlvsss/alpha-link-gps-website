import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/compra/checkout-flow";

export const metadata: Metadata = {
  title: "Contratar",
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
