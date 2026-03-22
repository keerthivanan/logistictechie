'use client';

import Link from 'next/link'
import { Globe, ArrowRight, Zap, BarChart3, Users, Award, Search, Lock, Layers } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Prism from '@/components/visuals/Prism'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import GlobalNetworkMap from '@/components/visuals/GlobalNetworkMap'
import SmartDashboardPreview from '@/components/visuals/SmartDashboardPreview'
import SolutionsGrid from '@/components/visuals/SolutionsGrid'
import IntegrationEcosystem from '@/components/visuals/IntegrationEcosystem'
import TrustedIndustries from '@/components/visuals/TrustedIndustries'
import AiChatVisual from '@/components/visuals/AiChatVisual'
import ComparisonChart from '@/components/visuals/ComparisonChart'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/lib/i18n/t'

export default function Home() {
  const { user } = useAuth()
  const t = useT()

  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen pointer-events-none">
          <Prism />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 text-white">
            {t('hero.line1')} <br />
            <span className="text-white/70">{t('hero.line2')}</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-inter">
            {t('hero.sub')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-inter">
                {t('hero.cta.dashboard')} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-inter">
                {t('hero.cta.start')} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link href="/marketplace" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all flex items-center justify-center text-sm uppercase tracking-widest font-inter">
              {t('hero.cta.marketplace')}
            </Link>
          </div>
        </div>
      </section>

      {/* The Shift Section */}
      <section className="py-24 bg-black border-t-0 -mt-1 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight mb-6 font-outfit">{t('home.shift.title')}</h2>
              <p className="text-sm text-zinc-400 mb-6 font-inter leading-relaxed">
                {t('home.shift.p1')}
              </p>
              <p className="text-sm text-white font-medium font-inter">
                {t('home.shift.quote')}
              </p>
            </div>
            <div className="relative">
              <AiChatVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <ComparisonChart />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-semibold tracking-tight mb-6 font-outfit">{t('home.compare.title')}</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-inter">{t('home.compare.sub')}</p>

              <div className="space-y-6">
                {[
                  { icon: Zap, title: t('home.feat1.title'), desc: t('home.feat1.desc') },
                  { icon: BarChart3, title: t('home.feat2.title'), desc: t('home.feat2.desc') },
                  { icon: Globe, title: t('home.feat3.title'), desc: t('home.feat3.desc') },
                  { icon: Lock, title: t('home.feat4.title'), desc: t('home.feat4.desc') },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="bg-[#0a0a0a] p-3 rounded-xl h-fit border border-white/[0.05]">
                      <Icon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white font-inter">{title}</p>
                      <p className="text-xs text-zinc-500 font-inter mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight mb-12 text-center font-outfit">{t('home.scale.title')}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Search, label: t('home.scale.smart.search') },
              { icon: Layers, label: t('home.scale.tracking') },
              { icon: Lock, label: t('home.scale.docs') },
              { icon: Zap, label: t('home.scale.quotes') },
              { icon: BarChart3, label: t('home.scale.analytics') },
              { icon: Award, label: t('home.scale.compliance') },
              { icon: Users, label: t('home.scale.team') },
              { icon: Globe, label: t('home.scale.api') },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-6 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl hover:border-white/[0.15] transition-all cursor-pointer">
                <feature.icon className="w-5 h-5 text-zinc-400 mb-3" />
                <span className="text-xs font-semibold text-zinc-300 font-inter uppercase tracking-widest text-center">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustedIndustries />

      {/* Smart Dashboard Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 tracking-tight font-outfit">{t('home.platform.title')}</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto font-inter leading-relaxed">{t('home.platform.sub')}</p>
          </div>
          <SmartDashboardPreview />
        </div>
      </section>

      <IntegrationEcosystem />

      <SolutionsGrid />

      {/* Global Network Section */}
      <section className="py-32 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-xs font-inter mb-6">
                <Globe className="w-3.5 h-3.5" /> {t('home.network.badge')}
              </div>
              <h2 className="text-3xl font-semibold mb-6 tracking-tight font-outfit">{t('home.network.title')}</h2>
              <p className="text-sm text-zinc-400 mb-8 font-inter leading-relaxed">{t('home.network.sub')}</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: t('home.network.stat1'), value: '150+' },
                  { label: t('home.network.stat2'), value: '2,000+' },
                  { label: t('home.network.stat3'), value: '500k' },
                  { label: t('home.network.stat4'), value: '99.99%' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-semibold text-white mb-1 font-inter">{stat.value}</div>
                    <div className="text-xs text-zinc-600 font-inter uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <GlobalNetworkMap />
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6 font-outfit">{t('home.cta.title')}</h2>
          <p className="text-sm text-zinc-400 mb-10 max-w-xl mx-auto font-inter leading-relaxed">{t('home.cta.sub')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-all text-xs uppercase tracking-widest font-inter">
              {t('home.cta.start')}
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest font-inter">
              {t('home.cta.contact')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
