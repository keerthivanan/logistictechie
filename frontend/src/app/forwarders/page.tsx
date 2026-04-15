'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ArrowRight, Globe, CheckCircle2, ExternalLink, Users, Shield, Zap } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Avatar from '@/components/visuals/Avatar'
import PartnerModal from '@/components/modals/PartnerModal'
import { apiFetch } from '@/lib/config'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Forwarder {
    id: string
    forwarder_id?: string
    company_name: string
    email: string
    country: string
    logo_url: string
    website?: string
    phone?: string
    reliability_score?: number
    specializations?: string
    routes?: string
}

function getFlag(country: string): string {
    const map: Record<string, string> = {
        'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪',
        'USA': '🇺🇸', 'United States': '🇺🇸', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
        'China': '🇨🇳', 'India': '🇮🇳', 'Germany': '🇩🇪', 'France': '🇫🇷',
        'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Singapore': '🇸🇬', 'Australia': '🇦🇺',
        'Canada': '🇨🇦', 'Brazil': '🇧🇷', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
        'Turkey': '🇹🇷', 'Egypt': '🇪🇬', 'South Africa': '🇿🇦', 'Nigeria': '🇳🇬',
        'Kenya': '🇰🇪', 'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩', 'Malaysia': '🇲🇾',
        'Indonesia': '🇮🇩', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Philippines': '🇵🇭',
        'Hong Kong': '🇭🇰', 'Taiwan': '🇹🇼', 'Qatar': '🇶🇦', 'Kuwait': '🇰🇼',
        'Bahrain': '🇧🇭', 'Oman': '🇴🇲', 'Jordan': '🇯🇴', 'Iraq': '🇮🇶',
        'Morocco': '🇲🇦', 'Mexico': '🇲🇽', 'Spain': '🇪🇸', 'Italy': '🇮🇹',
        'Poland': '🇵🇱', 'Russia': '🇷🇺', 'Switzerland': '🇨🇭', 'Sweden': '🇸🇪',
        'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Austria': '🇦🇹',
        'Portugal': '🇵🇹', 'Greece': '🇬🇷', 'Ireland': '🇮🇪', 'Israel': '🇮🇱',
    }
    return map[country] || '🌐'
}

const FILTERS = ['All', 'Asia Pacific', 'Middle East', 'Europe', 'Americas', 'Africa'] as const
type Filter = typeof FILTERS[number]

