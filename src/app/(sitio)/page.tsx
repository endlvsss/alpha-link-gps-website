import { DoubleSignal } from "@/components/landing/double-signal";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Installation } from "@/components/landing/installation";
import { NightTimeline } from "@/components/landing/night-timeline";
import { PlansSection } from "@/components/landing/plans-section";
import { RevealObserver } from "@/components/landing/reveal-observer";
import { StickyCta } from "@/components/landing/sticky-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <NightTimeline />
      <Features />
      <DoubleSignal />
      <HowItWorks />
      <PlansSection />
      <Installation />
      <Faq />
      <FinalCta />
      <StickyCta />
      <RevealObserver />
    </>
  );
}
