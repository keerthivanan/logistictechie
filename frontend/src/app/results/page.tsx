'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/config'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Ship, ArrowRight, AlertCircle, Zap, Loader2,
  X, CheckCircle2, ChevronRight, Clock, DollarSign,
  Shield, TrendingDown, SlidersHorizontal
} from 'lucide-react'
import { FullPageSpinner } from '@/components/ui/Spinner'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/lib/i18n/t'

function ResultsContent() {
  const t = useT()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()

  const [loading, setLoading]           = useState(true)
  const [quotes, setQuotes]             = useState<any[]>([])
  const [filteredQuotes, setFilteredQ]  = useState<any[]>([])
  const [error, setError]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [bookingIdx, setBookingIdx]     = useState<number | null>(null)
  const [sortBy, setSortBy]             = useState<'price' | 'transit'>('price')
  const [maxTransit, setMaxTransit]     = useState(45)
  const [selCarriers, setSelCarriers]   = useState<string[]>([])
  const [showFilters, setShowFilters]   = useState(false)

  useEffect(() => {
    if (!authLoading && user?.role === 'forwarder') router.push('/dashboard')
  }, [user, authLoading, router])

  const origin      = searchParams.get('origin')      || 'CNSHA'
  const destination = searchParams.get('destination') || 'USNYC'
  const container   = searchParams.get('container')   || '40FT'
  const value       = searchParams.get('value')
  const readyDate   = searchParams.get('readyDate')
  const isHazardous = searchParams.get('hazardous') === 'true'

  const shortOrigin = origin.includes('(') ? origin.split('(')[1]?.replace(')', '') || origin : origin
  const shortDest   = destination.includes('(') ? destination.split('(')[1]?.replace(')', '') || destination : destination
  const cityOrigin  = origin.includes('(') ? origin.split('(')[0].trim() : origin
  const cityDest    = destination.includes('(') ? destination.split('(')[0].trim() : destination

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        let commodity = searchParams.get('commodity') || 'General Cargo'
        if (!searchParams.get('commodity')) {
          if (isHazardous) commodity = 'Hazardous Goods'
          else if (value && parseFloat(value) > 50000) commodity = 'High Value Goods'
        }
        const token = localStorage.getItem('token')
        const res = await apiFetch('/api/quotes/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ origin, destination, container, commodity, ready_date: readyDate || new Date().toISOString().split('T')[0], goods_value: value ? parseFloat(value) : null }),
        })
        if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.detail || 'Failed') }
        const data = await res.json()
        const list = data.quotes || []
        setQuotes(list); setFilteredQ(list)
      } catch (e: any) { setError(e?.message || 'Unable to fetch rates.') }
      finally { setLoading(false) }
    }
    if (origin && destination) load()
  }, [origin, destination, container, isHazardous, readyDate, value])

  useEffect(() => {
    let f = [...quotes]
    if (selCarriers.length) f = f.filter(q => selCarriers.includes(q.carrier_name))
    f = f.filter(q => (q.transit_time_days || q.transit_time) <= maxTransit)
    f.sort((a, b) => sortBy === 'price' ? a.price - b.price : (a.transit_time_days || a.transit_time) - (b.transit_time_days || b.transit_time))
    setFilteredQ(f)
  }, [selCarriers, maxTransit, sortBy, quotes])

  const carriers     = Array.from(new Set(quotes.map(q => q.carrier_name))).filter(Boolean)
  const lowestPrice  = quotes.length ? Math.min(...quotes.map(q => q.price)) : 0
  const fastestDay   = quotes.length ? Math.min(...quotes.map(q => q.transit_time_days || q.transit_time)) : 0

  const handleBook = async (quote: any, idx: number) => {
    if (!user) { router.push('/login'); return }
    setSubmitting(true); setBookingIdx(idx); setError('')
    try {
      const token = localStorage.getItem('token')
      const mode = searchParams.get('mode') || 'FCL'
      const units = parseInt(searchParams.get('units') || '1')
      const cargoTypeMap: Record<string, string> = { FCL: 'FCL', LCL: 'LCL', Air: 'AIR', Truck: 'ROAD' }
      const cargoType = cargoTypeMap[mode] || 'FCL'
      const rawWeight = searchParams.get('weight') || '1000KG'
      const weightVal = parseFloat(rawWeight.replace(/[A-Za-z]/g, '')) || 1000
      const weightUnit = rawWeight.toUpperCase().includes('LB') ? 'LBR' : 'KGM'
      const commodity = searchParams.get('commodity') ||
        (isHazardous ? 'Hazardous Goods' : (value && parseFloat(value) > 50000 ? 'High Value Goods' : 'General Cargo'))
      const res = await apiFetch('/api/marketplace/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'client', origin, destination, cargo_type: cargoType,
          container_type: container, container_count: units, weight: weightVal, weight_unit: weightUnit,
          commodity, is_hazardous: isHazardous,
          needs_insurance: searchParams.get('personal') === 'true',
          pickup_ready_date: readyDate || new Date().toISOString().split('T')[0],
          vessel: quote.vessel_name || '', special_requirements: '',
        }),
      })
      const data = await res.json()
      if (res.ok && data.request_id) router.push(`/marketplace/${data.request_id}`)
      else setError(data.detail || 'Failed to submit.')
    } catch { setError('Network error.') }
    finally { setSubmitting(false); setBookingIdx(null) }
  }

  const lbl = 'block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2 font-inter'

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Top breadcrumb bar — matches search page navbar section ── */}
      <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-inter">
              ← {t('res.step.search')}
            </button>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5">
              <span className="text-[11px] font-black font-mono text-white">{shortOrigin}</span>
              <ArrowRight className="w-3 h-3 text-zinc-600" />
              <span className="text-[11px] font-black font-mono text-white">{shortDest}</span>
            </div>
            <span className="hidden sm:block text-[10px] font-bold text-zinc-700 uppercase tracking-widest">{container} · FCL</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            {[
              { label: t('res.step.search'), done: true },
              { label: t('res.step.results'), active: true },
              { label: t('res.step.booking') },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-5 h-px bg-white/[0.08]" />}
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                  s.done ? 'text-emerald-600' : (s as any).active ? 'bg-white text-black' : 'text-zinc-800'
                }`}>
                  {s.done && <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />}
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 rounded-3xl bg-[#0a0a0a] border border-white/[0.08] flex items-center justify-center relative">
            <Ship className="w-8 h-8 text-zinc-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Loader2 className="w-3.5 h-3.5 text-black animate-spin" />
            </div>
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-bold text-white font-outfit mb-1">{t('res.scanning')}</p>
            <p className="text-xs text-zinc-600 uppercase tracking-[0.25em] font-inter animate-pulse">{t('res.scanning.sub')}</p>
          </div>
        </div>

      ) : error && !quotes.length ? (
        <div className="max-w-4xl mx-auto px-4 py-28 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500/60" />
          </div>
          <p className="font-semibold text-white">{t('res.error.title')}</p>
          <p className="text-sm text-zinc-500 font-inter">{error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-100 transition-all">
            {t('res.retry')}
          </button>
        </div>

      ) : (
        <section className="px-4 py-10">
          <div className="max-w-4xl mx-auto space-y-4">

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-2 font-inter">{t('res.quotes.found')}</p>
              <div className="flex items-end gap-6 flex-wrap">
                <h1 className="text-4xl font-bold font-outfit tracking-tight text-white">{filteredQuotes.length} {t('res.step.results')}</h1>
                <div className="flex items-center gap-5 pb-1">
                  <div>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-0.5">{t('res.lowest.rate')}</span>
                    <span className="text-xl font-black font-mono text-emerald-400">${lowestPrice.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.08]" />
                  <div>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-0.5">{t('res.fastest')}</span>
                    <span className="text-xl font-black font-mono text-white">{fastestDay}d</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Main card — same style as search card ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden">

              {/* Filter strip */}
              <div className="p-6 flex items-center gap-3 flex-wrap border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mr-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-inter">{t('res.sort')}</span>
                </div>
                {([
                  { key: 'price',   label: t('res.sort.price'),   icon: DollarSign },
                  { key: 'transit', label: t('res.sort.transit'), icon: Zap },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setSortBy(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      sortBy === key ? 'bg-white text-black' : 'border border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/20'
                    }`}>
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}

                <div className="w-px h-5 bg-white/[0.08] mx-1" />

                {/* Carrier filters */}
                {carriers.map(c => (
                  <button key={c} onClick={() => setSelCarriers(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selCarriers.includes(c) ? 'bg-white text-black' : 'border border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/20'
                    }`}>
                    {selCarriers.includes(c) && <CheckCircle2 className="w-3 h-3" />}
                    {c}
                  </button>
                ))}

                {(selCarriers.length > 0 || maxTransit < 45) && (
                  <button onClick={() => { setSelCarriers([]); setMaxTransit(45) }}
                    className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 hover:text-zinc-300 ml-auto transition-colors">
                    <X className="w-3 h-3" /> {t('res.clear')}
                  </button>
                )}
              </div>

              {/* Quote rows */}
              {filteredQuotes.length > 0 ? (
                <div className="divide-y divide-white/[0.05]">
                  {filteredQuotes.map((quote, idx) => {
                    const isBest    = quote.price === lowestPrice
                    const isFastest = (quote.transit_time_days || quote.transit_time) === fastestDay
                    const transit   = quote.transit_time_days || quote.transit_time
                    const isLoading = bookingIdx === idx && submitting
                    const initials  = (quote.carrier_name || 'CL').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

                    return (
                      <motion.div key={idx}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.06 }}
                        className={`p-6 flex items-center gap-6 transition-colors group ${isBest ? 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.07]' : 'hover:bg-white/[0.02]'}`}
                      >
                        {/* Carrier avatar */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm font-mono flex-shrink-0 transition-all ${
                          isBest
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : 'bg-black border border-white/[0.08] text-zinc-500 group-hover:border-white/20 group-hover:text-zinc-300'
                        }`}>
                          {initials}
                        </div>

                        {/* Carrier name + badges */}
                        <div className="w-40 flex-shrink-0">
                          <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">{quote.carrier_name}</p>
                          <p className="text-[9px] text-zinc-700 font-mono mt-0.5 uppercase">{container}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {isBest && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-[8px] font-black text-emerald-400 uppercase">
                                <TrendingDown className="w-2 h-2" /> {t('res.best')}
                              </span>
                            )}
                            {isFastest && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase">
                                <Zap className="w-2 h-2" /> {t('res.fastest.badge')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Route */}
                        <div className="flex-1 flex items-center justify-center gap-4">
                          <div className="text-center">
                            <p className={`text-xl font-black font-mono tracking-tight leading-none ${isBest ? 'text-emerald-300' : 'text-white'}`}>{shortOrigin}</p>
                            <p className="text-[10px] text-zinc-500 font-inter mt-1 truncate max-w-[90px]">{cityOrigin}</p>
                            <p className="text-[8px] text-zinc-700 uppercase tracking-[0.18em] mt-0.5 font-inter">{t('res.departure')}</p>
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-1.5">
                            <span className={`text-[10px] font-bold font-mono flex items-center gap-1 ${isBest ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              <Clock className="w-2.5 h-2.5" /> {transit}d
                            </span>
                            <div className="w-full flex items-center">
                              <div className={`flex-1 h-px ${isBest ? 'bg-emerald-500/25' : 'bg-white/[0.08]'}`} />
                              <div className={`w-1.5 h-1.5 rounded-full mx-1 ${isBest ? 'bg-emerald-500/50' : 'bg-white/20'}`} />
                              <div className={`flex-1 h-px ${isBest ? 'bg-emerald-500/25' : 'bg-white/[0.08]'}`} />
                            </div>
                            <p className="text-[8px] text-zinc-700 uppercase tracking-[0.18em] font-inter">{t('res.transit.label')}</p>
                          </div>

                          <div className="text-center">
                            <p className="text-xl font-black font-mono text-white tracking-tight leading-none">{shortDest}</p>
                            <p className="text-[10px] text-zinc-500 font-inter mt-1 truncate max-w-[90px]">{cityDest}</p>
                            <p className="text-[8px] text-zinc-700 uppercase tracking-[0.18em] mt-0.5 font-inter">{t('res.arrival')}</p>
                          </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-inter mb-1">{t('res.all.in')}</p>
                            <p className={`text-2xl font-black font-mono tracking-tight ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                              <span className="text-sm font-bold text-zinc-500 mr-0.5">$</span>{quote.price.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1 justify-end mt-1">
                              <Shield className="w-2.5 h-2.5 text-zinc-700" />
                              <p className="text-[8px] text-zinc-700 uppercase tracking-wider">{t('res.all.inclusive')}</p>
                            </div>
                          </div>

                          <button onClick={() => handleBook(quote, idx)} disabled={submitting}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 whitespace-nowrap font-inter ${
                              isBest
                                ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.35)]'
                                : 'bg-white text-black hover:bg-zinc-100 shadow-[0_2px_16px_rgba(255,255,255,0.08)]'
                            }`}>
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>{t('res.book')} <ChevronRight className="w-3 h-3" /></>}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 font-inter mb-4">{t('res.no.quotes')}</p>
                  <button onClick={() => { setSelCarriers([]); setMaxTransit(45) }}
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border border-white/10 rounded-xl px-5 py-2.5 hover:border-white/25">
                    {t('res.clear')}
                  </button>
                </div>
              )}

              {/* Wisdom strip for best quote */}
              {filteredQuotes[0]?.wisdom && (
                <div className="px-6 py-3 border-t border-white/[0.05] flex items-start gap-2">
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5 flex-shrink-0">AI</span>
                  <p className="text-[10px] text-zinc-600 font-inter italic leading-relaxed">&ldquo;{filteredQuotes[0].wisdom}&rdquo;</p>
                </div>
              )}
            </motion.div>

            {/* Error */}
            {error && quotes.length > 0 && (
              <p className="text-xs text-red-400 text-center font-inter py-1">{error}</p>
            )}

            {/* Refine search */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-white font-inter mb-0.5">{t('res.not.right')}</p>
                <p className="text-[10px] text-zinc-500 font-inter">{t('res.refine.desc')}</p>
              </div>
              <button onClick={() => router.back()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.10] text-[10px] font-bold text-zinc-400 hover:text-white hover:border-white/25 transition-all whitespace-nowrap font-inter">
                ← {t('res.modify.search')}
              </button>
            </motion.div>

          </div>
        </section>
      )}
    </div>
  )
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
      <Navbar />
      <div className="pt-20">
        <Suspense fallback={<FullPageSpinner />}>
          <ResultsContent />
        </Suspense>
      </div>
    </div>
  )
}
