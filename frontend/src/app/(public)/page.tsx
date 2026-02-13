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
      <section className="container max-w-[1400px] mx-auto px-8 arch-section-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="arch-label">{t('home.hero.label')}</span>
          <h1 className="arch-heading max-w-5xl">
            {t('audit.home.architecting')} <br />
            <span className="italic">{t('audit.home.globalVelocity')}</span>
          </h1>

          <div className="grid lg:grid-cols-2 gap-16 border-t border-white/5 pt-16">
            <div className="space-y-8">
              <p className="text-2xl font-light text-zinc-400 leading-tight max-w-lg">
                {t('home.hero.description_part1')} <strong className="text-white">{t('audit.home.transitEcosystems')}</strong> {t('home.hero.description_part2')}
              </p>

              {/* LIVE CARRIER HEALTH NODE */}
              <div className="flex gap-8 pt-6 border-t border-white/[0.02]">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-zinc-700 tracking-[0.4em] uppercase">{t('home.hero.maerskNode')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase italic tracking-widest">{t('home.hero.authenticated')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-zinc-700 tracking-[0.4em] uppercase">{t('home.hero.globalFleet')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase italic tracking-widest">{t('home.hero.vesselsLive')}</span>
                  </div>
                </div>
              </div>

              {/* Functional Node - Search */}
              <div className="pt-16 border-t border-white/5">
                <LogisticsSearchBar />
              </div>
            </div>

            <div className="space-y-12">
              {[
                { id: "01", title: t('home.features.precision_title'), desc: t('home.features.precision_desc') },
                { id: "02", title: t('home.features.ai_title'), desc: t('home.features.ai_desc') }
              ].map((feature) => (
                <div key={feature.id} className="flex gap-6">
                  <span className="arch-number">{feature.id}</span>
                  <div className="arch-detail-line">
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm max-w-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partners - Minimalist Loop */}
      <section className="border-y border-white/5 py-12">
        <div className="container max-w-[1400px] mx-auto px-8">
          <span className="arch-label mb-8 block text-center">{t('home.partners.label')}</span>
          <PartnersSection />
        </div>
      </section>

      {/* Infrastructure Node - Bento Grid */}
      <section className="border-t border-white/5 py-24">
        <div className="container max-w-[1400px] mx-auto px-8">
          <BentoServices />
        </div>
      </section>
      <section className="container max-w-[1400px] mx-auto px-8 arch-section">
        <div className="grid lg:grid-cols-[1fr,2fr] gap-16 border-b border-white/5 pb-24">
          <div>
            <span className="arch-label">{t('audit.home.approach')}</span>
            <h2 className="text-5xl font-light text-white mb-12 leading-tight">{t('audit.home.designPhilosophy').split(' ')[0]} <br />{t('audit.home.designPhilosophy').split(' ').slice(1).join(' ')}</h2>
            <div className="arch-detail-line h-32 opacity-20 hidden lg:block" />
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: t('company.approach.research'), desc: t('company.approach.researchDesc') },
              { title: t('company.approach.collab'), desc: t('company.approach.collabDesc') },
              { title: t('company.approach.innovation'), desc: t('company.approach.innovationDesc') },
              { title: t('company.approach.poetic'), desc: t('company.approach.poeticDesc') }
            ].map((item, idx) => (
              <div key={idx} className="arch-detail-line">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-48 bg-zinc-950/20">
        <div className="container max-w-[1400px] mx-auto px-8 text-center">
          <span className="arch-label">{t('home.cta.label')}</span>
          <h2 className="arch-heading italic mb-16">{t('audit.home.transformSupply').split('. ')[0]}. {t('audit.home.transformSupply').split('. ').slice(1, 2)}. <br /><span className="text-white">{t('audit.home.transformSupply').split('. ').slice(2).join(' ')}</span></h2>
          <Link href="/quote">
            <button className="h-20 px-16 border border-white text-[10px] font-bold uppercase tracking-[0.8em] transition-all hover:bg-white hover:text-black">
              {t('pricingPage.initProtocol')}
            </button>
          </Link>
        </div>
      </section>

      {/* Technical Sub-footer */}
      <div className="border-t border-white/5 py-24 bg-black">
        <div className="container max-w-[1400px] mx-auto px-8 grid md:grid-cols-3 gap-12">
          <div>
            <span className="arch-label mb-4 block">{t('home.status.label')}</span>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold tracking-[0.4em] text-emerald-500 uppercase">{t('home.status.operational')}</span>
            </div>
          </div>
          <div>
            <span className="arch-label mb-4 block">{t('home.info.label')}</span>
            <p className="text-[9px] font-bold tracking-[0.2em] text-zinc-800 uppercase leading-loose">
              {t('home.info.practice')}<br />
              {t('home.info.hub')}<br />
              {t('home.info.location')}
            </p>
          </div>
          <div>
            <span className="arch-label mb-4 block">VERSION</span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-zinc-900 uppercase">V4.1.0_LATEST</span>
          </div>
        </div>
      </div>
    </main >
  );
}
