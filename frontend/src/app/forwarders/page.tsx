'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ArrowRight, Globe, MapPin, ExternalLink } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Avatar from '@/components/visuals/Avatar'
import PartnerModal from '@/components/modals/PartnerModal'
import { apiFetch } from '@/lib/config'
import { useT } from '@/lib/i18n/t'
import Link from 'next/link'

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

// Country name → flag emoji
function getFlag(country: string): string {
    const map: Record<string, string> = {
        'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪',
        'USA': '🇺🇸', 'United States': '🇺🇸', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
        'China': '🇨🇳', 'India': '🇮🇳', 'Germany': '🇩🇪', 'France': '🇫🇷',
        'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Singapore': '🇸🇬', 'Australia': '🇦🇺',
        'Canada': '🇨🇦', 'Brazil': '🇧🇷', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
        'Turkey': '🇹🇷', 'Egypt': '🇪🇬', 'South Africa': '🇿🇦', 'Nigeria': '🇳🇬',
        'Kenya': '🇰🇪', 'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩', 'Sri Lanka': '🇱🇰',
        'Malaysia': '🇲🇾', 'Indonesia': '🇮🇩', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳',
        'Philippines': '🇵🇭', 'Hong Kong': '🇭🇰', 'Taiwan': '🇹🇼',
        'Qatar': '🇶🇦', 'Kuwait': '🇰🇼', 'Bahrain': '🇧🇭', 'Oman': '🇴🇲',
        'Jordan': '🇯🇴', 'Lebanon': '🇱🇧', 'Iraq': '🇮🇶', 'Iran': '🇮🇷',
        'Mexico': '🇲🇽', 'Argentina': '🇦🇷', 'Colombia': '🇨🇴', 'Chile': '🇨🇱',
        'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Poland': '🇵🇱', 'Russia': '🇷🇺',
        'Switzerland': '🇨🇭', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰',
        'Finland': '🇫🇮', 'Austria': '🇦🇹', 'Portugal': '🇵🇹', 'Greece': '🇬🇷',
        'Morocco': '🇲🇦', 'Tunisia': '🇹🇳', 'Algeria': '🇩🇿', 'Libya': '🇱🇾',
        'Ethiopia': '🇪🇹', 'Ghana': '🇬🇭', 'Tanzania': '🇹🇿', 'Uganda': '🇺🇬',
        'New Zealand': '🇳🇿', 'Israel': '🇮🇱', 'Czech Republic': '🇨🇿', 'Romania': '🇷🇴',
        'Hungary': '🇭🇺', 'Ukraine': '🇺🇦', 'Serbia': '🇷🇸', 'Croatia': '🇭🇷',
        'Slovakia': '🇸🇰', 'Bulgaria': '🇧🇬', 'Slovenia': '🇸🇮', 'Lithuania': '🇱🇹',
        'Latvia': '🇱🇻', 'Estonia': '🇪🇪', 'Belarus': '🇧🇾', 'Kazakhstan': '🇰🇿',
        'Azerbaijan': '🇦🇿', 'Georgia': '🇬🇪', 'Armenia': '🇦🇲', 'Uzbekistan': '🇺🇿',
        'Sudan': '🇸🇩', 'Yemen': '🇾🇪', 'Syria': '🇸🇾', 'Afghanistan': '🇦🇫',
        'Myanmar': '🇲🇲', 'Cambodia': '🇰🇭', 'Laos': '🇱🇦', 'Nepal': '🇳🇵',
        'Maldives': '🇲🇻', 'Mongolia': '🇲🇳', 'Cuba': '🇨🇺', 'Peru': '🇵🇪',
        'Venezuela': '🇻🇪', 'Ecuador': '🇪🇨', 'Bolivia': '🇧🇴', 'Paraguay': '🇵🇾',
        'Uruguay': '🇺🇾', 'Panama': '🇵🇦', 'Costa Rica': '🇨🇷', 'Guatemala': '🇬🇹',
        'Honduras': '🇭🇳', 'El Salvador': '🇸🇻', 'Nicaragua': '🇳🇮', 'Dominican Republic': '🇩🇴',
        'Jamaica': '🇯🇲', 'Trinidad and Tobago': '🇹🇹', 'Senegal': '🇸🇳', 'Ivory Coast': '🇨🇮',
        'Cameroon': '🇨🇲', 'Angola': '🇦🇴', 'Mozambique': '🇲🇿', 'Zambia': '🇿🇲',
        'Zimbabwe': '🇿🇼', 'Somalia': '🇸🇴', 'Rwanda': '🇷🇼', 'Botswana': '🇧🇼',
        'Namibia': '🇳🇦', 'Malawi': '🇲🇼', 'Eritrea': '🇪🇷', 'Djibouti': '🇩🇯',
        'Congo': '🇨🇬', 'DR Congo': '🇨🇩', 'Madagascar': '🇲🇬', 'Mauritius': '🇲🇺',
        'Macau': '🇲🇴', 'Brunei': '🇧🇳', 'Timor-Leste': '🇹🇱', 'Papua New Guinea': '🇵🇬',
        'Fiji': '🇫🇯', 'Iceland': '🇮🇸', 'Luxembourg': '🇱🇺', 'Malta': '🇲🇹',
        'Cyprus': '🇨🇾', 'Albania': '🇦🇱', 'North Macedonia': '🇲🇰', 'Bosnia': '🇧🇦',
        'Montenegro': '🇲🇪', 'Kosovo': '🇽🇰', 'Moldova': '🇲🇩', 'Ireland': '🇮🇪',
        'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    }
    return map[country] || '🌐'
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function ForwarderDirectoryPage() {
    const t = useT()
    const [forwarders, setForwarders] = useState<Forwarder[]>([])
    const [loading, setLoading] = useState(true)
    const [activeLetter, setActiveLetter] = useState('A')
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [showAllCountries, setShowAllCountries] = useState(false)
    const [selectedPartner, setSelectedPartner] = useState<Forwarder | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        apiFetch('/api/forwarders/active')
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data.forwarders || [])
                setForwarders(list)
                // Auto-select first country under first active letter
                const first = list.find((f: Forwarder) => f.country?.toUpperCase().startsWith('A'))
                if (first) setSelectedCountry(first.country)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    // All unique countries
    const allCountries = useMemo(() => {
        const seen = new Set<string>()
        return forwarders
            .map(f => f.country)
            .filter(c => c && !seen.has(c) && seen.add(c))
            .sort()
    }, [forwarders])

    // Countries filtered by active letter + search
    const filteredCountries = useMemo(() => {
        return allCountries.filter(c => {
            const matchesLetter = c.toUpperCase().startsWith(activeLetter)
            const matchesSearch = !search || c.toLowerCase().includes(search.toLowerCase())
            return matchesLetter && matchesSearch
        })
    }, [allCountries, activeLetter, search])

    // Letters that have at least one country
    const activeLetters = useMemo(() => {
        const set = new Set(allCountries.map(c => c[0]?.toUpperCase()))
        return set
    }, [allCountries])

    // Members of selected country
    const countryMembers = useMemo(() => {
        if (!selectedCountry) return []
        return forwarders.filter(f => f.country === selectedCountry)
    }, [forwarders, selectedCountry])

    const displayedCountries = showAllCountries ? filteredCountries : filteredCountries.slice(0, 12)

    return (
        <div className="min-h-screen bg-[#050505] text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-28 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-1">CargoLink Network</p>
                        <h1 className="text-2xl font-bold text-white font-outfit">Global Agent Forwarders Distribution</h1>
                    </div>
                    <Link href="/forwarders/register" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/20 px-4 py-2 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10">
                        Become a Partner <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-sm mb-6">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setShowAllCountries(true) }}
                        placeholder="Search country or company..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-all"
                    />
                </div>

                <div className="flex gap-6">

                    {/* ── Left Panel ── */}
                    <div className="flex-1 min-w-0">

                        {/* A–Z tabs */}
                        <div className="flex flex-wrap gap-1 mb-5">
                            {ALPHABET.map(letter => {
                                const hasData = activeLetters.has(letter)
                                const isActive = activeLetter === letter
                                return (
                                    <button
                                        key={letter}
                                        onClick={() => {
                                            setActiveLetter(letter)
                                            setShowAllCountries(false)
                                            setSearch('')
                                            const first = allCountries.find(c => c.toUpperCase().startsWith(letter))
                                            if (first) setSelectedCountry(first)
                                            else setSelectedCountry(null)
                                        }}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            isActive
                                                ? 'bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                                                : hasData
                                                    ? 'bg-white/[0.06] text-zinc-300 hover:bg-white/10 hover:text-white'
                                                    : 'bg-white/[0.03] text-zinc-600 hover:bg-white/[0.05] hover:text-zinc-400'
                                        }`}
                                    >
                                        {letter}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Country grid */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="h-10 bg-white/[0.04] rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredCountries.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-2xl mb-2">🌍</p>
                                    <p className="text-sm font-semibold text-zinc-400 mb-1">
                                        {allCountries.length === 0 ? 'No partners registered yet' : `No partners under "${activeLetter}"`}
                                    </p>
                                    <p className="text-xs text-zinc-600">
                                        {allCountries.length === 0
                                            ? 'Partners will appear here once approved by admin'
                                            : 'Try a different letter or search by country name'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {displayedCountries.map(country => (
                                            <button
                                                key={country}
                                                onClick={() => setSelectedCountry(country)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all group ${
                                                    selectedCountry === country
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                                                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/20 hover:text-white hover:bg-white/[0.05]'
                                                }`}
                                            >
                                                <span className="text-lg leading-none flex-shrink-0">{getFlag(country)}</span>
                                                <span className="text-xs font-semibold truncate">{country}</span>
                                                {selectedCountry === country && (
                                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {filteredCountries.length > 12 && (
                                        <button
                                            onClick={() => setShowAllCountries(!showAllCountries)}
                                            className="w-full mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                                        >
                                            {showAllCountries ? 'Show Less' : `View More (${filteredCountries.length - 12} more)`}
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllCountries ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Stats bar */}
                        <div className="flex items-center gap-6 mt-4 px-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-zinc-500 font-mono">{forwarders.length} verified partners</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Globe className="w-3 h-3 text-zinc-600" />
                                <span className="text-[10px] text-zinc-500 font-mono">{allCountries.length} countries</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div className="w-72 flex-shrink-0">
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden sticky top-28">

                            {/* Country header */}
                            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-white/[0.06] px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl leading-none">{selectedCountry ? getFlag(selectedCountry) : '🌐'}</span>
                                    <div>
                                        <p className="text-base font-bold text-white font-outfit">
                                            {selectedCountry || 'Select a country'}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">{countryMembers.length} partner{countryMembers.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Members section */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Our Members</p>
                                    {countryMembers.length > 6 && (
                                        <button className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 hover:text-emerald-300">
                                            View more <ArrowRight className="w-2.5 h-2.5" />
                                        </button>
                                    )}
                                </div>

                                {countryMembers.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <MapPin className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                                        <p className="text-xs text-zinc-600">No partners in this country yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {countryMembers.slice(0, 6).map(fwd => (
                                            <button
                                                key={fwd.id}
                                                onClick={() => { setSelectedPartner(fwd); setIsModalOpen(true) }}
                                                title={fwd.company_name}
                                                className="aspect-square bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 rounded-xl flex items-center justify-center transition-all group overflow-hidden"
                                            >
                                                {fwd.logo_url ? (
                                                    <img
                                                        src={fwd.logo_url}
                                                        alt={fwd.company_name}
                                                        className="w-10 h-10 object-contain rounded-lg"
                                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-zinc-400">
                                                            {fwd.company_name.slice(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Member list (compact) */}
                                {countryMembers.length > 0 && (
                                    <div className="space-y-1.5 mb-4">
                                        {countryMembers.slice(0, 3).map(fwd => (
                                            <button
                                                key={fwd.id}
                                                onClick={() => { setSelectedPartner(fwd); setIsModalOpen(true) }}
                                                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.05] transition-all group text-left"
                                            >
                                                <Avatar src={fwd.logo_url || undefined} name={fwd.company_name} size="sm" shape="square" className="border-white/5 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] font-semibold text-white truncate">{fwd.company_name}</p>
                                                    {fwd.specializations && (
                                                        <p className="text-[9px] text-zinc-600 truncate">{fwd.specializations.split(',')[0]}</p>
                                                    )}
                                                </div>
                                                {fwd.website && (
                                                    <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 flex-shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Find Agent CTA */}
                                <button
                                    onClick={() => {
                                        if (countryMembers.length > 0) {
                                            setSelectedPartner(countryMembers[0])
                                            setIsModalOpen(true)
                                        }
                                    }}
                                    className="w-full bg-white text-black text-xs font-bold py-3 rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.98] tracking-wide"
                                >
                                    Find Agent
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Partners Grid (below) */}
                {!loading && selectedCountry && countryMembers.length > 3 && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-bold text-white">
                                All Partners in {selectedCountry}
                                <span className="ml-2 text-zinc-500 font-normal">({countryMembers.length})</span>
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {countryMembers.map(fwd => (
                                <button
                                    key={fwd.id}
                                    onClick={() => { setSelectedPartner(fwd); setIsModalOpen(true) }}
                                    className="bg-white/[0.02] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.05] rounded-2xl p-4 flex items-center gap-3 transition-all text-left group"
                                >
                                    <Avatar src={fwd.logo_url || undefined} name={fwd.company_name} size="md" shape="square" className="border-white/5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">{fwd.company_name}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Verified Partner</p>
                                        </div>
                                        {fwd.specializations && (
                                            <p className="text-[9px] text-zinc-600 truncate mt-0.5">{fwd.specializations}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
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
