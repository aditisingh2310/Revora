"use client";

import { MonochromeCursor } from "../vfx/MonochromeCursor";
import { GridBackground } from "../vfx/GridBackground";
import { FloatingControls } from "../vfx/FloatingControls";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { LogoCloud } from "./LogoCloud";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { ProductShowcase } from "./ProductShowcase";
import { Stats } from "./Stats";
import { Testimonials } from "./Testimonials";
import { CTA } from "./CTA";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#000000] text-white selection:bg-white selection:text-black antialiased">
      <MonochromeCursor />
      <GridBackground />
      <FloatingControls />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <LogoCloud />
        <Features />
        <HowItWorks />
        <ProductShowcase />
        <Stats />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
