'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Ship, Package, Plane, Truck, ArrowRight, Calendar,
    AlertTriangle, CheckSquare, Square, Loader2
} from 'lucide-react'
import { FullPageSpinner } from '@/components/ui/Spinner'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/lib/i18n/t'
import { countries } from '@/lib/countries'
import PortAutocomplete, { PortResult } from '@/components/forms/PortAutocomplete'

const CONTAINER_TYPES = [
    { value: '20GP', label: "20' Std" },
    { value: '40GP', label: "40' Std" },
    { value: '40HC', label: "40' HC" },
    { value: '20RF', label: "20' Reefer" },
    { value: '40RF', label: "40' Reefer" },
    { value: 'OpenTop', label: 'Open Top' },
    { value: 'FlatRack', label: 'Flat Rack' },
    { value: 'Tank', label: 'Tank' },
]

const getFlagEmoji = (code: string) => {
    if (!code) return '🌐'
    return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)))
}

export default function SearchPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const t = useT()

    useEffect(() => {
        if (!authLoading && user?.role === 'forwarder') router.push('/dashboard')
    }, [user, authLoading, router])

    // ── Route ──
    const [originCountry, setOriginCountry] = useState('CN')
    const [originCity, setOriginCity] = useState('')
    const [destCountry, setDestCountry] = useState('US')
    const [destCity, setDestCity] = useState('')

    // ── Load ──
    const [mode, setMode] = useState<'FCL' | 'LCL' | 'Air' | 'Truck'>('FCL')
    const [containerType, setContainerType] = useState('40GP')
    const [units, setUnits] = useState(1)
    const [weight, setWeight] = useState('')
    const [weightUnit, setWeightUnit] = useState<'KG' | 'LB'>('KG')
    const [volume, setVolume] = useState('')
    const [dimL, setDimL] = useState('')
    const [dimW, setDimW] = useState('')
    const [dimH, setDimH] = useState('')
    const [dimUnit, setDimUnit] = useState<'CM' | 'IN'>('CM')

    // ── Details ──
    const [readyDate, setReadyDate] = useState('')
    const [isHazardous, setIsHazardous] = useState(false)
    const [isPersonal, setIsPersonal] = useState(false)

    // ── Validation ──
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const originCountryName = countries.find(c => c.code === originCountry)?.name || ''
    const destCountryName = countries.find(c => c.code === destCountry)?.name || ''

    const handlePortSelect = (side: 'origin' | 'dest') => (result: PortResult) => {
        const display = result.code ? `${result.city} (${result.code})` : result.city
        if (side === 'origin') setOriginCity(display)
        else setDestCity(display)
    }

    const handleSearch = () => {
        setError('')
        if (isSubmitting) return
        if (!originCity.trim()) { setError(t('search.err.origin')); return }
        if (!destCity.trim()) { setError(t('search.err.dest')); return }

        // Same location check
        const normalize = (s: string) => s.toLowerCase().replace(/\s*\(.*?\)/g, '').trim()
        if (originCountry === destCountry && normalize(originCity) === normalize(destCity)) {
            setError(t('search.err.same'))
            return
        }

        if (mode === 'FCL' && !containerType) { setError(t('search.err.container')); return }
        if ((mode === 'LCL' || mode === 'Air') && !weight) { setError(t('search.err.weight')); return }

        const params: Record<string, string> = {
            origin: originCity,
            destination: destCity,
            origin_country: originCountryName,
            dest_country: destCountryName,
            mode,
            container: mode === 'FCL' ? containerType : mode,
            units: String(units),
        }
        if (weight) params.weight = `${weight}${weightUnit}`
        if (volume) params.volume = volume
        if (dimL && dimW && dimH) params.dims = `${dimL}x${dimW}x${dimH}${dimUnit}`
        if (readyDate) params.readyDate = readyDate
        if (isHazardous) params.hazardous = 'true'
        if (isPersonal) params.personal = 'true'

        setIsSubmitting(true)
        router.push(`/results?${new URLSearchParams(params).toString()}`)
    }

    if (authLoading) return <FullPageSpinner />

    const lbl = 'block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2 font-inter'
    const inp = 'w-full bg-black border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter focus:border-zinc-600 outline-none transition-colors'
    const sel = 'w-full bg-black border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white appearance-none font-inter cursor-pointer focus:border-zinc-600 outline-none transition-colors'
    const divider = 'border-t border-white/[0.06]'

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />

            {/* ── Hero ── */}
            <section className="pt-32 pb-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 font-inter">{t('search.label')}</p>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-outfit uppercase mb-3">
                            {t('search.h1.1')}<br className="hidden sm:block" /> {t('search.h1.2')}
                        </h1>
                        <p className="text-sm text-zinc-500 font-inter max-w-md mx-auto">
                            {t('search.sub')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Search Card ── */}
            <section className="px-4 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="max-w-4xl mx-auto bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden"
                >

                    {/* ── 1. ROUTE ── */}
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Ship className="w-3.5 h-3.5 text-emerald-500" />
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] font-inter">{t('search.route')}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">

                            {/* Origin */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <span className="text-xs font-bold text-zinc-300 font-inter">{t('search.origin')}</span>
                                </div>
                                <div>
                                    <label className={lbl}>{t('search.country')}</label>
                                    <select
                                        value={originCountry}
                                        onChange={e => { setOriginCountry(e.target.value); setOriginCity('') }}
                                        className={sel}
                                    >
                                        {countries.map(c => (
                                            <option key={c.code} value={c.code} className="bg-zinc-900">
                                                {getFlagEmoji(c.code)} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>{t('search.port')}</label>
                                    <PortAutocomplete
                                        name="origin_city"
                                        value={originCity}
                                        onChange={(_, v) => setOriginCity(v)}
                                        onSelect={handlePortSelect('origin')}
                                        countryCode={originCountry}
                                        countryName={originCountryName}
                                        placeholder={`Search ${originCountryName} ports...`}
                                        termType="CY"
                                    />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-zinc-500 flex-shrink-0" />
                                    <span className="text-xs font-bold text-zinc-300 font-inter">{t('search.destination')}</span>
                                </div>
                                <div>
                                    <label className={lbl}>{t('search.country')}</label>
                                    <select
                                        value={destCountry}
                                        onChange={e => { setDestCountry(e.target.value); setDestCity('') }}
                                        className={sel}
                                    >
                                        {countries.map(c => (
                                            <option key={c.code} value={c.code} className="bg-zinc-900">
                                                {getFlagEmoji(c.code)} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>{t('search.port')}</label>
                                    <PortAutocomplete
                                        name="dest_city"
                                        value={destCity}
                                        onChange={(_, v) => setDestCity(v)}
                                        onSelect={handlePortSelect('dest')}
                                        countryCode={destCountry}
                                        countryName={destCountryName}
                                        placeholder={`Search ${destCountryName} ports...`}
                                        termType="CY"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── 2. LOAD ── */}
                    <div className={`p-8 ${divider}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <Package className="w-3.5 h-3.5 text-zinc-400" />
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] font-inter">{t('search.load')}</p>
                        </div>

                        {/* Mode tabs */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {([
                                { value: 'FCL', label: 'FCL', sub: t('search.mode.fcl.sub'), Icon: Ship },
                                { value: 'LCL', label: 'LCL', sub: t('search.mode.lcl.sub'), Icon: Package },
                                { value: 'Air', label: 'Air', sub: t('search.mode.air.sub'), Icon: Plane },
                                { value: 'Truck', label: 'Road', sub: t('search.mode.truck.sub'), Icon: Truck },
                            ] as const).map(({ value, label, sub, Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => { setMode(value); setContainerType('40GP') }}
                                    className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all ${mode === value ? 'bg-white text-black border-white' : 'border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-bold font-inter">{label}</span>
                                    <span className={`text-[9px] font-inter ${mode === value ? 'text-zinc-500' : 'text-zinc-700'}`}>{sub}</span>
                                </button>
                            ))}
                        </div>

                        {/* FCL */}
                        {mode === 'FCL' && (
                            <div className="space-y-5">
                                <div>
                                    <label className={lbl}>{t('search.container.type')}</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {CONTAINER_TYPES.map(ct => (
                                            <button key={ct.value} type="button"
                                                onClick={() => setContainerType(ct.value)}
                                                className={`py-2.5 rounded-xl border text-[10px] font-semibold font-inter transition-all ${containerType === ct.value ? 'bg-white text-black border-white' : 'border-white/[0.08] text-zinc-600 hover:border-white/20 hover:text-zinc-400'}`}>
                                                {ct.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>{t('search.num.containers')}</label>
                                        <input type="number" min="1" value={units}
                                            onChange={e => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                                            className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>{t('search.gross.weight')}</label>
                                        <div className="flex">
                                            <input type="number" min="0" value={weight} placeholder="e.g. 18000"
                                                onChange={e => setWeight(e.target.value)}
                                                className="flex-1 bg-black border border-white/[0.06] border-r-0 rounded-l-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter outline-none" />
                                            <select value={weightUnit} onChange={e => setWeightUnit(e.target.value as any)}
                                                className="bg-zinc-900 border border-white/[0.06] border-l-0 rounded-r-xl px-3 text-xs font-bold text-zinc-400 font-inter cursor-pointer outline-none">
                                                <option value="KG">KG</option>
                                                <option value="LB">LB</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LCL / Air */}
                        {(mode === 'LCL' || mode === 'Air') && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={lbl}>{t('search.units')}</label>
                                        <input type="number" min="1" value={units}
                                            onChange={e => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                                            className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>{t('search.total.weight')}</label>
                                        <div className="flex">
                                            <input type="number" min="0" value={weight} placeholder="e.g. 500"
                                                onChange={e => setWeight(e.target.value)}
                                                className="flex-1 bg-black border border-white/[0.06] border-r-0 rounded-l-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter outline-none" />
                                            <select value={weightUnit} onChange={e => setWeightUnit(e.target.value as any)}
                                                className="bg-zinc-900 border border-white/[0.06] border-l-0 rounded-r-xl px-3 text-xs font-bold text-zinc-400 font-inter cursor-pointer outline-none">
                                                <option value="KG">KG</option>
                                                <option value="LB">LB</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={lbl}>{t('search.volume')}</label>
                                        <input type="number" step="0.01" min="0" value={volume} placeholder="e.g. 3.5"
                                            onChange={e => setVolume(e.target.value)}
                                            className={inp} />
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>{t('search.dims')}</label>
                                    <div className="flex gap-2">
                                        {[{ v: dimL, s: setDimL, p: 'L' }, { v: dimW, s: setDimW, p: 'W' }, { v: dimH, s: setDimH, p: 'H' }].map(({ v, s, p }) => (
                                            <input key={p} type="number" min="0" placeholder={p} value={v}
                                                onChange={e => s(e.target.value)}
                                                className="flex-1 bg-black border border-white/[0.06] rounded-xl px-3 py-3 text-sm text-white placeholder-zinc-700 font-inter text-center outline-none" />
                                        ))}
                                        <select value={dimUnit} onChange={e => setDimUnit(e.target.value as any)}
                                            className="bg-zinc-900 border border-white/[0.06] rounded-xl px-3 text-xs font-bold text-zinc-400 font-inter cursor-pointer outline-none min-w-[60px]">
                                            <option value="CM">CM</option>
                                            <option value="IN">IN</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Truck */}
                        {mode === 'Truck' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>{t('search.num.trucks')}</label>
                                    <input type="number" min="1" value={units}
                                        onChange={e => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                                        className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>{t('search.total.weight.opt')}</label>
                                    <div className="flex">
                                        <input type="number" min="0" value={weight} placeholder="e.g. 5000"
                                            onChange={e => setWeight(e.target.value)}
                                            className="flex-1 bg-black border border-white/[0.06] border-r-0 rounded-l-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter outline-none" />
                                        <select value={weightUnit} onChange={e => setWeightUnit(e.target.value as any)}
                                            className="bg-zinc-900 border border-white/[0.06] border-l-0 rounded-r-xl px-3 text-xs font-bold text-zinc-400 font-inter cursor-pointer outline-none">
                                            <option value="KG">KG</option>
                                            <option value="LB">LB</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── 3. DETAILS + SUBMIT ── */}
                    <div className={`p-8 ${divider}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] font-inter">{t('search.details')}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            {/* Ready date */}
                            <div>
                                <label className={lbl}>{t('search.ready')}</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                    <input type="date" value={readyDate}
                                        onChange={e => setReadyDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full bg-black border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white font-inter focus:border-zinc-600 outline-none transition-colors" />
                                </div>
                            </div>

                            {/* Hazardous */}
                            <div>
                                <label className={lbl}>{t('search.flags')}</label>
                                <div className="space-y-2">
                                    <button type="button" onClick={() => setIsHazardous(v => !v)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${isHazardous ? 'border-red-500/30 bg-red-500/[0.06]' : 'border-white/[0.06] hover:border-white/15'}`}>
                                        {isHazardous
                                            ? <CheckSquare className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            : <Square className="w-4 h-4 text-zinc-600 flex-shrink-0" />}
                                        <span className={`text-xs font-semibold font-inter ${isHazardous ? 'text-red-300' : 'text-zinc-500'}`}>{t('search.hazardous')}</span>
                                    </button>
                                    <button type="button" onClick={() => setIsPersonal(v => !v)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${isPersonal ? 'border-blue-500/30 bg-blue-500/[0.06]' : 'border-white/[0.06] hover:border-white/15'}`}>
                                        {isPersonal
                                            ? <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            : <Square className="w-4 h-4 text-zinc-600 flex-shrink-0" />}
                                        <span className={`text-xs font-semibold font-inter ${isPersonal ? 'text-blue-300' : 'text-zinc-500'}`}>{t('search.personal')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Summary preview */}
                            <div className="bg-black border border-white/[0.06] rounded-xl p-4 space-y-2">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">{t('search.summary')}</p>
                                <p className="text-xs font-semibold text-white font-inter truncate">
                                    {originCity || <span className="text-zinc-700">{t('search.origin.placeholder')}</span>}
                                </p>
                                <p className="text-[9px] text-zinc-600 font-inter">↓</p>
                                <p className="text-xs font-semibold text-white font-inter truncate">
                                    {destCity || <span className="text-zinc-700">{t('search.dest.placeholder')}</span>}
                                </p>
                                <div className="pt-1 border-t border-white/[0.06]">
                                    <p className="text-[9px] text-zinc-600 font-inter font-bold uppercase tracking-widest">
                                        {mode}{mode === 'FCL' ? ` · ${containerType} · ${units} unit${units > 1 ? 's' : ''}` : units > 1 ? ` · ${units} units` : ''}
                                        {weight ? ` · ${weight}${weightUnit}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span className="text-xs text-red-400 font-inter font-semibold">{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={isSubmitting}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 text-sm tracking-wide font-inter active:scale-[0.99] shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('search.finding')}
                                </>
                            ) : (
                                <>
                                    {t('search.cta')} <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-zinc-700 font-inter mt-3">
                            {t('search.free')}
                        </p>
                    </div>

                </motion.div>
            </section>

            {/* ── Below-fold content ── */}
            <section className="px-4 pb-24 max-w-4xl mx-auto space-y-4 mt-4">

                {/* What you get */}
                <div className="grid grid-cols-3 gap-4">
                    {([
                        { step: '01', titleKey: 'search.how1.title', descKey: 'search.how1.desc' },
                        { step: '02', titleKey: 'search.how2.title', descKey: 'search.how2.desc' },
                        { step: '03', titleKey: 'search.how3.title', descKey: 'search.how3.desc' },
                    ] as const).map(item => (
                        <div key={item.step} className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                            <span className="text-[10px] font-mono font-bold text-zinc-600">{item.step}</span>
                            <h3 className="text-sm font-bold text-white font-inter">{t(item.titleKey)}</h3>
                            <p className="text-xs text-zinc-500 font-inter leading-relaxed">{t(item.descKey)}</p>
                        </div>
                    ))}
                </div>

                {/* Stats relevant to instant search */}
                <div className="grid grid-cols-3 gap-4">
                    {([
                        { valueKey: 'search.stat1', label: 'Trade Lanes' },
                        { valueKey: 'search.stat2', label: 'Rate Response Time' },
                        { valueKey: 'search.stat3', label: 'Supported Modes' },
                    ] as const).map(stat => (
                        <div key={stat.label} className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 text-center">
                            <p className="text-2xl font-bold text-white font-mono">{t(stat.valueKey)}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-inter mt-2">{stat.label}</p>
                        </div>
                    ))}
                </div>

            </section>
        </div>
    )
}