const REGION_COUNTRIES: Record<string, string[]> = {
    'Asia Pacific': ['China', 'India', 'Japan', 'South Korea', 'Singapore', 'Australia', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Hong Kong', 'Taiwan', 'Bangladesh', 'Pakistan', 'Sri Lanka', 'New Zealand'],
    'Middle East': ['Saudi Arabia', 'UAE', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Iraq', 'Iran', 'Yemen', 'Syria'],
    'Europe': ['UK', 'United Kingdom', 'Germany', 'France', 'Netherlands', 'Belgium', 'Spain', 'Italy', 'Poland', 'Russia', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Austria', 'Portugal', 'Greece', 'Ireland'],
    'Americas': ['USA', 'United States', 'Canada', 'Brazil', 'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru'],
    'Africa': ['Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Morocco', 'Ethiopia', 'Ghana', 'Tanzania'],
}

export default function ForwarderDirectoryPage() {
    const [forwarders, setForwarders] = useState<Forwarder[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<Filter>('All')
    const [selectedPartner, setSelectedPartner] = useState<Forwarder | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        apiFetch('/api/forwarders/active')
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data.forwarders || [])
                setForwarders(list)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const countries = useMemo(() => {
        const seen = new Set<string>()
        return forwarders.map(f => f.country).filter(c => c && !seen.has(c) && seen.add(c))
    }, [forwarders])

    const filtered = useMemo(() => {
        let list = forwarders
        if (search.trim()) {
            const s = search.toLowerCase()
            list = list.filter(f =>
                f.company_name.toLowerCase().includes(s) ||
                f.country?.toLowerCase().includes(s) ||
                f.specializations?.toLowerCase().includes(s) ||
                f.routes?.toLowerCase().includes(s)
            )
        }
        if (filter !== 'All') {
            const regionCountries = REGION_COUNTRIES[filter] || []
            list = list.filter(f => regionCountries.includes(f.country))
        }
        return list
    }, [forwarders, search, filter])

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">

                {/* ── Hero Header ── */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-3 font-inter">CargoLink Network</p>
                            <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit tracking-tight leading-tight mb-4">
                                Global Freight<br />Partner Network
                            </h1>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-xs text-zinc-400 font-inter">
                                        <span className="text-white font-bold">{forwarders.length}</span> verified partners
                                    </span>
                                </div>
                                {countries.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3 h-3 text-zinc-600" />
                                        <span className="text-xs text-zinc-400 font-inter">
                                            <span className="text-white font-bold">{countries.length}</span> countries
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link
                            href="/forwarders/register"
                            className="flex-shrink-0 flex items-center gap-2 bg-white text-black text-xs font-bold px-5 py-3 rounded-xl hover:bg-zinc-200 transition-all self-start md:self-auto"
                        >
                            Become a Partner <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* ── Search + Filters ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by company, country, or specialization..."
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all font-inter"
                        />
                    </div>
                    <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 overflow-x-auto">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all font-inter ${
                                    filter === f ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Partner Grid ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-4">
                                {/* avatar + badge row */}
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] animate-pulse" />
                                    <div className="w-20 h-5 rounded-lg bg-white/[0.04] animate-pulse" />
                                </div>
                                {/* name + sub */}
                                <div className="space-y-2">
                                    <div className="h-4 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
                                    <div className="h-3 w-1/2 rounded-lg bg-white/[0.04] animate-pulse" />
                                </div>
                                {/* tags */}
                                <div className="flex gap-2">
                                    <div className="h-4 w-16 rounded-md bg-white/[0.03] animate-pulse" />
                                    <div className="h-4 w-12 rounded-md bg-white/[0.03] animate-pulse" />
                                </div>
                                {/* footer */}
                                <div className="pt-3 border-t border-white/[0.04] flex justify-between">
                                    <div className="h-3 w-20 rounded-lg bg-white/[0.04] animate-pulse" />
                                    <div className="h-3 w-3 rounded bg-white/[0.04] animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState hasForwarders={forwarders.length > 0} filter={filter} search={search} />
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((fwd, i) => (
                                <PartnerCard
                                    key={fwd.id}
                                    fwd={fwd}
                                    index={i}
                                    onClick={() => { setSelectedPartner(fwd); setIsModalOpen(true) }}
                                />
                            ))}
                        </div>
                    </AnimatePresence>
                )}

                {/* ── Why Join Banner ── */}
                {!loading && (
                    <div className="mt-16 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 md:p-10">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white font-outfit mb-1">Verified Partners</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">Every forwarder is manually reviewed and approved before listing.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white font-outfit mb-1">Instant Quotes</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">Submit a request and receive competitive quotes within hours.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                    <Users className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white font-outfit mb-1">Global Reach</p>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">Network of forwarders covering key trade lanes worldwide.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <PartnerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partner={selectedPartner}
            />
        </div>
    )
}

function PartnerCard({ fwd, index, onClick }: { fwd: Forwarder; index: number; onClick: () => void }) {
    const specs = fwd.specializations?.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2) || []

    return (
        <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClick}
            className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04] rounded-2xl p-5 flex flex-col gap-4 transition-all text-left group"
        >
            {/* Top: avatar + verified */}
            <div className="flex items-start justify-between">
                <Avatar
                    src={fwd.logo_url || undefined}
                    name={fwd.company_name}
                    size="md"
                    shape="square"
                    className="border-white/5 flex-shrink-0"
                />
                <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white/60" />
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Verified</span>
                </div>
            </div>

            {/* Company name */}
            <div className="space-y-1 flex-1">
                <p className="text-sm font-bold text-white font-outfit leading-snug group-hover:text-zinc-200 transition-colors">
                    {fwd.company_name}
                </p>
                {fwd.country ? (
                    <p className="text-[11px] text-zinc-500 font-inter flex items-center gap-1.5">
                        <span>{getFlag(fwd.country)}</span>
                        <span>{fwd.country}</span>
                    </p>
                ) : (
                    <p className="text-[11px] text-zinc-700 font-inter">Global operations</p>
                )}
            </div>

            {/* Specialization tags */}
            {specs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {specs.map(s => (
                        <span key={s} className="text-[9px] font-semibold text-zinc-500 bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-md uppercase tracking-wide font-inter">
                            {s}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">View Profile</span>
                <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </div>
        </motion.button>
    )
}

function EmptyState({ hasForwarders, filter, search }: { hasForwarders: boolean; filter: Filter; search: string }) {
    if (!hasForwarders) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                    <Globe className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="max-w-sm">
                    <h3 className="text-base font-bold text-white font-outfit mb-2">Network Launching Soon</h3>
                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">
                        Our verified partner network is being built. Be among the first forwarders to join CargoLink and access exclusive shipment requests.
                    </p>
                </div>
                <Link
                    href="/forwarders/register"
                    className="flex items-center gap-2 bg-white text-black text-xs font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-all"
                >
                    Apply to Join <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        )
    }

    return (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-50">
            <Search className="w-6 h-6 text-zinc-600" />
            <div>
                <p className="text-sm font-bold text-white font-outfit mb-1">No results</p>
                <p className="text-xs text-zinc-500 font-inter">
                    {search ? `No partners match "${search}"` : `No partners in ${filter} region yet`}
                </p>
            </div>
        </div>
    )
}
