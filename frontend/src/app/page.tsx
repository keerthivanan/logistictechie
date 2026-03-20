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

export default function Home() {
  const { user } = useAuth()

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
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white">
            SHIP SMARTER. <br />
            <span className="text-white/70">MOVE FASTER.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-inter">
            CargoLink connects freight professionals with verified forwarders worldwide — real quotes, real carriers, and zero guesswork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-inter">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-inter">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link href="/demo" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white font-black rounded-xl hover:bg-white/5 transition-all flex items-center justify-center text-sm uppercase tracking-widest font-inter">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* The Shift Section */}
      <section className="py-24 bg-black border-t-0 -mt-1 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-6 font-outfit">The freight industry has changed.</h2>
              <p className="text-sm text-zinc-400 mb-6 font-inter leading-relaxed">
                Containers aren&apos;t just moving physical goods — they are generating massive streams of data.
                Legacy tools approximate this data. CargoLink acts on it in real time.
              </p>
              <p className="text-sm text-white font-medium font-inter">
                &quot;More than 90% of supply chain disruptions are predictable with the right intelligence.&quot;
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
              <h2 className="text-3xl font-black tracking-tight mb-6 font-outfit">Outperforming the industry standard.</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-inter">
                Most tools give you a map. CargoLink gives you a single platform built for precision at scale — accessing more data points, more frequently, so your strategy is built on reality, not guesswork.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Real-time Updates', desc: 'Live quote refresh and carrier availability on demand.' },
                  { icon: BarChart3, title: 'Deep Analytics', desc: 'Compare spot rates, transit times, and carrier performance side by side.' },
                  { icon: Globe, title: 'Global Coverage', desc: '150+ countries, 2,000+ verified carrier partners across all modes.' },
                  { icon: Lock, title: 'Compliance Built-in', desc: 'Automated HS code classification and customs documentation.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="bg-[#0a0a0a] p-3 rounded-xl h-fit border border-white/[0.05]">
                      <Icon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white font-inter">{title}</p>
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
          <h2 className="text-3xl font-black tracking-tight mb-12 text-center font-outfit">Everything you need to scale.</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Search, label: "Smart Search" },
              { icon: Layers, label: "Shipment Tracking" },
              { icon: Lock, label: "Secure Documents" },
              { icon: Zap, label: "Instant Quotes" },
              { icon: BarChart3, label: "Analytics" },
              { icon: Award, label: "Compliance" },
              { icon: Users, label: "Team Access" },
              { icon: Globe, label: "Global API" },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-6 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl hover:border-white/[0.15] transition-all cursor-pointer">
                <feature.icon className="w-5 h-5 text-zinc-400 mb-3" />
                <span className="text-xs font-black text-zinc-300 font-inter uppercase tracking-widest text-center">{feature.label}</span>
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
            <h2 className="text-3xl font-black mb-4 tracking-tight font-outfit">One Platform for Global Trade</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto font-inter leading-relaxed">
              Manage your entire supply chain from a single dashboard — real-time visibility, automated workflows, and predictive analytics.
            </p>
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
                <Globe className="w-3.5 h-3.5" /> Global Coverage
              </div>
              <h2 className="text-3xl font-black mb-6 tracking-tight font-outfit">Active in 100+ Major Ports</h2>
              <p className="text-sm text-zinc-400 mb-8 font-inter leading-relaxed">
                Our digital infrastructure spans every continent. From Rotterdam to Shanghai, CargoLink ensures your cargo moves with precision and speed, powered by our proprietary routing engine.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Countries Served', value: '150+' },
                  { label: 'Carrier Partners', value: '2,000+' },
                  { label: 'Weekly TEU', value: '500k' },
                  { label: 'Uptime', value: '99.99%' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black text-white mb-1 font-inter">{stat.value}</div>
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
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6 font-outfit">
            Ready to ship smarter?
          </h2>
          <p className="text-sm text-zinc-400 mb-10 max-w-xl mx-auto font-inter leading-relaxed">
            Join thousands of shippers and forwarders already using CargoLink to get instant quotes and move cargo faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-100 transition-all text-xs uppercase tracking-widest font-inter">
              Start Free Trial
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-transparent border border-white/20 text-white font-black rounded-xl hover:bg-white/5 transition-all text-xs uppercase tracking-widest font-inter">
              Talk to the Team
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
