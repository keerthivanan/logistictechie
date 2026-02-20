'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search as SearchIcon, X, Globe } from 'lucide-react'
import { Location } from './types'
import { countries } from '@/lib/countries'

interface LocationPopupProps {
    title: string
    data: Location
    setData: (d: Location) => void
    type: 'origin' | 'destination'
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

export function LocationPopup({ title, data, setData, type }: LocationPopupProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative flex-1 group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex flex-col items-start p-8 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all text-left shadow-2xl relative overflow-hidden group/btn"
            >
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 group-hover/btn:text-white transition-colors">
                    {title}
                </span>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/btn:scale-110 transition-transform">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter">
                            {data.city || 'Select Port'}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                            {data.country ? `${getFlagEmoji(countries.find(c => c.name === data.country)?.code || 'US')} ${data.country}` : 'Global Network'}
                        </p>
                    </div>
                </div>

                {/* Aesthetic Background Watermark */}
                <Globe className="absolute -bottom-10 -right-10 w-40 h-40 text-white/[0.02] group-hover/btn:text-white/[0.04] transition-colors" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full mt-4 left-0 w-[400px] bg-zinc-900 border border-white/10 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,1)] z-[101] overflow-hidden backdrop-blur-3xl"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Select Location</h4>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                        <X className="w-4 h-4 text-zinc-500" />
                                    </button>
                                </div>

                                {/* Country Filter */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                        <input
                                            type="text"
                                            placeholder="Search Global Ports..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-8 text-xs font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredCountries.slice(0, 10).map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => {
                                                    setData({ ...data, country: c.name })
                                                }}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] ${data.country === c.name
                                                        ? 'bg-white border-white'
                                                        : 'bg-white/5 border-transparent hover:border-white/10'
                                                    }`}
                                            >
                                                <span className="text-lg">{getFlagEmoji(c.code)}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest truncate ${data.country === c.name ? 'text-black' : 'text-zinc-400'
                                                    }`}>
                                                    {c.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Port City Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Port (e.g. Shanghai)"
                                        value={data.city}
                                        onChange={(e) => setData({ ...data, city: e.target.value })}
                                        className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 text-lg font-black text-white focus:outline-none focus:border-emerald-500/50 transition-all uppercase tracking-tighter"
                                    />
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full bg-white text-black py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                                >
                                    Confirm Vector
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
