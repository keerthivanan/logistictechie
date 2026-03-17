'use client'

import Navbar from '@/components/layout/Navbar'
import ComparisonChart from '@/components/visuals/ComparisonChart'
import Link from 'next/link'
import { ArrowRight, Ship, BarChart2, BadgeCheck } from 'lucide-react'

const steps = [
    {
        icon: BadgeCheck,
        title: 'Apply & Get Verified',
        desc: 'Submit your fleet details, service routes, and certifications. Our team reviews and verifies your profile within 48 hours — no exclusivity required.',
    },
    {
        icon: BarChart2,
        title: 'Receive Matched Demand',
        desc: 'Get real booking requests from verified shippers and forwarders matched to your exact routes and available capacity — no cold leads, no wasted time.',
    },
    {
        icon: Ship,
        title: 'Fill Capacity. Get Paid.',
        desc: 'Accept bookings directly on the platform. Pricing is transparent, contracts are digital, and payments are guaranteed before cargo moves.',
    },
]

const stats = [
    { value: '98%', label: 'Avg. Load Factor' },
    { value: '+22%', label: 'Revenue / TEU' },
]

const trust = [
    'No monthly subscription fees',
    'Pay only on completed bookings',
    'Verified shippers only — no time-wasters',
    'Digital contracts & guaranteed payment',
]

export default function CarriersPage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-12 max-w-2xl">
                    <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-3">
                        Join Our Carrier Network
                    </h1>
                    <p className="text-sm text-zinc-400 font-inter leading-relaxed mb-6">
                        Empty slots are lost revenue. CargoLink connects your fleet directly with verified shippers and freight forwarders — filling your capacity without the overhead of a sales team.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors group"
                    >
                        Apply to Partner
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
                                    <p className="text-sm font-black font-inter text-white mb-1">{title}</p>
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
                            <p className="text-sm font-black font-inter text-white mb-2">Carriers on CargoLink Outperform the Market</p>
                            <p className="text-xs text-zinc-500 font-inter leading-relaxed mb-6">
                                Our demand forecasting matches your available slots with live shipping requests — so you're pricing dynamically and filling capacity before it reaches port, not after.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map(({ value, label }) => (
                                    <div key={label} className="bg-black border border-white/[0.08] rounded-xl p-5">
                                        <p className="text-2xl font-black text-white mb-1">{value}</p>
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black font-inter text-white mb-1">Ready to grow your fleet utilisation?</p>
                        <p className="text-xs text-zinc-500 font-inter">Join 100+ carriers already on the network.</p>
                    </div>
                    <Link
                        href="/contact"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        Apply Now
                    </Link>
                </div>

            </div>
        </div>
    )
}
