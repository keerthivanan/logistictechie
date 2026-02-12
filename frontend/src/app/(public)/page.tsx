"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Ship, Globe, Zap, Shield } from "lucide-react";
import { PartnersSection } from "@/components/domain/home/Partners";
import { BentoServices } from "@/components/domain/home/BentoServices";
import { LogisticsSearchBar } from "@/components/domain/home/LogisticsSearchBar";

export default function HomePage() {
  const { t } = useLanguage();

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
            {t('audit.home.architecting')} <br />
            <span className="italic">{t('audit.home.globalVelocity')}</span>
          </h1>

          <div className="grid lg:grid-cols-2 gap-32 border-t border-white/5 pt-32">
            <div className="space-y-12">
              <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl">
                {t('home.hero.description_part1')} <strong className="text-white">{t('audit.home.transitEcosystems')}</strong> {t('home.hero.description_part2')}
              </p>

              {/* 👑 LIVE CARRIER HEALTH NODE */}
              <div className="flex gap-12 pt-8 border-t border-white/[0.02]">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-zinc-700 tracking-[0.4em] uppercase">MAERSK_NODE</span>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-black text-white uppercase italic tracking-widest">AUTHENTICATED_200</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-zinc-700 tracking-[0.4em] uppercase">GLOBAL_FLEET</span>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase italic tracking-widest">5,142_VESSELS_LIVE</span>
                  </div>
                </div>
              </div>

              {/* Functional Node - Search */}
              <div className="pt-24 border-t border-white/5">
                <LogisticsSearchBar />
              </div>
            </div>

            <div className="space-y-16">
              {[
                { id: "01", title: t('home.features.precision_title'), desc: t('home.features.precision_desc') },
                { id: "02", title: t('home.features.ai_title'), desc: t('home.features.ai_desc') }
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
            <span className="arch-label mb-12 block">{t('audit.home.approach')}</span>
            <h2 className="text-6xl font-light text-white mb-16 leading-tight">{t('audit.home.designPhilosophy').split(' ')[0]} <br />{t('audit.home.designPhilosophy').split(' ').slice(1).join(' ')}</h2>
            <div className="arch-detail-line h-48 opacity-20 hidden lg:block" />
          </div>
          <div className="grid md:grid-cols-2 gap-24">
            {[
              { title: t('company.approach.research'), desc: t('company.approach.researchDesc') },
              { title: t('company.approach.collab'), desc: t('company.approach.collabDesc') },
              { title: t('company.approach.innovation'), desc: t('company.approach.innovationDesc') },
              { title: t('company.approach.poetic'), desc: t('company.approach.poeticDesc') }
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
          <h2 className="arch-heading italic mb-24">{t('audit.home.transformSupply').split('. ')[0]}. {t('audit.home.transformSupply').split('. ').slice(1, 2)}. <br /><span className="text-white">{t('audit.home.transformSupply').split('. ').slice(2).join(' ')}</span></h2>
          <Link href="/quote">
            <button className="h-24 px-24 border border-white text-[12px] font-bold uppercase tracking-[1em] transition-all hover:bg-white hover:text-black">
              {t('pricingPage.initProtocol')}
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
