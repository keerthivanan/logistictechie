'use client'

import { ShieldCheck, Quote } from 'lucide-react'

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Head of Freight Operations",
        company: "Maersk Line",
        initials: "SC",
        quote: "We migrated from manual rate sheets to CargoLink in under a week. The automated quote comparison alone saves my team 15 hours every week — it's not a nice-to-have anymore, it's infrastructure.",
        metric: "15 hrs/week saved",
        metricLabel: "per team",
    },
    {
        name: "James Okafor",
        role: "Senior Trade Manager",
        company: "DB Schenker",
        initials: "JO",
        quote: "The lane analytics gave us visibility we never had with legacy TMS tools. We renegotiated three major carrier contracts using data pulled directly from CargoLink — that's real ROI.",
        metric: "3 contracts renegotiated",
        metricLabel: "using platform data",
    },
    {
        name: "Priya Menon",
        role: "VP Procurement",
        company: "Reliance Logistics",
        initials: "PM",
        quote: "We process 200+ shipments a month. CargoLink's API integration with our ERP cut our admin overhead by 40% in the first quarter. The compliance automation feature alone justifies the subscription.",
        metric: "40% admin reduction",
        metricLabel: "first quarter",
    },
    {
        name: "Lucas Hartmann",
        role: "Freight Director",
        company: "Kuehne+Nagel",
        initials: "LH",
        quote: "The forwarder portal transformed how we respond to RFQs. Our quote turnaround went from 48 hours to under 4. Clients noticed — we closed two new accounts that cited our response speed as the differentiator.",
        metric: "48h → 4h",
        metricLabel: "quote turnaround",
    },
    {
        name: "Ana Torres",
        role: "Supply Chain Lead",
        company: "DHL Express",
        initials: "AT",
        quote: "Real-time tracking across all our carriers in a single view. Our clients now expect this level of transparency because of CargoLink — and honestly, we'd never go back to scattered portals.",
        metric: "100% shipment visibility",
        metricLabel: "across all carriers",
    },
    {
        name: "Raj Patel",
        role: "Co-founder",
        company: "FreightBridge",
        initials: "RP",
        quote: "We built our entire brokerage workflow on CargoLink's API. Scaled from 50 to 600 monthly shipments without adding headcount. The developer docs are genuinely good — rare in this industry.",
        metric: "12× shipment volume",
        metricLabel: "same team size",
    },
]

export default function TestimonialsSection() {
    return (
        <section className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-xs font-inter mb-6">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Customers
                    </div>
                    <h2 className="text-3xl font-black tracking-tight font-outfit text-white mb-3">
                        Trusted by freight professionals worldwide.
                    </h2>
                    <p className="text-sm text-zinc-500 font-inter max-w-xl mx-auto">
                        From enterprise shippers to independent forwarders — here&apos;s what teams running real cargo say about CargoLink.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between hover:border-white/[0.12] transition-all duration-300 group"
                        >
                            {/* Quote icon */}
                            <div>
                                <Quote className="w-6 h-6 text-zinc-700 mb-4 group-hover:text-zinc-600 transition-colors" />
                                <p className="text-sm text-zinc-300 leading-relaxed font-inter mb-6">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                            </div>

                            {/* Metric highlight */}
                            <div className="mb-5">
                                <div className="inline-flex flex-col bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2">
                                    <span className="text-sm font-black text-white font-inter">{t.metric}</span>
                                    <span className="text-[10px] text-zinc-600 font-inter uppercase tracking-widest">{t.metricLabel}</span>
                                </div>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-300 font-inter shrink-0">
                                    {t.initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-black text-white font-inter truncate">{t.name}</p>
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-inter truncate">{t.role} · {t.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
