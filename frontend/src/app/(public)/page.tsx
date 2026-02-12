"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Ship, Globe, Zap, Shield } from "lucide-react";
import { PartnersSection } from "@/components/domain/home/Partners";
import { BentoServices } from "@/components/domain/home/BentoServices";
import { LogisticsSearchBar } from "@/components/domain/home/LogisticsSearchBar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">

      {/* Architectural Hero */}
      <section className="container max-w-[1400px] mx-auto px-8 pt-64 pb-48">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="arch-label mb-12 block">GLOBAL_LOGISTICS</span>
          <h1 className="arch-heading mb-24 max-w-6xl">
            Architecting <br />
            <span className="italic">Global Velocity</span>
          </h1>

          <div className="grid lg:grid-cols-2 gap-32 border-t border-white/5 pt-32">
            <div className="space-y-12">
              <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl">
                We design functional <strong className="text-white">transit ecosystems</strong> that enhance the human experience while respecting the natural environment.
              </p>

              {/* Functional Node - Search */}
              <div className="pt-24 border-t border-white/5">
                <LogisticsSearchBar />
              </div>
            </div>

            <div className="space-y-16">
              {[
                { id: "01", title: "Structural Precision", desc: "Military-grade logistics engineered for the modern epoch." },
                { id: "02", title: "Neural Sync", desc: "Real-time AI orchestration across 4,000+ global nodes." }
              ].map((feature) => (
                <div key={feature.id} className="flex gap-8">
                  <span className="arch-number">{feature.id}</span>
                  <div className="arch-detail-line">
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-500 max-w-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partners - Minimalist Loop */}
      <section className="border-y border-white/5 py-32">
        <div className="container max-w-[1400px] mx-auto px-8">
          <span className="arch-label mb-16 block text-center">TRUSTED_BY_ARCHITECTURE_STUDIOS</span>
          <PartnersSection />
        </div>
      </section>

      {/* Infrastructure Node - Bento Grid */}
      <section className="border-t border-white/5 pt-32">
        <div className="container max-w-[1400px] mx-auto px-8">
          <BentoServices />
        </div>
      </section>
      <section className="container max-w-[1400px] mx-auto px-8 py-64">
        <div className="grid lg:grid-cols-[1fr,2fr] gap-32 border-b border-white/5 pb-64">
          <div>
            <span className="arch-label mb-12 block">APPROACH</span>
            <h2 className="text-6xl font-light text-white mb-16 leading-tight">Design <br />Philosophy</h2>
            <div className="arch-detail-line h-48 opacity-20 hidden lg:block" />
          </div>
          <div className="grid md:grid-cols-2 gap-24">
            {[
              { title: "Research", desc: "Deep understanding of context, culture, and climate in global supply chains." },
              { title: "Collaboration", desc: "Close partnership with carriers, customs, and logistics craftspeople." },
              { title: "Innovation", desc: "Autonomous materials and forward-thinking route design solutions." },
              { title: "Poetic Logistics", desc: "Transit flows that are both functional and aesthetic masterpieces." }
            ].map((item, idx) => (
              <div key={idx} className="arch-detail-line">
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-96 bg-zinc-950/20">
        <div className="container max-w-[1400px] mx-auto px-8 text-center">
          <span className="arch-label mb-12 block">THE_FINAL_NODE</span>
          <h2 className="arch-heading italic mb-24">Transform. Your. <br /><span className="text-white">Supply Chain.</span></h2>
          <Link href="/quote">
            <button className="h-24 px-24 border border-white text-[12px] font-bold uppercase tracking-[1em] transition-all hover:bg-white hover:text-black">
              INITIALIZE_PROTOCOL
            </button>
          </Link>
        </div>
      </section>

      {/* Technical Sub-footer */}
      <div className="border-t border-white/5 py-48 bg-black">
        <div className="container max-w-[1400px] mx-auto px-8 grid md:grid-cols-3 gap-16">
          <div>
            <span className="arch-label mb-8 block">STATUS</span>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-emerald-500 uppercase">OPERATIONAL_STABLE</span>
            </div>
          </div>
          <div>
            <span className="arch-label mb-8 block">FIRM_INFO</span>
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-800 uppercase leading-loose">
              Phoenix OS Logistics Practice<br />
              Strategic Operations Hub<br />
              NEOM, SAUDI ARABIA
            </p>
          </div>
          <div>
            <span className="arch-label mb-8 block">VERSION</span>
            <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-900 uppercase">V4.1.0_LATEST</span>
          </div>
        </div>
      </div>
    </main >
  );
}
