"use client";

import { Hero } from "@/components/domain/home/Hero";
import { PartnersSection } from "@/components/domain/home/Partners";

import { FeaturesSection } from "@/components/domain/home/Features";
import { BentoServices } from "@/components/domain/home/BentoServices";
import { TestimonialsSection } from "@/components/domain/home/Testimonials";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <PartnersSection />
      <FeaturesSection />
      <BentoServices />
      <TestimonialsSection />
    </main>
  );
}

