'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/lib/config'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Star, Ship, MapPin, Edit2, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/context/AuthContext'

// Separate component for search params logic to avoid Suspense boundary issues
function ResultsContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  // --- Role Protection ---
  useEffect(() => {
    if (!authLoading && user?.role === 'forwarder') {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])
  const [quotes, setQuotes] = useState<any[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([])
  const [error, setError] = useState('')
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [maxTransitTime, setMaxTransitTime] = useState(45)

  const origin = searchParams.get('origin') || 'CNSHA'
  const destination = searchParams.get('destination') || 'USNYC'
  const container = searchParams.get('container') || '40FT'
  const value = searchParams.get('value')
  const readyDate = searchParams.get('readyDate')
  const isHazardous = searchParams.get('hazardous') === 'true'

  useEffect(() => {
    async function fetchQuotes() {
      try {
        setLoading(true)

        // Derive commodity from user flags
        let commodity = "General Cargo"
        if (isHazardous) commodity = "Hazardous Goods"
        else if (value && parseFloat(value) > 50000) commodity = "High Value Goods"

        const res = await fetch(`${API_URL}/api/quotes/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: origin,
            destination: destination,
            container: container,
            commodity: commodity,
            ready_date: readyDate || new Date().toISOString().split('T')[0],
            goods_value: value ? parseFloat(value) : null
          })
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => null)
          throw new Error(errData?.detail || "Failed to fetch rates")
        }
        const data = await res.json()
        const quoteList = data.quotes || []
        setQuotes(quoteList)
        setFilteredQuotes(quoteList)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "Unable to connect to Global Carrier Matrix.")
      } finally {
        setLoading(false)
      }
    }

    if (origin && destination) {
      fetchQuotes()
    }
  }, [origin, destination, container])

  // Apply filters whenever selectedCarriers, maxTransitTime, or quotes change
  useEffect(() => {
    let filtered = [...quotes]
    if (selectedCarriers.length > 0) {
      filtered = filtered.filter(q => selectedCarriers.includes(q.carrier_name))
    }
    filtered = filtered.filter(q => (q.transit_time_days || q.transit_time) <= maxTransitTime)
    setFilteredQuotes(filtered)
  }, [selectedCarriers, maxTransitTime, quotes])

  const handleSelectQuote = (quote: any) => {
    // Pass full quote details to booking page to PREVENT PRICE DRIFT
    const query = new URLSearchParams({
      quoteId: quote.id || '',
      carrier: quote.carrier_name,
      price: quote.price,
      origin: quote.origin_locode || origin,
      destination: quote.dest_locode || destination,
      container: container,
      transit: quote.transit_time_days || quote.transit_time,
      vessel: quote.vessel_name || 'TBD',
      wisdom: quote.wisdom || '',
      breakdown: JSON.stringify(quote.breakdown || {})
    }).toString()
    router.push(`/booking?${query}`)
  }

  return (
    <>
      {/* Search Header Info - Dynamic now */}
      <div className="bg-black border-b border-white/10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400">Route:</span>
              <span className="text-white font-bold">{origin}</span>
              <span className="text-gray-600">→</span>
              <span className="text-white font-bold">{destination}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs">✓</div>
                <span className="ml-2 font-medium text-gray-300">Search</span>
              </div>
              <div className="h-px w-12 bg-white/20"></div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs">2</div>
                <span className="ml-2 font-medium text-white">Results</span>
              </div>
              <div className="h-px w-12 bg-white/20"></div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-zinc-800 text-gray-500 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                <span className="ml-2 font-medium text-gray-600">Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-8"></div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Global Sovereign Routes...</h2>
          <p className="text-gray-400">Connecting with Sovereign Carrier Matrix Real-time Nodes.</p>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold">System Alert</h3>
          <p className="text-gray-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-white underline">Retry</button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-80 flex-shrink-0 hidden lg:block">
              <div className="bg-black rounded-xl p-6 border border-white/10 sticky top-24 shadow-2xl">
                <h3 className="text-lg font-bold mb-6">Live Filters</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Carrier Priority</label>
                    <div className="space-y-2">
                      {['Sovereign Prime', 'Direct Network', 'Global Alliance', 'Executive Tier', 'Priority Node'].map(c => (
                        <label key={c} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCarriers.includes(c)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCarriers([...selectedCarriers, c])
                              } else {
                                setSelectedCarriers(selectedCarriers.filter(sc => sc !== c))
                              }
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-black checked:bg-white focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-sm transition-colors ${selectedCarriers.includes(c) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Transit Speed (Max {maxTransitTime} Days)</label>
                    <input
                      type="range"
                      min="15"
                      max="45"
                      value={maxTransitTime}
                      onChange={(e) => setMaxTransitTime(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                      <span>15 Days</span>
                      <span>45 Days</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">
                      The Sovereign Engine has pre-filtered these results based on {origin} port congestion and current vessel drafting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotes List */}
            <div className="flex-1 space-y-6">
              {filteredQuotes.length > 0 ? filteredQuotes.map((quote, idx) => (
                <div key={idx} className="bg-black border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all group relative shadow-2xl">
                  {/* Holographic Signal */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] blur-[40px] pointer-events-none group-hover:bg-emerald-500/[0.07] transition-colors" />

                  {/* Wisdom Badge */}
                  {quote.wisdom && quote.wisdom.includes("PROPHETIC") && (
                    <div className="absolute top-0 right-0 bg-white text-black text-[8px] font-black px-4 py-1.5 rounded-bl-xl z-20 uppercase tracking-widest shadow-xl">
                      Sovereign Prime Choice
                    </div>
                  )}

                  <div className="p-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-12 h-12 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-center shadow-inner group-hover:border-white/20 transition-colors">
                            <Ship className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <div className="font-black text-xl font-outfit uppercase tracking-tighter text-white">{quote.carrier_name}</div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verified Node
                              </div>
                              <div className="flex items-center text-[9px] font-black text-white/40 uppercase tracking-widest">
                                <Star className="w-2.5 h-2.5 text-white/20 fill-white/20 mr-1" />
                                Tier 1 Reliability
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 mb-8">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black font-mono text-white tracking-tighter">{origin}</span>
                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Origin Port</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center px-4">
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 font-inter">{quote.transit_time_days || quote.transit_time} Days</div>
                            <div className="w-full h-0.5 bg-white/5 relative overflow-hidden rounded-full">
                              <div className="absolute inset-y-0 left-0 bg-emerald-500 w-1/3 group-hover:w-full transition-all duration-1000" />
                            </div>
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Direct Transit Protocol</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-2xl font-black font-mono text-white tracking-tighter">{destination}</span>
                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Destination Node</span>
                          </div>
                        </div>

                        {/* Wisdom Display */}
                        {quote.wisdom && (
                          <div className="text-[10px] font-bold text-zinc-400 italic bg-white/[0.02] p-4 rounded-xl border-l-[3px] border-emerald-500/30 font-inter leading-relaxed">
                            {quote.wisdom}
                          </div>
                        )}
                      </div>

                      <div className="text-right border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10 min-w-[220px]">
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 font-inter">Locked Rate</div>
                        <div className="text-5xl font-black font-outfit text-white mb-2 tracking-tighter leading-none">${quote.price.toLocaleString()}</div>
                        <div className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-8 font-mono">TRANSACTION-ID: {quote.id?.slice(0, 12)}</div>

                        <button
                          onClick={() => handleSelectQuote(quote)}
                          className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-zinc-200 transition-all font-inter active:scale-[0.98] shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                        >
                          Initiate Booking <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.005),rgba(0,255,0,0.003),rgba(0,0,255,0.005))] bg-[length:100%_2px,3px_100%] opacity-20" />
                </div>
              )) : (
                <div className="py-20 text-center bg-black rounded-3xl border border-dashed border-white/10">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No matching sovereign routes found for current filters.</p>
                  <button
                    onClick={() => {
                      setSelectedCarriers([])
                      setMaxTransitTime(45)
                    }}
                    className="text-white font-bold underline"
                  >
                    Clear all filters
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar />

      <Suspense fallback={<div className="text-center py-20 pt-40">Loading Interface...</div>}>
        <ResultsContent />
      </Suspense>
      <Footer />
    </div>
  )
}

