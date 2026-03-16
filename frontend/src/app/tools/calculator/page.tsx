'use client'

import { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { apiFetch } from '@/lib/config'
import {
    Calculator, MapPin, ArrowRight, ChevronDown,
    RefreshCw, TrendingUp, Clock,
    AlertTriangle, XCircle, Info, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

// ─── Port Autocomplete ────────────────────────────────────────────────────────
interface PortOption { name: string; code: string; country: string; country_code: string; type: string }

function PortInput({ label, value, onChange, onSelect, placeholder }: {
    label: string; value: string
    onChange: (v: string) => void; onSelect: (p: PortOption) => void; placeholder: string
}) {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<PortOption[]>([])
    const [searching, setSearching] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        if (value.length < 2) { setOptions([]); return }
        const id = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await apiFetch(`/api/references/ports/search?q=${encodeURIComponent(value)}`)
                const data = await res.json()
                setOptions(data.results || [])
            } catch { setOptions([]) }
            finally { setSearching(false) }
        }, 280)
        return () => clearTimeout(id)
    }, [value])

    return (
        <div ref={ref} className="relative space-y-1.5">
            <label className="block text-xs font-medium text-zinc-500 font-inter">{label}</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                <input type="text" value={value} autoComplete="off"
                    onChange={e => { onChange(e.target.value.toUpperCase()); setOpen(true) }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    className="w-full bg-black border border-white/5 pl-9 pr-3 py-2.5 rounded-lg text-sm font-medium text-white font-inter focus:border-white/20 outline-none"
                />
            </div>
            {open && (options.length > 0 || searching) && (
                <div className="absolute z-50 w-full mt-1 bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto">
                    {searching && <div className="px-4 py-3 text-xs text-zinc-600 font-inter animate-pulse">Searching ports...</div>}
                    {options.map(p => (
                        <button key={`${p.code}-${p.name}`} type="button"
                            onMouseDown={e => { e.preventDefault(); onSelect(p); setOpen(false) }}
                            className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors flex items-center gap-3 border-b border-white/[0.03] last:border-0">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-zinc-500">{p.country_code}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white font-mono">{p.code}</span>
                                    <span className="text-xs text-zinc-400 font-inter">{p.name}</span>
                                </div>
                                <span className="text-[11px] text-zinc-600 font-inter">{p.country} · {p.type}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface EstimateResult {
    cannot_ship: boolean; reason?: string
    lane?: any; freight?: any
    surcharges?: Record<string, number>; surcharges_total?: number; total_freight?: number
    customs?: any; total_landed?: number; market_range?: { low: number; high: number }
    warnings?: string[]
}

const QUICK_ROUTES = [
    { orig: 'CNSHA', orig_n: 'Shanghai', dest: 'USLAX', dest_n: 'Los Angeles' },
    { orig: 'CNSHA', orig_n: 'Shanghai', dest: 'DEHAM', dest_n: 'Hamburg' },
    { orig: 'INNSN', orig_n: 'Nhava Sheva', dest: 'USLAX', dest_n: 'Los Angeles' },
    { orig: 'CNNGB', orig_n: 'Ningbo', dest: 'NLRTM', dest_n: 'Rotterdam' },
    { orig: 'VNSGN', orig_n: 'Ho Chi Minh City', dest: 'USLAX', dest_n: 'Los Angeles' },
    { orig: 'SGSIN', orig_n: 'Singapore', dest: 'DEHAM', dest_n: 'Hamburg' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
    const [origCode, setOrigCode] = useState('CNSHA')
    const [origName, setOrigName] = useState('Shanghai')
    const [destCode, setDestCode] = useState('USLAX')
    const [destName, setDestName] = useState('Los Angeles')
    const [container, setContainer] = useState('40FT')
    const [commodity, setCommodity] = useState('General')
    const [goodsValue, setGoodsValue] = useState('50000')
    const [result, setResult] = useState<EstimateResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const calcRef = useRef<HTMLDivElement>(null)

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setApiError(null); setResult(null)
        try {
            const res = await apiFetch(`/api/tools/freight-estimate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin_locode: origCode, destination_locode: destCode,
                    origin_name: origName, destination_name: destName,
                    container_type: container, commodity,
                    goods_value: parseFloat(goodsValue) || 0,
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Estimation failed')
            setResult(data)
            setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
        } catch (err: any) { setApiError(err.message) }
        finally { setLoading(false) }
    }

    const applyRoute = (r: typeof QUICK_ROUTES[0]) => {
        setOrigCode(r.orig); setOrigName(r.orig_n)
        setDestCode(r.dest); setDestName(r.dest_n)
        setResult(null); setApiError(null)
    }

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-blue-500 selection:text-white">
            <Navbar />

            {/* ─── HERO ─── */}
            <section className="relative bg-black min-h-screen flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] font-inter mb-8">CargoLink Tools</p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter font-outfit uppercase mb-12 leading-[1.1] text-white max-w-4xl">
                        Freight Calculator
                    </h1>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-12">
                        {[{ v: '50+', l: 'Trade Lanes' }, { v: 'Q1 2025', l: 'Market Data' }, { v: 'Live', l: 'Sanctions Check' }].map(s => (
                            <div key={s.l} className="flex flex-col gap-1">
                                <div className="text-3xl md:text-4xl font-bold text-white tracking-tighter">{s.v}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">{s.l}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => calcRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center px-7 py-3.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-colors text-sm">
                        Calculate Rate <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* ─── CALCULATOR ─── */}
            <section ref={calcRef} className="py-24 bg-black border-t border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-12 items-center">

                        {/* FORM SIDE */}
                        <div className="w-full space-y-8">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-bold tracking-tight">Know your full <br /> landed cost.</h2>
                                <p className="text-zinc-400 leading-relaxed text-sm max-w-md">
                                    Rates from Drewry WCI, SCFI, and Xeneta Q1 2025. Includes ocean freight, BAF, EBS (Red Sea), CAF, THC origin/destination, B/L, AMS/ENS, and destination customs fees. Sanctions validated against 10 jurisdictions.
                                </p>
                                <p className="text-[11px] text-zinc-600 font-inter">Indicative only — verify with a licensed freight forwarder before booking.</p>
                            </div>

                            {/* Quick routes */}
                            <div>
                                <p className="text-xs font-medium text-zinc-500 font-inter mb-3">Quick Routes</p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_ROUTES.map(r => (
                                        <button key={`${r.orig}-${r.dest}`} type="button" onClick={() => applyRoute(r)}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-inter transition-all ${origCode === r.orig && destCode === r.dest ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-500 hover:border-white/30 hover:text-white'}`}>
                                            {r.orig_n} → {r.dest_n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCalculate} className="bg-zinc-950 border border-white/5 rounded-3xl p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <PortInput label="Origin Port" value={origCode} placeholder="Type city or LOCODE…"
                                        onChange={v => { setOrigCode(v); setOrigName(v); setResult(null) }}
                                        onSelect={p => { setOrigCode(p.code); setOrigName(p.name); setResult(null) }} />
                                    <PortInput label="Destination Port" value={destCode} placeholder="Type city or LOCODE…"
                                        onChange={v => { setDestCode(v); setDestName(v); setResult(null) }}
                                        onSelect={p => { setDestCode(p.code); setDestName(p.name); setResult(null) }} />
                                </div>
                                {(origName.length > 5 || destName.length > 5) && origName !== origCode && (
                                    <div className="text-[9px] text-zinc-600 font-inter flex items-center gap-2 -mt-1">
                                        <span>{origName} ({origCode})</span>
                                        <ArrowRight className="w-3 h-3 text-zinc-800" />
                                        <span>{destName} ({destCode})</span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-zinc-500 font-inter">Container Type</label>
                                    <div className="flex rounded-lg border border-white/5 overflow-hidden bg-black">
                                        {['20FT', '40FT', '40HC', '45HC'].map(t => (
                                            <button key={t} type="button" onClick={() => { setContainer(t); setResult(null) }}
                                                className={`flex-1 py-2.5 text-xs font-semibold uppercase transition-all font-inter ${container === t ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                                                {t.replace('FT', "'")}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-zinc-500 font-inter">Commodity</label>
                                    <div className="relative">
                                        <select value={commodity} onChange={e => { setCommodity(e.target.value); setResult(null) }}
                                            className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm font-medium text-white font-inter focus:border-white/20 outline-none appearance-none cursor-pointer">
                                            <option value="General" className="bg-zinc-900">General Cargo</option>
                                            <option value="Hazardous" className="bg-zinc-900">Hazardous / IMDG (+38% + DGF $350)</option>
                                            <option value="Refrigerated" className="bg-zinc-900">Refrigerated / Reefer (+88%)</option>
                                            <option value="Valuable" className="bg-zinc-900">High Value / Insured (+25%)</option>
                                            <option value="OOG" className="bg-zinc-900">Out of Gauge — OOG (+45%)</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-zinc-500 font-inter">Commercial Invoice Value (USD)</label>
                                    <div className="flex bg-black border border-white/5 rounded-lg items-center px-3 focus-within:border-white/20 transition-all">
                                        <span className="text-zinc-600 font-medium text-sm font-inter mr-2">$</span>
                                        <input type="number" value={goodsValue} onChange={e => setGoodsValue(e.target.value)}
                                            className="w-full bg-transparent py-2.5 text-sm font-medium text-white font-inter outline-none" />
                                    </div>
                                    <p className="text-[11px] text-zinc-600 font-inter">Used for MPF, duty, and VAT/GST calculations</p>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full bg-white text-black py-3 rounded-lg font-bold text-sm shadow-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 font-inter disabled:opacity-50">
                                    {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Calculating…</> : <><RefreshCw className="w-3.5 h-3.5" /> Calculate Full Landed Cost</>}
                                </button>
                            </form>
                        </div>

                        {/* RESULTS SIDE */}
                        <div className="w-full">
                            {apiError && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4">
                                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-400 font-inter leading-relaxed">{apiError}</p>
                                </div>
                            )}

                            {result?.cannot_ship && (
                                <div className="bg-red-950/40 border border-red-500/30 rounded-3xl p-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider font-outfit">Route Not Serviceable</h3>
                                    </div>
                                    <p className="text-sm text-zinc-400 font-inter leading-relaxed">{result.reason}</p>
                                    <div className="pt-4 border-t border-red-500/20">
                                        <Link href="/services/customs-compliance" className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest font-inter">
                                            Talk to our compliance team →
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {result && !result.cannot_ship && (
                                <div className="space-y-4">
                                    {/* Warnings */}
                                    {result.warnings && result.warnings.length > 0 && (
                                        <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-5 space-y-2">
                                            {result.warnings.map((w, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                    <p className="text-xs text-amber-400/80 font-inter leading-relaxed">{w}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Total landed */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.025]"><Calculator className="w-40 h-40" /></div>
                                        <p className="text-xs font-medium text-zinc-500 font-inter mb-2">Total Estimated Landed Cost</p>
                                        <div className="flex items-baseline gap-3 mb-3">
                                            <span className="text-5xl font-bold font-outfit tracking-tighter">${result.total_landed?.toLocaleString()}</span>
                                            <span className="text-lg text-zinc-500 font-bold font-inter">USD</span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xs text-zinc-600 font-inter">Market range:</span>
                                            <span className="text-xs font-bold text-zinc-400 font-mono">${result.market_range?.low.toLocaleString()} – ${result.market_range?.high.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-6 pt-3 border-t border-white/5">
                                            {[
                                                { l: 'Via', v: result.lane?.via },
                                                { l: 'Transit', v: `${result.lane?.transit_days} days (est.)` },
                                                { l: 'Source', v: 'Drewry / SCFI / Xeneta Q1 2025' },
                                            ].map(x => (
                                                <div key={x.l}>
                                                    <p className="text-[10px] text-zinc-600 font-inter">{x.l}</p>
                                                    <p className="text-xs font-bold text-zinc-400">{x.v}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ocean + surcharges */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
                                        <p className="text-xs font-medium text-zinc-500 font-inter mb-5">Ocean Freight + Surcharges</p>
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-400 font-inter">Ocean Freight (avg spot, {result.freight?.container_type})</span>
                                                <div className="text-right">
                                                    <span className="font-mono text-white text-xs font-bold">${result.freight?.ocean_avg.toLocaleString()}</span>
                                                    <span className="text-[10px] text-zinc-600 ml-2">(${result.freight?.ocean_low.toLocaleString()}–${result.freight?.ocean_high.toLocaleString()})</span>
                                                </div>
                                            </div>
                                            {result.surcharges && Object.entries(result.surcharges).map(([k, v]) => (
                                                v > 0 && (
                                                    <div key={k} className="flex justify-between items-center">
                                                        <span className="text-xs text-zinc-500 font-inter">{k}</span>
                                                        <span className={`font-mono text-xs font-bold ${k.includes('Red Sea') ? 'text-amber-400' : 'text-zinc-300'}`}>${v.toLocaleString()}</span>
                                                    </div>
                                                )
                                            ))}
                                            <div className="h-px bg-white/5 my-1" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-300 font-bold font-inter">Total Freight Cost</span>
                                                <span className="font-mono text-white text-xs font-bold">${result.total_freight?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customs */}
                                    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] font-inter">{result.customs?.authority}</p>
                                            <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Destination Customs</span>
                                        </div>
                                        <div className="space-y-2.5 mb-5">
                                            {result.customs?.line_items.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center">
                                                    <span className="text-xs text-zinc-500 font-inter">{item.label}</span>
                                                    <span className="font-mono text-purple-300 text-xs font-bold">${item.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="h-px bg-white/5 my-1" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-300 font-bold font-inter">Total Customs Cost</span>
                                                <span className="font-mono text-purple-400 text-xs font-bold">${result.customs?.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 space-y-1.5">
                                            <p className="text-xs font-medium text-zinc-600 font-inter flex items-center gap-2"><Info className="w-3 h-3" /> Regulatory Notes</p>
                                            {result.customs?.regulatory_notes.map((note: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] text-zinc-600 font-inter leading-relaxed">{note}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Link href="/search" className="block w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-500 transition-all text-center font-inter shadow-xl">
                                        Get Live Competitive Quotes
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURE CARDS ─── */}
            <section className="py-24 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">What's Included</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { title: 'Real Market Rates', desc: 'Drewry World Container Index, Shanghai Containerized Freight Index, and Xeneta Q1 2025 — not guesswork. Low–high spot range for every lane.' },
                            { title: 'Full Surcharge Stack', desc: 'BAF, EBS (Red Sea surcharge +$420 where applicable), CAF 2%, THC origin & destination, B/L issuance, VGM, AMS/ENS — every carrier line item.' },
                            { title: 'Sanctions + Customs', desc: 'Routes to Iran, Russia, North Korea, Syria, Cuba and 6 other sanctioned jurisdictions are blocked instantly. Destination customs fees calculated per actual country framework.' },
                        ].map(f => (
                            <div key={f.title} className="space-y-4">
                                <h3 className="text-xl font-bold text-white">{f.title}</h3>
                                <p className="text-zinc-500 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-32 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready for real rates?</h2>
                    <p className="text-xl text-zinc-400 mb-10">Post your shipment and receive live quotes from verified freight forwarders within hours.</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/search" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all">Get Live Quotes</Link>
                        <Link href="/services/ocean-freight" className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all">Ocean Services</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
