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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Global Network Prism Visual - Main Background */}
        <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen pointer-events-none">
          <Prism />
        </div>

        {/* Cinematic Gradient Blend To Body */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 animate-fade-in-up delay-100">
            SUPERCHARGE YOUR <br />
            <span className="text-white">SUPPLY CHAIN</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Built for data-obsessed shippers. CargoLink is the only platform that unifies traditional freight forwarding with next-generation AI intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                Launch Operations <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <Link href="/demo" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center text-sm">
              View Tactical Simulation
            </Link>
          </div>
        </div>
      </section>

      {/* The Shift Section */}
      <section className="py-24 bg-black border-t-0 -mt-1 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-6">The logistics landscape has shifted.</h2>
              <p className="text-lg text-gray-400 mb-6">
                Containers aren&apos;t just moving physical goods; they are generating massive streams of data.
                Legacy tools approximate this data to save costs.
              </p>
              <p className="text-lg text-white font-medium">
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
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Outperforming the industry standard.</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Most tools give you a map. We give you a command center.
                CargoLink is engineered for precision at infinite scale. We access more data points more frequently, ensuring your strategy is built on reality, not guesswork.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-zinc-900 p-3 rounded-lg h-fit border border-white/10">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Real-time Updates</h4>
                    <p className="text-sm text-gray-400">Refresh critical keywords on demand, instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight mb-16 text-center">Everything you need to scale.</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Search, label: "Smart Search" },
              { icon: Layers, label: "Stack Tracking" },
              { icon: Lock, label: "Secure Vault" },
              { icon: Zap, label: "Instant Quotes" },
              { icon: BarChart3, label: "Deep Analytics" },
              { icon: Award, label: "Compliance" },
              { icon: Users, label: "Team Access" },
              { icon: Globe, label: "API Global" },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-8 bg-black border border-white/10 rounded-xl hover:border-white/30 transition-all cursor-crosshair">
                <feature.icon className="w-8 h-8 text-white mb-4" />
                <span className="font-bold text-gray-300">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustedIndustries />

      {/* Smart Dashboard Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">The Operating System for Global Trade</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Command your entire supply chain from a single, beautiful interface. Real-time visibility, automated workflows, and predictive analytics.
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <Globe className="w-4 h-4" /> Global Coverage
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Active in 100+ Major Ports</h2>
              <p className="text-lg text-gray-400 mb-8">
                Our digital infrastructure spans every continent. From Rotterdam to Shanghai, CargoLink ensures your cargo moves with precision and speed, powered by our proprietary routing algorithms.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Countries Served', value: '150+' },
                  { label: 'Carrier Partners', value: '2,000+' },
                  { label: 'Weekly Teu', value: '500k' },
                  { label: 'Uptime', value: '99.99%' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
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
        <div className="absolute inset-0"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Ready to dominate the <br /> new logistics landscape?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Join 2,000+ forward-thinking teams orchestrating their global trade across the CargoLink Network today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-10 py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-gray-200 transition-all">
              Start Free Trial
            </Link>
            <Link href="/contact" className="px-10 py-5 bg-transparent border border-white/30 text-white text-xl font-bold rounded-full hover:bg-white/10 transition-all">
              Talk to Specialist
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
