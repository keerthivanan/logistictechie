'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/config'
import { useRouter, useSearchParams } from 'next/navigation'
import { Ship, ArrowRight, AlertCircle, ArrowUpDown, Zap } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/context/AuthContext'

function ResultsContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()

  const [loading, setLoading]               = useState(true)
  const [quotes, setQuotes]                 = useState<any[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([])
  const [error, setError]                   = useState('')
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [maxTransitTime, setMaxTransitTime] = useState(45)
  const [sortBy, setSortBy]                 = useState<'price' | 'transit'>('price')

  useEffect(() => {
    if (!authLoading && user?.role === 'forwarder') router.push('/dashboard')
  }, [user, authLoading, router])

  const origin      = searchParams.get('origin')    || 'CNSHA'
  const destination = searchParams.get('destination') || 'USNYC'
  const container   = searchParams.get('container')  || '40FT'
  const value       = searchParams.get('value')
  const readyDate   = searchParams.get('readyDate')
  const isHazardous = searchParams.get('hazardous') === 'true'

  useEffect(() => {
    async function fetchQuotes() {
      try {
        setLoading(true)
        let commodity = 'General Cargo'
        if (isHazardous) commodity = 'Hazardous Goods'
        else if (value && parseFloat(value) > 50000) commodity = 'High Value Goods'

        const token = localStorage.getItem('token')
        const res = await apiFetch('/api/quotes/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            origin, destination, container, commodity,
            ready_date: readyDate || new Date().toISOString().split('T')[0],
            goods_value: value ? parseFloat(value) : null,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.detail || 'Failed to fetch rates')
        }
        const data = await res.json()
        const list = data.quotes || []
        setQuotes(list)
        setFilteredQuotes(list)
      } catch (err: any) {
        setError(err?.message || 'Unable to fetch rates. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    if (origin && destination) fetchQuotes()
  }, [origin, destination, container, isHazardous, readyDate, value])

  useEffect(() => {
    let f = [...quotes]
    if (selectedCarriers.length > 0) f = f.filter(q => selectedCarriers.includes(q.carrier_name))
    f = f.filter(q => (q.transit_time_days || q.transit_time) <= maxTransitTime)
    if (sortBy === 'price') f.sort((a, b) => a.price - b.price)
    else f.sort((a, b) => (a.transit_time_days || a.transit_time) - (b.transit_time_days || b.transit_time))
    setFilteredQuotes(f)
  }, [selectedCarriers, maxTransitTime, sortBy, quotes])

  const uniqueCarriers = Array.from(new Set(quotes.map(q => q.carrier_name))).filter(Boolean)

  const handleSelectQuote = (quote: any) => {
    const query = new URLSearchParams({
      quoteId: quote.id || '',
      carrier: quote.carrier_name,
      price: quote.price,
      origin: quote.origin_locode || origin,
      destination: quote.dest_locode || destination,
      container,
      transit: quote.transit_time_days || quote.transit_time,
      vessel: quote.vessel_name || 'TBD',
      wisdom: quote.wisdom || '',
      breakdown: JSON.stringify(quote.breakdown || {}),
    }).toString()
    router.push('/marketplace')
  }

  return (
    <>
      {/* Header bar */}
      <div className="bg-black border-b border-white/5 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Route</span>
              <span className="text-white font-black font-mono text-sm tracking-tight">{origin}</span>
              <ArrowRight className="w-3 h-3 text-zinc-600" />
              <span className="text-white font-black font-mono text-sm tracking-tight">{destination}</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-inter">{container} · FCL</span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: 'Search', done: true },
                { label: 'Results', done: false, active: true },
                { label: 'Booking', done: false },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  {i > 0 && <div className="h-px w-8 bg-white/10" />}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step.done ? 'bg-white text-black' : step.active ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest font-inter ${step.active ? 'text-white' : step.done ? 'text-zinc-500' : 'text-zinc-700'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-6" />
          <p className="text-base font-bold text-white font-outfit uppercase tracking-tight mb-2">Finding the best rates...</p>
          <p className="text-xs text-zinc-500 font-inter">Searching live carrier rates for your route.</p>
        </div>

      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <AlertCircle className="w-12 h-12 text-red-500/60 mx-auto mb-4" />
          <p className="text-base font-bold text-white mb-2">Something went wrong</p>
          <p className="text-xs text-zinc-500 font-inter mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-widest text-white underline font-inter">Retry</button>
        </div>

      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="w-full lg:w-56 flex-shrink-0 hidden lg:block">
              <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-5 sticky top-24 space-y-6">

                {/* Sort */}
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-3">Sort By</p>
                  <div className="space-y-1.5">
                    {([
                      { key: 'price', label: 'Lowest Price', icon: ArrowUpDown },
                      { key: 'transit', label: 'Fastest Transit', icon: Zap },
                    ] as const).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setSortBy(key)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold font-inter transition-all ${sortBy === key ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'}`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Carrier filter */}
                {uniqueCarriers.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-3">Carrier</p>
                    <div className="space-y-2">
                      {uniqueCarriers.map(c => (
                        <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCarriers.includes(c)}
                            onChange={e => {
                              if (e.target.checked) setSelectedCarriers([...selectedCarriers, c])
                              else setSelectedCarriers(selectedCarriers.filter(x => x !== c))
                            }}
                            className="w-3.5 h-3.5 rounded border-white/10 bg-black checked:bg-white focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-[11px] font-medium font-inter transition-colors ${selectedCarriers.includes(c) ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transit filter */}
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-3">Max Transit: {maxTransitTime}d</p>
                  <input
                    type="range" min="15" max="45" value={maxTransitTime}
                    onChange={e => setMaxTransitTime(parseInt(e.target.value))}
                    className="w-full h-px bg-white/10 rounded appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-700 mt-1.5 font-inter">
                    <span>15d</span><span>45d</span>
                  </div>
                </div>

                {(selectedCarriers.length > 0 || maxTransitTime < 45) && (
                  <button
                    onClick={() => { setSelectedCarriers([]); setMaxTransitTime(45) }}
                    className="text-[10px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest font-inter"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Quote list */}
            <div className="flex-1 space-y-3">
              {filteredQuotes.length > 0 && (
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter pb-2">
                  {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'} found
                </p>
              )}

              {filteredQuotes.length > 0 ? filteredQuotes.map((quote, idx) => {
                const isBest = quote.wisdom?.includes('PROPHETIC')
                const transitDays = quote.transit_time_days || quote.transit_time
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="bg-black border border-white/5 rounded-3xl group hover:border-white/10 transition-all duration-500 hover:bg-zinc-950 relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.01)]"
                  >
                    {/* Premium Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.01)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />

                    <div className="p-8 flex flex-col md:flex-row md:items-stretch gap-8 relative z-10">

                      {/* Left: carrier + route + insight */}
                      <div className="flex-1 space-y-8">

                        {/* Carrier row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:border-white/10 transition-colors">
                              <Ship className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white font-outfit uppercase tracking-tight">{quote.carrier_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-white/30 font-inter uppercase tracking-widest">{container} FCL</span>
                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="text-[9px] font-bold text-white/30 font-inter uppercase tracking-widest">Verified Fleet</span>
                              </div>
                            </div>
                          </div>
                          {isBest && (
                            <div className="flex items-center gap-1.5 border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5">
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[9px] font-black font-inter text-emerald-500 uppercase tracking-widest">PROPHETIC BEAT</span>
                            </div>
                          )}
                        </div>

                        {/* Route Visualization */}
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-8 px-6 bg-white/[0.01] rounded-2xl border border-white/[0.03]">
                          <div className="space-y-1.5">
                            <p className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{origin}</p>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] font-inter">Departure</p>
                          </div>

                          <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            <span className="text-[10px] font-black text-white/60 font-inter tracking-[0.1em]">{transitDays} DAYS</span>
                            <div className="w-full h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.1),transparent)] relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </div>
                            <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest font-inter">Transit Period</span>
                          </div>

                          <div className="text-right space-y-1.5">
                            <p className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{destination}</p>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] font-inter">Arrival</p>
                          </div>
                        </div>

                        {/* Insight */}
                        {quote.wisdom && (
                          <div className="flex items-start gap-4 pt-4">
                            <Zap className={`w-4 h-4 mt-0.5 ${isBest ? 'text-emerald-500' : 'text-white/20'}`} />
                            <p className="text-[11px] text-white/40 font-inter leading-relaxed italic group-hover:text-white/60 transition-colors">
                              &ldquo;{quote.wisdom}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="hidden md:block w-px bg-white/5" />

                      {/* Right: price + CTA */}
                      <div className="md:w-56 flex flex-col justify-between items-end pt-8 md:pt-0">
                        <div className="text-right space-y-1">
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-inter">Total Price</p>
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-[14px] font-black text-white/40">$</span>
                            <p className="text-4xl font-black font-mono text-white tracking-tighter leading-none select-all">{quote.price.toLocaleString()}</p>
                          </div>
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] font-inter">All-In Fixed</p>
                        </div>

                        <div className="w-full space-y-4">
                          <button
                            onClick={() => handleSelectQuote(quote)}
                            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.4em] text-[9px] transition-all hover:bg-zinc-200 active:scale-[0.98] shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
                          >
                            Book Now
                          </button>
                          <div className="text-center">
                            <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Ref: {quote.id?.slice(0, 8) || 'AUTO-VEC'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )
              }) : (
                <div className="py-20 text-center bg-[#0a0a0a] rounded-2xl border border-dashed border-white/5">
                  <AlertCircle className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                  <p className="text-sm text-zinc-500 font-inter mb-4">No quotes match the current filters.</p>
                  <button
                    onClick={() => { setSelectedCarriers([]); setMaxTransitTime(45) }}
                    className="text-xs font-bold uppercase tracking-widest text-white underline font-inter"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
      <Navbar />
      <Suspense fallback={<div className="text-center py-32 pt-40 text-zinc-500 text-xs">Loading...</div>}>
        <ResultsContent />
      </Suspense>
    </div>
  )
}
