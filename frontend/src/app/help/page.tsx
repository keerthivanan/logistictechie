'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Search, MessageCircle, FileText, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useT } from '@/lib/i18n/t'

export default function HelpPage() {
    const t = useT()
    const [query, setQuery] = useState('')

    const categories = [
        { icon: FileText, title: t('help.cat1.title'), desc: t('help.cat1.desc') },
        { icon: MessageCircle, title: t('help.cat2.title'), desc: t('help.cat2.desc'), href: '/contact' },
        { icon: HelpCircle, title: t('help.cat3.title'), desc: t('help.cat3.desc') },
    ]

    const articles = [
        { title: t('help.art1'), tag: t('help.tag.search') },
        { title: t('help.art2'), tag: t('help.tag.marketplace') },
        { title: t('help.art3'), tag: t('help.tag.shipping') },
        { title: t('help.art4'), tag: t('help.tag.tracking') },
        { title: t('help.art5'), tag: t('help.tag.customs') },
        { title: t('help.art6'), tag: t('help.tag.documents') },
        { title: t('help.art7'), tag: t('help.tag.marketplace') },
        { title: t('help.art8'), tag: t('help.tag.tools') },
        { title: t('help.art9'), tag: t('help.tag.account') },
        { title: t('help.art10'), tag: t('help.tag.payments') },
    ]

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
                            ? t('help.results.count').replace('{n}', String(filtered.length)).replace('{q}', query)
                            : t('help.articles')}
                    </p>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {filtered.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-xs text-zinc-600 font-inter">
                                    {t('help.no.articles')}{' '}
                                    <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors underline">{t('help.contact.support')}</Link>
                                    {' '}{t('help.contact.suffix')}
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
                        <p className="text-sm font-semibold font-inter text-white mb-1">{t('help.cta.title')}</p>
                        <p className="text-xs text-zinc-500 font-inter">{t('help.cta.sub')}</p>
                    </div>
                    <Link
                        href="/contact"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        {t('help.cta.btn')}
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
