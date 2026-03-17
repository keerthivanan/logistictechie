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
    router.push(`/booking?${query}`)
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-[#0a0a0a] border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                  >
                    <div className="p-5 flex flex-col md:flex-row md:items-stretch gap-0">

                      {/* Left: carrier + route + insight */}
                      <div className="flex-1 space-y-4 pr-0 md:pr-6">

                        {/* Carrier row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/[0.03] border border-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Ship className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white font-inter leading-none">{quote.carrier_name}</p>
                              <p className="text-[10px] text-zinc-600 font-inter mt-0.5">Verified carrier · {container} FCL</p>
                            </div>
                          </div>
                          {isBest && (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-2.5 py-1 rounded-full font-inter">Best Value</span>
                          )}
                        </div>

                        {/* Route */}
                        <div className="grid grid-cols-3 items-center gap-1 bg-black/50 rounded-xl px-4 py-3 border border-white/[0.04]">
                          <div>
                            <p className="text-base font-black font-mono text-white leading-none">{origin}</p>
                            <p className="text-[10px] text-zinc-600 mt-1">Origin</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-zinc-300 leading-none">{transitDays} days</p>
                            <div className="flex items-center gap-1 my-1.5">
                              <div className="h-px flex-1 bg-white/10" />
                              <ArrowRight className="w-2.5 h-2.5 text-zinc-700" />
                              <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <p className="text-[10px] text-zinc-600">Transit Time</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black font-mono text-white leading-none">{destination}</p>
                            <p className="text-[10px] text-zinc-600 mt-1">Destination</p>
                          </div>
                        </div>

                        {/* Insight */}
                        {quote.wisdom && !isBest && (
                          <p className="text-[11px] text-zinc-600 font-inter leading-relaxed">{quote.wisdom}</p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="hidden md:block w-px bg-white/5 mx-1" />

                      {/* Right: price + CTA */}
                      <div className="md:pl-6 md:w-44 flex flex-col justify-between items-end pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-600 font-inter mb-1">All-in Rate</p>
                          <p className="text-2xl font-black font-mono text-white leading-none">${quote.price.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-600 font-inter mt-1">per container</p>
                        </div>
                        <button
                          onClick={() => handleSelectQuote(quote)}
                          className="mt-4 w-full bg-white text-black py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-zinc-200 transition-all font-inter flex items-center justify-center gap-1.5"
                        >
                          Book Now <ArrowRight className="w-3 h-3" />
                        </button>
                        <p className="text-[10px] text-zinc-800 font-mono mt-2">#{quote.id?.slice(0, 8)}</p>
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
