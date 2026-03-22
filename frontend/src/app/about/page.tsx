'use client'

import Navbar from '@/components/layout/Navbar'
import { Globe, Cpu, ShieldCheck } from 'lucide-react'
import { useT } from '@/lib/i18n/t'

export default function AboutPage() {
    const t = useT()

    const pillars = [
        { icon: Globe, title: t('about.pillar1.title'), desc: t('about.pillar1.desc') },
        { icon: Cpu, title: t('about.pillar2.title'), desc: t('about.pillar2.desc') },
        { icon: ShieldCheck, title: t('about.pillar3.title'), desc: t('about.pillar3.desc') },
    ]
    const timeline = [
        { year: '2024', title: t('about.tl1.title'), desc: t('about.tl1.desc') },
        { year: '2025', title: t('about.tl2.title'), desc: t('about.tl2.desc') },
        { year: '2026', title: t('about.tl3.title'), desc: t('about.tl3.desc') },
    ]
    const stats = [
        { value: '195', label: t('about.stat1') },
        { value: '100+', label: t('about.stat2') },
        { value: '< 10s', label: t('about.stat3') },
        { value: '24/7', label: t('about.stat4') },
    ]

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-12 max-w-2xl">
                    <h1 className="text-2xl font-semibold font-outfit uppercase tracking-tight text-white mb-3 flex items-center gap-3">
                        {t('about.title')} <img src="/cargolink.png" alt="CargoLink" className="h-8 w-auto object-contain opacity-90 inline-block" />
                    </h1>
                    <p className="text-sm text-zinc-400 font-inter leading-relaxed">{t('about.sub')}</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-5">
                            <p className="text-xl font-semibold font-inter text-white mb-1">{value}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Mission pillars */}
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">{t('about.mission')}</p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {pillars.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex items-start gap-5 p-6">
                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold font-inter text-white mb-1">{title}</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="mt-10">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">{t('about.journey')}</p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {timeline.map(({ year, title, desc }) => (
                            <div key={year} className="flex items-start gap-5 p-6">
                                <span className="text-[10px] font-mono text-zinc-700 mt-0.5 flex-shrink-0 w-8">{year}</span>
                                <div>
                                    <p className="text-sm font-semibold font-inter text-white mb-1">{title}</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-10 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold font-inter text-white mb-1">{t('about.cta.title')}</p>
                        <p className="text-xs text-zinc-500 font-inter">{t('about.cta.sub')}</p>
                    </div>
                    <a
                        href="/"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        {t('about.cta.btn')}
                    </a>
                </div>

            </div>
        </div>
    )
}
