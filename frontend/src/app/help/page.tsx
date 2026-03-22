'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Search, MessageCircle, FileText, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useT } from '@/lib/i18n/t'

const categories = [
    {
        icon: FileText,
        title: 'Getting Started',
        desc: 'Learn how to search rates, request quotes, and manage shipments from your dashboard.',
    },
    {
        icon: MessageCircle,
        title: 'Talk to Support',
        desc: 'Reach our logistics team directly via the contact page — we respond within 2 business hours.',
        href: '/contact',
    },
    {
        icon: HelpCircle,
        title: 'FAQs',
        desc: 'Quick answers to the most common questions about quotes, forwarders, and payments.',
    },
]

const articles = [
    { title: 'How to search for instant freight rates', tag: 'Search' },
    { title: 'How to request quotes from forwarders', tag: 'Marketplace' },
    { title: 'Understanding FCL, LCL, Air and Truck modes', tag: 'Shipping' },
    { title: 'How to track a shipment', tag: 'Tracking' },
    { title: 'Understanding customs and import duties', tag: 'Customs' },
    { title: 'Managing your shipping documents', tag: 'Documents' },
    { title: 'How to compare and choose a forwarder quote', tag: 'Marketplace' },
    { title: 'How to use the freight calculator', tag: 'Tools' },
    { title: 'Setting up your dashboard and profile', tag: 'Account' },
    { title: 'How payments and contracts work', tag: 'Payments' },
]

export default function HelpPage() {
    const t = useT()
    const [query, setQuery] = useState('')

    const filtered = query.trim()
        ? articles.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
        : articles

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-semibold font-outfit uppercase tracking-tight text-white mb-2">
                        {t('help.title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter max-w-md mx-auto">
                        {t('help.sub')}
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        type="text"
                        placeholder={t('help.search')}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/[0.08] py-3 pl-11 pr-4 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                    />
                </div>

                {/* Category cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-10">
                    {categories.map(({ icon: Icon, title, desc, href }) => (
                        <Link
                            key={title}
                            href={href ?? '/contact'}
                            className="bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl hover:border-white/[0.12] transition-all cursor-pointer group"
                        >
                            <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/[0.06] transition-colors">
                                <Icon className="w-4 h-4 text-zinc-400" />
                            </div>
                            <p className="text-sm font-semibold font-inter text-white mb-1">{title}</p>
                            <p className="text-xs text-zinc-500 font-inter leading-relaxed">{desc}</p>
                        </Link>
                    ))}
                </div>

                {/* Articles */}
                <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">
                        {query.trim()
                            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
                            : 'Help Articles'}
                    </p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {filtered.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-xs text-zinc-600 font-inter">
                                    No articles found.{' '}
                                    <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors underline">Contact support</Link>
                                    {' '}for help.
                                </p>
                            </div>
                        ) : filtered.map((article, i) => (
                            <Link
                                key={i}
                                href="/contact"
                                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-950 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest font-inter flex-shrink-0 w-20 truncate">{article.tag}</span>
                                    <span className="text-sm text-zinc-400 font-inter group-hover:text-white transition-colors truncate">{article.title}</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0 ml-3" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-8 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold font-inter text-white mb-1">Can&apos;t find what you need?</p>
                        <p className="text-xs text-zinc-500 font-inter">A real person on our team will respond within 2 business hours.</p>
                    </div>
                    <Link
                        href="/contact"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Logo */}
                <div className="flex justify-center mt-10">
                    <img src="/cargolink.png" alt="CargoLink" className="h-10 w-auto object-contain opacity-30" />
                </div>

            </div>
        </div>
    )
}
