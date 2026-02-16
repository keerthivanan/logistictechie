'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Star, Ship, MapPin, Edit2, ArrowRight, AlertCircle } from 'lucide-react'

// Separate component for search params logic to avoid Suspense boundary issues
function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<any[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([])
  const [error, setError] = useState('')
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [maxTransitTime, setMaxTransitTime] = useState(45)

  const origin = searchParams.get('origin') || 'CNSHA'
  const destination = searchParams.get('destination') || 'USNYC'
  const container = searchParams.get('container') || '40FT'
  const value = searchParams.get('value')

  useEffect(() => {
    async function fetchQuotes() {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:8000/api/quotes/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: origin,
            destination: destination,
            container: container,
            commodity: value ? "High Value Goods" : "General Cargo",
            ready_date: new Date().toISOString().split('T')[0],
            goods_value: value ? parseFloat(value) : null
          })
        })

        if (!res.ok) throw new Error("Failed to fetch rates")
        const data = await res.json()
        setQuotes(data)
        setFilteredQuotes(data)
      } catch (err) {
        console.error(err)
        setError("Unable to connect to Global Carrier Matrix.")
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
      <div className="bg-zinc-900 border-b border-white/10">
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
          <p className="text-gray-400">Connecting with Maersk, MSC, and CMA CGM Real-time Nodes.</p>
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
              <div className="bg-zinc-900 rounded-xl p-6 border border-white/10 sticky top-24">
                <h3 className="text-lg font-bold mb-6">Live Filters</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Carrier Priority</label>
                    <div className="space-y-2">
                      {['Maersk', 'MSC', 'Evergreen', 'Hapag-Lloyd', 'CMA CGM'].map(c => (
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
                <div key={idx} className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-white/40 transition-all group relative">
                  {/* Wisdom Badge */}
                  {quote.wisdom && quote.wisdom.includes("PROPHETIC") && (
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 animate-pulse">
                      SOVEREIGN CHOICE
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                            <Ship className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <div className="font-bold text-lg">{quote.carrier_name}</div>
                            <div className="flex items-center text-xs text-gray-400">
                              <Star className="w-3 h-3 text-white fill-white mr-1" />
                              <span className="text-white mr-1">4.9</span>
                              <span>(Verified Partner)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold font-mono">{origin}</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center px-4">
                            <div className="text-xs text-gray-400 mb-1">{quote.transit_time_days || quote.transit_time} Days</div>
                            <div className="w-full h-px bg-white/20 relative">
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1">Direct</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-xl font-bold font-mono">{destination}</span>
                          </div>
                        </div>

                        {/* Wisdom Display */}
                        <div className="text-xs text-gray-400 italic bg-white/5 p-2 rounded border-l-2 border-purple-500">
                          {quote.wisdom}
                        </div>
                      </div>

                      <div className="text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                        <div className="text-3xl font-bold mb-1">${quote.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mb-4 font-mono">ID: {quote.id?.slice(0, 8)}</div>
                        <button
                          onClick={() => handleSelectQuote(quote)}
                          className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center group-hover:scale-[1.02]"
                        >
                          Book Now <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-zinc-900 rounded-3xl border border-dashed border-white/10">
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
      {/* Navigation */}
      <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-bold tracking-tight text-white">OMEGO</span>
            </Link>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="text-center py-20">Loading Interface...</div>}>
        <ResultsContent />
      </Suspense>
    </div>
  )
}
