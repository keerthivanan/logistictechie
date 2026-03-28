'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Search, AlertCircle, ArrowRight, Hash, FileCheck, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useT } from '@/lib/i18n/t'

const QUICK_SEARCHES = ['smartphone', 'cotton shirt', 'steel plates', 'laptop', 'tyre', 'battery', 'furniture', 'coffee']

export default function HSCodesPage() {
    const t = useT()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const fetchHS = async (term: string) => {
        if (!term.trim()) return
        setLoading(true)
        setApiError('')
        try {
            const res = await fetch(`/api/references/commodities/search?q=${encodeURIComponent(term.trim())}`)
            if (!res.ok) {
                setApiError('Classification service temporarily unavailable.')
                setResults([])
                return
            }
            const data = await res.json()
            const mapped = (data.results || []).map((r: any) => ({
                code: r.hs_code,
                title: r.name,
                desc: r.cargo_types?.length ? `Cargo types: ${r.cargo_types.join(', ')}` : r.name,
                prob: '—',
            }))
            setResults(mapped)
        } catch (e) {
            setApiError('Network error. Please check your connection and try again.')
            setResults([])
        } finally {
            setLoading(false)
            setHasSearched(true)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchHS(query)
    }

    const doQuickSearch = (term: string) => {
        setQuery(term)
        fetchHS(term)
    }

    const displayResults = hasSearched
        ? results
        : [
            { code: '8471.30', title: 'Laptops & Portable Computers', desc: 'Portable automatic data processing machines...', prob: '99.2%' },
            { code: '6109.10', title: 'Cotton T-Shirts', desc: 'T-shirts, singlets and other vests of cotton...', prob: '98.5%' },
            { code: '8703.23', title: 'Motor Cars (1000–1500cc)', desc: 'Motor vehicles principally designed for the transport...', prob: '97.8%' }
        ]

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-blue-500 selection:text-white">
            <Navbar />

            {/* ─── HERO ─── */}
            <section className="relative bg-black min-h-screen flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
                    <img src="/cargolink.png" alt="CargoLink" className="h-10 w-auto object-contain opacity-80 mb-8" />
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight font-outfit mb-12 leading-[1.1] text-white max-w-4xl">
                        {t('tools.hs.title')}
                    </h1>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-12">
                        {[
                            { value: '217k+', label: t('hs.stat.class') },
                            { value: '195', label: t('hs.stat.countries') },
                            { value: '99.9%', label: t('hs.stat.accuracy') },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col gap-1">
                                <div className="text-2xl font-semibold text-white tracking-tight">{s.value}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Inline search in hero */}
                    <form onSubmit={handleSearch} className="w-full max-w-2xl flex bg-black border border-white/5 rounded-lg p-1.5 mb-8">
                        <div className="flex items-center pl-5">
                            <Search className="w-4 h-4 text-zinc-600" />
                        </div>
                        <input
                            type="text" value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('hs.placeholder')}
                            className="flex-1 bg-transparent px-4 py-2.5 text-white focus:outline-none placeholder-zinc-600 font-inter text-sm"
                        />
                        <button type="submit" disabled={loading}
                            className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center gap-2 font-inter shrink-0 shadow-xl disabled:opacity-50">
                            {loading ? t('hs.searching') : t('hs.search')} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    {/* Quick searches */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {QUICK_SEARCHES.map((term) => (
                            <button key={term} onClick={() => doQuickSearch(term)}
                                className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold font-inter uppercase tracking-wider text-zinc-500 hover:border-white/30 hover:text-white transition-all">
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── DESCRIPTION + TOOL ─── */}
            <section className="py-24 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-20 mb-20 items-start">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('hs.stop.paying')}</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
                                {t('hs.desc')}
                            </p>
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                {[
                                    { label: t('hs.taxonomy'), items: [t('hs.tax.chap'), t('hs.tax.head'), t('hs.tax.sub'), t('hs.tax.nat')] },
                                ].map(block => (
                                    <div key={block.label}>
                                        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.2em] font-inter mb-3">{block.label}</p>
                                        <div className="space-y-2">
                                            {block.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-[8px] font-bold text-zinc-600 font-inter shrink-0">0{i + 1}</div>
                                                    <span className="text-sm text-zinc-400 font-inter">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Results panel */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] font-inter mb-5">
                                {hasSearched && results.length > 0
                                    ? `${results.length} ${t('hs.results')}`
                                    : hasSearched && results.length === 0
                                        ? t('hs.empty')
                                        : t('hs.quick')}
                            </p>

                            {hasSearched && apiError && (
                                <div className="flex items-center justify-center py-16 border border-red-500/10 rounded-lg bg-red-500/5">
                                    <div className="text-center">
                                        <AlertCircle className="w-7 h-7 text-red-500/50 mx-auto mb-3" />
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-inter mb-1">{t('hs.service.error')}</p>
                                        <p className="text-zinc-500 text-xs font-inter">{apiError}</p>
                                    </div>
                                </div>
                            )}

                            {hasSearched && !apiError && results.length === 0 && (
                                <div className="flex items-center justify-center py-16 border border-white/5 rounded-lg bg-zinc-950/30">
                                    <div className="text-center">
                                        <AlertCircle className="w-7 h-7 text-zinc-700 mx-auto mb-3" />
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1">{t('hs.no.match.prefix')} &quot;{query}&quot;</p>
                                        <p className="text-zinc-600 text-xs font-inter">{t('hs.try.simpler')}</p>
                                    </div>
                                </div>
                            )}

                            {displayResults.map((item, i) => (
                                <div key={i} className="bg-zinc-950 border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all cursor-pointer group">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl shrink-0">
                                            <Hash className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="text-xl font-bold font-outfit tracking-tighter text-white">{item.code}</span>
                                                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-zinc-400 text-[10px] font-bold font-inter uppercase tracking-widest">{item.prob} {t('hs.match')}</span>
                                            </div>
                                            <p className="text-sm font-bold text-white mb-1 font-inter">{item.title}</p>
                                            <p className="text-[11px] text-zinc-500 font-inter leading-relaxed line-clamp-2">{item.desc}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors shrink-0 mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURE CARDS ─── */}
            <section className="py-24 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">{t('hs.why')}</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { icon: FileCheck, title: t('hs.feat1.title'), desc: t('hs.feat1.desc') },
                            { icon: TrendingUp, title: t('hs.feat2.title'), desc: t('hs.feat2.desc') },
                            { icon: FileCheck, title: t('hs.feat3.title'), desc: t('hs.feat3.desc') },
                        ].map((f) => (
                            <div key={f.title} className="group space-y-4">
                                <h3 className="text-xl font-bold text-white">{f.title}</h3>
                                <p className="text-zinc-500 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── BOTTOM CTA ─── */}
            <section className="py-32 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-8">{t('hs.cta.title')}</h2>
                    <p className="text-xl text-zinc-400 mb-10">
                        {t('hs.cta.sub')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all">
                            {t('hs.cta.start')}
                        </Link>
                        <Link href="/services/customs-compliance" className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-all">
                            {t('hs.cta.customs')}
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    )
}
