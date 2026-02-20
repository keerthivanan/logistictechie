'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Ship, MapPin, Package, Info, ArrowRight, CheckCircle } from 'lucide-react'

// Separate component for search params logic
function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const quoteId = searchParams.get('quoteId') || ''
  const carrier = searchParams.get('carrier') || 'Generic Carrier'
  const priceStr = searchParams.get('price') || '0'
  const price = parseFloat(priceStr)
  const origin = searchParams.get('origin') || 'CNSHA'
  const destination = searchParams.get('destination') || 'USNYC'
  const transit = searchParams.get('transit') || '30'
  const vessel = searchParams.get('vessel') || 'TBD'
  const container = searchParams.get('container') || '40FT'
  const wisdom = searchParams.get('wisdom') || ''
  const breakdownStr = searchParams.get('breakdown') || '{}'

  let breakdown = { fuel_component: 0, terminal_handling: 0, surcharges: 0 }
  try {
    breakdown = JSON.parse(breakdownStr)
  } catch (e) {
    console.error('Failed to parse breakdown', e)
  }

  // Calculate simple breakdown if not provided
  const fuel = breakdown.fuel_component || price * 0.4
  const handling = breakdown.terminal_handling || price * 0.3
  const surcharges = breakdown.surcharges || price * 0.3

  const handleConfirm = () => {
    const query = new URLSearchParams({
      quoteId,
      carrier,
      price: priceStr,
      origin,
      destination,
      transit,
      container,
      breakdown: breakdownStr
    }).toString()
    router.push(`/booking/payment?${query}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Booking Summary */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8">Shipment Summary</h2>

            {/* Route Diagram */}
            <div className="flex items-center justify-between mb-8 bg-black p-6 rounded-xl border border-white/5">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="font-bold text-2xl font-mono">{origin}</div>
              </div>

              <div className="flex-1 px-8">
                <div className="relative">
                  <div className="h-px bg-white/20 w-full dashed"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-4">
                    <Ship className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="font-bold text-2xl font-mono">{destination}</div>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center mb-2">
                  <Ship className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-semibold text-white">{carrier} (FCL)</span>
                </div>
                <div className="text-xs text-gray-500">Vessel: {vessel}</div>
              </div>

              <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center mb-2">
                  <Info className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-semibold text-white">Transit: {transit} Days</span>
                </div>
                <div className="text-xs text-gray-500">Direct Service</div>
              </div>
            </div>

            {/* Load Section */}
            <div className="mb-8 p-6 bg-black/50 rounded-xl border border-white/5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">1 × {container} Container</h4>
                  <p className="text-gray-400 text-sm">General Merchandise • Verified Cargo</p>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Freight Forwarder</h4>
                <div className="flex items-center bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="w-10 h-10 bg-white rounded flex items-center justify-center mr-3">
                    <Ship className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-semibold">Sovereign Logistics</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Customs Broker</h4>
                <div className="flex items-center bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center mr-3">
                    <span className="font-bold text-white">AI</span>
                  </div>
                  <span className="font-semibold">Sovereign Customs AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6">Cost Breakdown</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Ocean Freight (Fuel)</span>
                <span className="font-mono font-medium text-white">${fuel.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Terminal Handling</span>
                <span className="font-mono font-medium text-white">${handling.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Strategic Surcharges</span>
                <span className="font-mono font-medium text-white">${surcharges.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-white font-mono">${price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center group"
            >
              Confirm & Pay <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-xs text-center text-gray-600 mt-4">
              Secure SSL Encrypted Transaction. By confirming you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-bold tracking-tight text-white">SOVEREIGN</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-zinc-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="ml-2 font-medium text-gray-300 hidden sm:inline">Search</span>
              </div>
              <div className="h-px w-8 sm:w-12 bg-white/20"></div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="ml-2 font-medium text-gray-300 hidden sm:inline">Results</span>
              </div>
              <div className="h-px w-8 sm:w-12 bg-white/20"></div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs">3</div>
                <span className="ml-2 font-medium text-white">Booking</span>
              </div>
              <div className="h-px w-8 sm:w-12 bg-white/20"></div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-zinc-800 text-gray-500 rounded-full flex items-center justify-center font-bold text-xs">4</div>
                <span className="ml-2 font-medium text-gray-600 hidden sm:inline">Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-20">Loading Booking Details...</div>}>
        <BookingContent />
      </Suspense>
    </div>
  )
}
