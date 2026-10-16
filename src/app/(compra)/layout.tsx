import { CheckoutHeader } from "@/components/compra/checkout-header";
import { DemoPanel } from "@/components/compra/demo-panel";

export default function CompraLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CheckoutHeader />
      <main id="contenido" className="min-h-[calc(100dvh-4rem)]">
        {children}
        <DemoPanel />
      </main>
    </>
  );
}
