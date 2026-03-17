'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Search, MessageCircle, FileText, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const categories = [
    {
        icon: FileText,
        title: 'Documentation',
        desc: 'Step-by-step guides for bookings, tracking, customs, and everything in between.',
    },
    {
        icon: MessageCircle,
        title: 'Live Chat',
        desc: 'Talk directly to our logistics support team — available 24 hours a day, 7 days a week.',
    },
    {
        icon: HelpCircle,
        title: 'FAQs',
        desc: 'Instant answers to the most common questions about quotes, carriers, and payments.',
    },
]

const articles = [
    'How to track a shipment',
    'Understanding customs & import duties',
    'Managing your shipping documents',
    'Getting quotes and comparing rates',
    'How to add a freight forwarder',
    'API access and integration guide',
]

export default function HelpPage() {
    const [query, setQuery] = useState('')

    const filtered = query.trim()
        ? articles.filter(a => a.toLowerCase().includes(query.toLowerCase()))
        : articles

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-2">
                        Help Center
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter">Everything you need to get your cargo moving — guides, answers, and a support team that actually picks up.</p>
                </div>

                {/* Search */}
                <div className="relative mb-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/[0.08] py-3 pl-11 pr-4 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                    />
                </div>

                {/* Category cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-10">
                    {categories.map(({ icon: Icon, title, desc }) => (
                        <Link
                            key={title}
                            href="/contact"
                            className="bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl hover:border-white/[0.12] transition-all cursor-pointer group"
                        >
                            <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/[0.06] transition-colors">
                                <Icon className="w-4 h-4 text-zinc-400" />
                            </div>
                            <p className="text-sm font-black font-inter text-white mb-1">{title}</p>
                            <p className="text-xs text-zinc-500 font-inter">{desc}</p>
                        </Link>
                    ))}
                </div>

                {/* Articles */}
                <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">
                        {query.trim() ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for &quot;${query}&quot;` : 'Help Articles'}
                    </p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {filtered.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-xs text-zinc-600 font-inter">No articles found. <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors underline">Contact support</Link> for help.</p>
                            </div>
                        ) : filtered.map((article, i) => (
                            <Link
                                key={i}
                                href="/contact"
                                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-950 transition-colors group"
                            >
                                <span className="text-sm text-zinc-400 font-inter group-hover:text-white transition-colors">{article}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-8 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-black font-inter text-white mb-1">Can&apos;t find what you need?</p>
                        <p className="text-xs text-zinc-500 font-inter">A real person on our team will respond within 2 business hours.</p>
                    </div>
                    <Link
                        href="/contact"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        Contact Us
                    </Link>
                </div>

            </div>
        </div>
    )
}
