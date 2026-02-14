"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Ship, Globe, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnersSection } from "@/components/domain/home/Partners";
import { LogisticsSearchBar } from "@/components/domain/home/LogisticsSearchBar";
import { ActiveShipments } from "@/components/domain/home/ActiveShipments";
import { DashboardPreview } from "@/components/domain/home/DashboardPreview";
import { ServicesList } from "@/components/domain/home/ServicesList";
import { BenefitsSection } from "@/components/domain/home/BenefitsSection";
import { NewsSection } from "@/components/domain/home/NewsSection";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-hidden font-sans">
      {/* Absolute Black Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 bg-black border-b border-white/5">
        <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="text-5xl md:text-8xl font-black text-white mb-16 tracking-tighter uppercase leading-[0.9]">
              {t('home.hero.title').split(' ').map((word: string, i: number) => (
                <span key={i} className={i % 2 === 0 ? "block" : "text-white/20 italic"}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Logistics Explorer Hub - Dark High Density */}
            <div className="w-full max-w-6xl mt-8">
              <LogisticsSearchBar />
            </div>
          </motion.div>
        </div>

        {/* Tactical Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none translate-x-1/4">
          <Globe className="w-full h-full text-white" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Partners - Tactical Dark Loop */}
      <section className="border-b border-white/5 bg-black py-12">
        <div className="container max-w-[1400px] mx-auto px-6">
          <PartnersSection />
        </div>
      </section>

      {/* High-Density Body Content Sections */}
      <div className="space-y-0 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none" />

        <DashboardPreview />
        <ActiveShipments />
        <ServicesList />
        <BenefitsSection />
        <NewsSection />
      </div>

      {/* Global Expansion CTA */}
      <section className="py-48 bg-black overflow-hidden relative border-t border-white/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <Globe className="w-full h-full scale-150 text-white" />
        </div>
        <div className="container max-w-[1400px] mx-auto px-6 text-center relative z-10">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[1em] mb-12 block">GLOBAL_SYNC</span>
          <h2 className="text-5xl md:text-9xl font-black text-white mb-24 leading-[0.8] tracking-tighter uppercase">
            Initialize <br /> <span className="text-white/20 italic">Global</span> <br /> Expansion
          </h2>
          <Link href="/quote">
            <button className="h-24 px-20 bg-white text-black text-[12px] font-black uppercase tracking-[0.8em] rounded-full transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              INITIALIZE_PROTOCOL
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
