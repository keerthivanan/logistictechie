'use client'

import Navbar from '@/components/layout/Navbar'
import { Globe, Cpu, ShieldCheck } from 'lucide-react'

const pillars = [
    {
        icon: Globe,
        title: 'One Platform, Every Trade Lane',
        desc: 'We connect shippers, verified freight forwarders, and carriers across 195 countries from a single dashboard — no brokers, no cold calls, no back-and-forth emails.',
    },
    {
        icon: Cpu,
        title: 'Quotes in Seconds, Not Days',
        desc: 'Our AI engine surfaces real quotes from vetted forwarders instantly. Compare rates, transit times, and carrier reliability — then book with one click.',
    },
    {
        icon: ShieldCheck,
        title: 'Every Forwarder is Verified',
        desc: 'We verify every freight forwarder on the platform — business registration, licensing, and track record. You only see partners you can trust.',
    },
]

const timeline = [
    {
        year: '2024',
        title: 'Founded to Fix Freight',
        desc: 'CargoLink was built because international freight was broken — opaque pricing, unverified middlemen, and paperwork that took days. We set out to change that.',
    },
    {
        year: '2025',
        title: 'Verified Forwarder Network',
        desc: 'Onboarded 100+ verified freight forwarders across all major global trade lanes — Asia-Pacific, Europe, Middle East, and the Americas.',
    },
    {
        year: '2026',
        title: 'Global Real-Time Coverage',
        desc: 'Today, shippers and forwarders across 195 countries use CargoLink to get instant quotes, track shipments, and move cargo — in real time.',
    },
]

const stats = [
    { value: '195', label: 'Countries Covered' },
    { value: '100+', label: 'Verified Forwarders' },
    { value: '< 10s', label: 'Quote Generation' },
    { value: '24/7', label: 'Support' },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-12 max-w-2xl">
                    <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-3">
                        About CargoLink
                    </h1>
                    <p className="text-sm text-zinc-400 font-inter leading-relaxed">
                        We believe international freight should be simple, transparent, and fast. CargoLink was built to give shippers instant access to the world&apos;s best freight forwarders — with real pricing, real carriers, and zero guesswork.
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-5">
                            <p className="text-xl font-black font-inter text-white mb-1">{value}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Mission pillars */}
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">What We Stand For</p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {pillars.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-5 p-6">
                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black font-inter text-white mb-1">{title}</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="mt-10">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">Our Journey</p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {timeline.map(({ year, title, desc }) => (
                            <div key={year} className="flex items-start gap-5 p-6">
                                <span className="text-[10px] font-mono text-zinc-700 mt-0.5 flex-shrink-0 w-8">{year}</span>
                                <div>
                                    <p className="text-sm font-black font-inter text-white mb-1">{title}</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-10 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black font-inter text-white mb-1">Ready to ship smarter?</p>
                        <p className="text-xs text-zinc-500 font-inter">Get your first quote in under 10 seconds.</p>
                    </div>
                    <a
                        href="/"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        Get a Quote
                    </a>
                </div>

            </div>
        </div>
    )
}
