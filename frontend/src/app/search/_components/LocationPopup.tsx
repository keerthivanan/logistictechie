'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search as SearchIcon, X, Globe, Loader2 } from 'lucide-react'
import { Location } from './types'
import { countries } from '@/lib/countries'

import { useT } from '@/lib/i18n/t'

interface LocationPopupProps {
    title: string
    data: Location
    setData: (d: Location) => void
    type: 'origin' | 'destination'
}

interface PortResult {
    name: string
    city: string
    code: string
    country: string
    country_code: string
    type: string
}

function getFlagEmoji(countryCode: string) {
    return String.fromCodePoint(
        ...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
    )
}

export function LocationPopup({ title, data, setData }: LocationPopupProps) {
    const t = useT()
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [portResults, setPortResults] = useState<PortResult[]>([])
    const [searching, setSearching] = useState(false)
    const timer = useRef<NodeJS.Timeout | null>(null)

    // Port search — pass country code to filter results when a country is selected
    useEffect(() => {
        if (search.length < 2) { setPortResults([]); return }
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(async () => {
            setSearching(true)
            try {
                const selectedCountryCode = data.country
                    ? countries.find(c => c.name === data.country)?.code || ''
                    : ''
                let path = `/api/references/ports/search?q=${encodeURIComponent(search)}`
                if (selectedCountryCode) path += `&country=${encodeURIComponent(selectedCountryCode)}`
                const res = await fetch(path)
                const json = await res.json()
                setPortResults(json.results || [])
            } catch { setPortResults([]) }
            finally { setSearching(false) }
        }, 250)
        return () => { if (timer.current) clearTimeout(timer.current) }
    }, [search, data.country])

    const selectPort = (port: PortResult) => {
        setData({
            ...data,
            city: port.code ? `${port.city} (${port.code})` : port.city,
            country: port.country,
        })
        setIsOpen(false)
        setSearch('')
        setPortResults([])
    }

    const selectCountry = async (countryName: string) => {
        setData({ ...data, country: countryName })
        // Auto-load top ports for the selected country
        setSearching(true)
        try {
            const code = countries.find(c => c.name === countryName)?.code || ''
            const res = await fetch(`/api/references/ports/search?q=&country=${encodeURIComponent(code)}`)
            const json = await res.json()
            setPortResults(json.results || [])
        } catch { setPortResults([]) }
        finally { setSearching(false) }
    }

    // Country list: filter only if user typed but no port results yet
    const showCountries = portResults.length === 0 && !searching
    const filteredCountries = countries.filter(c =>
        search.length < 2 ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative flex-1 group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex flex-col items-start p-8 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all text-left shadow-2xl relative overflow-hidden group/btn"
            >
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.3em] mb-4 group-hover/btn:text-white transition-colors">
                    {title}
                </span>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/btn:scale-110 transition-transform">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-white tracking-tighter">
                            {data.city || t('loc.select.port')}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                            {data.country
                                ? `${getFlagEmoji(countries.find(c => c.name === data.country)?.code || 'US')} ${data.country}`
                                : t('loc.global.network')}
                        </p>
                    </div>
                </div>
                <Globe className="absolute -bottom-10 -right-10 w-40 h-40 text-white/[0.02] group-hover/btn:text-white/[0.04] transition-colors" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => { setIsOpen(false); setSearch(''); setPortResults([]) }} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full mt-4 left-0 w-[420px] bg-zinc-900 border border-white/10 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,1)] z-[101] overflow-hidden"
                        >
                            <div className="p-6 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-inter">{title}</h4>
                                    <button onClick={() => { setIsOpen(false); setSearch(''); setPortResults([]) }} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                        <X className="w-4 h-4 text-zinc-500" />
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    {searching
                                        ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
                                        : <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    }
                                    <input
                                        type="text"
                                        placeholder={t('loc.search.placeholder')}
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-black border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-zinc-600 font-inter"
                                        autoFocus
                                    />
                                </div>

                                {/* Port results from Maersk API */}
                                {portResults.length > 0 && (
                                    <div className="space-y-1 max-h-[280px] overflow-y-auto">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-1 mb-2">{t('loc.ports.terminals')}</p>
                                        {portResults.map((p, i) => (
                                            <button key={i} onClick={() => selectPort(p)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left group">
                                                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                                                    <span className="text-[9px] font-bold text-zinc-500">{p.country_code}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-white font-inter truncate">{p.name}</span>
                                                        {p.code && (
                                                            <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex-shrink-0">{p.code}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-zinc-600 font-inter">{p.city !== p.name ? `${p.city} · ` : ''}{p.country}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* No results message */}
                                {search.length >= 2 && !searching && portResults.length === 0 && (
                                    <p className="text-xs text-zinc-600 text-center py-2 font-inter">{t('loc.no.ports')}</p>
                                )}

                                {/* Country filter (shown when no port search active) */}
                                {showCountries && (
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                            {search.length < 2 ? t('loc.select.country') : t('loc.countries')}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                            {filteredCountries.slice(0, 20).map(c => (
                                                <button key={c.code} onClick={() => selectCountry(c.name)}
                                                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${data.country === c.name ? 'bg-white border-white' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/20'}`}>
                                                    <span className="text-base">{getFlagEmoji(c.code)}</span>
                                                    <span className={`text-xs font-semibold truncate font-inter ${data.country === c.name ? 'text-black' : 'text-zinc-400'}`}>
                                                        {c.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Manual city entry */}
                                <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t('loc.enter.manually')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('loc.city.placeholder')}
                                        value={data.city}
                                        onChange={e => setData({ ...data, city: e.target.value })}
                                        className="w-full bg-black border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-semibold text-white placeholder-zinc-700 font-inter"
                                    />
                                </div>

                                <button
                                    onClick={() => { setIsOpen(false); setSearch(''); setPortResults([]) }}
                                    className="w-full bg-white text-black py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 active:scale-[0.98] transition-all"
                                >
                                    {t('loc.confirm')}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
