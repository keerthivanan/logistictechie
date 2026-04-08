'use client'

import { ShieldCheck, Quote } from 'lucide-react'
import { useT } from '@/lib/i18n/t'

export default function TestimonialsSection() {
    const t = useT()

    const testimonials = [
        { name: "Sarah Chen",    role: t('tm.1.role'), company: "Maersk Line",        initials: "SC", quote: t('tm.1.quote'), metric: t('tm.1.metric'), metricLabel: t('tm.1.label') },
        { name: "James Okafor", role: t('tm.2.role'), company: "DB Schenker",         initials: "JO", quote: t('tm.2.quote'), metric: t('tm.2.metric'), metricLabel: t('tm.2.label') },
        { name: "Priya Menon",  role: t('tm.3.role'), company: "Reliance Logistics",  initials: "PM", quote: t('tm.3.quote'), metric: t('tm.3.metric'), metricLabel: t('tm.3.label') },
        { name: "Lucas Hartmann", role: t('tm.4.role'), company: "Kuehne+Nagel",      initials: "LH", quote: t('tm.4.quote'), metric: t('tm.4.metric'), metricLabel: t('tm.4.label') },
        { name: "Ana Torres",   role: t('tm.5.role'), company: "DHL Express",         initials: "AT", quote: t('tm.5.quote'), metric: t('tm.5.metric'), metricLabel: t('tm.5.label') },
        { name: "Raj Patel",    role: t('tm.6.role'), company: "FreightBridge",       initials: "RP", quote: t('tm.6.quote'), metric: t('tm.6.metric'), metricLabel: t('tm.6.label') },
    ]
    return (
        <section className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-xs font-inter mb-6">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t('testimonials.badge')}
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tight font-outfit text-white mb-3">
                        {t('testimonials.heading')}
                    </h2>
                    <p className="text-sm text-zinc-500 font-inter max-w-xl mx-auto">
                        {t('testimonials.sub')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {testimonials.map((tm, i) => (
                        <div
                            key={i}
                            className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between hover:border-white/[0.12] transition-all duration-300 group"
                        >
                            {/* Quote icon */}
                            <div>
                                <Quote className="w-6 h-6 text-zinc-700 mb-4 group-hover:text-zinc-600 transition-colors" />
                                <p className="text-sm text-zinc-300 leading-relaxed font-inter mb-6">
                                    &ldquo;{tm.quote}&rdquo;
                                </p>
                            </div>

                            {/* Metric highlight */}
                            <div className="mb-5">
                                <div className="inline-flex flex-col bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2">
                                    <span className="text-sm font-semibold text-white font-inter">{tm.metric}</span>
                                    <span className="text-[10px] text-zinc-600 font-inter uppercase tracking-widest">{tm.metricLabel}</span>
                                </div>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300 font-inter shrink-0">
                                    {tm.initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-semibold text-white font-inter truncate">{tm.name}</p>
                                        <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-inter truncate">{tm.role} · {tm.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
