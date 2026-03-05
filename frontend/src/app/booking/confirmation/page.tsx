'use client'

import React, { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Printer, ArrowRight, Ship, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ConfirmationContent() {
    const searchParams = useSearchParams()

    // Read all params passed from /booking page
    const carrier = searchParams.get('carrier') || 'Sovereign Prime'
    const priceStr = searchParams.get('price') || '0'
    const price = parseFloat(priceStr)
    const origin = searchParams.get('origin') || 'CNSHA'
    const destination = searchParams.get('destination') || 'USNYC'
    const container = searchParams.get('container') || '40FT'
    const transit = searchParams.get('transit') || '30'
    const vessel = searchParams.get('vessel') || 'TBD'
    const quoteId = searchParams.get('quoteId') || ''

    // Generate a booking reference from quoteId or a timestamp
    const bookingRef = quoteId
        ? `BK-${quoteId.slice(0, 8).toUpperCase()}`
        : `BK-${Date.now().toString(36).toUpperCase()}`

    // Estimated arrival
    const arrivalDate = new Date()
    arrivalDate.setDate(arrivalDate.getDate() + parseInt(transit))
    const arrivalStr = arrivalDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                <CheckCircle className="w-12 h-12 text-black" />
            </div>

            <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-gray-400 mb-2">
                Reference: <span className="font-mono text-white">{bookingRef}</span>
            </p>
            <p className="text-sm text-gray-600 mb-12">
                A confirmation has been recorded. Estimated arrival: <span className="text-gray-400">{arrivalStr}</span>
            </p>

            {/* Shipment Details */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-8 text-left">
                <h3 className="font-bold mb-6 border-b border-white/10 pb-4 text-lg">Shipment Details</h3>

                {/* Route */}
                <div className="flex items-center justify-between mb-6 bg-black p-4 rounded-xl border border-white/5">
                    <div className="text-center">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-2 mx-auto">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="font-bold text-xl font-mono">{origin}</div>
                        <div className="text-xs text-gray-500 mt-1">Origin</div>
                    </div>
                    <div className="flex-1 px-6 text-center">
                        <Ship className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                        <div className="text-xs text-green-400 font-bold">{transit} Days</div>
                    </div>
                    <div className="text-center">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-2 mx-auto">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="font-bold text-xl font-mono">{destination}</div>
                        <div className="text-xs text-gray-500 mt-1">Destination</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Carrier</div>
                        <div className="font-medium">{carrier}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Container</div>
                        <div className="font-medium">{container}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Vessel</div>
                        <div className="font-medium font-mono text-sm">{vessel}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Status</div>
                        <div className="font-medium text-green-400">CONFIRMED</div>
                    </div>
                    <div className="col-span-2 pt-4 border-t border-white/10">
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Total Charged</div>
                        <div className="font-bold text-2xl font-mono">${price.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link
                    href="/dashboard"
                    className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-all flex items-center justify-center"
                >
                    Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <button
                    onClick={() => window.print()}
                    className="bg-zinc-900 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:border-white transition-all flex items-center justify-center"
                >
                    <Printer className="w-5 h-5 mr-2" /> Print Confirmation
                </button>
            </div>
        </div>
    )
}

export default function ConfirmationPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />
            <main className="pt-24 pb-12">
                <Suspense fallback={<div className="text-center py-20 text-gray-400">Finalizing Booking...</div>}>
                    <ConfirmationContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}
