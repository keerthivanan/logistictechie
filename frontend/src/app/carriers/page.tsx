'use client'

import Navbar from '@/components/layout/Navbar'
import ComparisonChart from '@/components/visuals/ComparisonChart'
import Link from 'next/link'
import { ArrowRight, Ship, BarChart2, BadgeCheck } from 'lucide-react'
import { useT } from '@/lib/i18n/t'

export default function CarriersPage() {
    const t = useT()

    const steps = [
        { icon: BadgeCheck, title: t('carriers.step1.title'), desc: t('carriers.step1.desc') },
        { icon: BarChart2, title: t('carriers.step2.title'), desc: t('carriers.step2.desc') },
        { icon: Ship, title: t('carriers.step3.title'), desc: t('carriers.step3.desc') },
    ]
    const stats = [
        { value: '98%', label: t('carriers.stat1') },
        { value: '+22%', label: t('carriers.stat2') },
    ]
    const trust = [
        t('carriers.trust1'), t('carriers.trust2'),
        t('carriers.trust3'), t('carriers.trust4'),
    ]

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-12 max-w-2xl">
                    <h1 className="text-2xl font-semibold font-outfit uppercase tracking-tight text-white mb-3">
                        {t('carriers.title')}
                    </h1>
                    <p className="text-sm text-zinc-400 font-inter leading-relaxed mb-6">{t('carriers.sub.full')}</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors group"
                    >
                        {t('carriers.apply')}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Trust signals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                    {trust.map((item) => (
                        <div key={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl px-4 py-3">
                            <p className="text-xs text-zinc-400 font-inter leading-snug">{item}</p>
                        </div>
                    ))}
                </div>

                {/* How it works */}
                <div className="mb-10">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">How It Works</p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {steps.map(({ icon: Icon, title, desc }, i) => (
                            <div key={title} className="flex items-start gap-5 p-6">
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-[10px] font-mono text-zinc-700 w-4">{String(i + 1).padStart(2, '0')}</span>
                                    <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-zinc-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold font-inter text-white mb-1">{title}</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance */}
                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-6">Network Performance</p>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <ComparisonChart />
                        </div>
                        <div>
                            <p className="text-sm font-semibold font-inter text-white mb-2">Carriers on CargoLink Outperform the Market</p>
                            <p className="text-xs text-zinc-500 font-inter leading-relaxed mb-6">
                                Our demand forecasting matches your available slots with live shipping requests — so you're pricing dynamically and filling capacity before it reaches port, not after.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map(({ value, label }) => (
                                    <div key={label} className="bg-black border border-white/[0.08] rounded-xl p-5">
                                        <p className="text-2xl font-semibold text-white mb-1">{value}</p>
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center mt-6">
                    <img src="/cargolink.png" alt="CargoLink" className="h-10 w-auto object-contain opacity-30" />
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold font-inter text-white mb-1">Ready to grow your fleet utilisation?</p>
                        <p className="text-xs text-zinc-500 font-inter">Join 100+ carriers already on the network.</p>
                    </div>
                    <Link
                        href="/contact"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        Apply Now
                    </Link>
                </div>

            </div>
        </div>
    )
}
