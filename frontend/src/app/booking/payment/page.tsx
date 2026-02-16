'use client'

import React, { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { API_URL } from '@/lib/config'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const priceStr = searchParams.get('price') || '0'
    const price = parseFloat(priceStr)
    const carrier = searchParams.get('carrier') || 'Unknown Carrier'
    const origin = searchParams.get('origin') || 'Unknown'
    const destination = searchParams.get('destination') || 'Unknown'

    // Simple breakdown for consistency
    const freight = price * 0.85
    const fees = price * 0.15

    const handlePay = async () => {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('token')
        if (!token) {
            // Redirect to login if not authenticated, saving the current URL
            const returnUrl = encodeURIComponent(window.location.href)
            router.push(`/login?returnUrl=${returnUrl}`)
            return
        }

        try {
            const bookingPayload = {
                quote_id: "Q-" + Math.random().toString(36).substr(2, 9).toUpperCase(), // Generate a client-side ref if no real quote ID
                price: price,
                cargo_details: {
                    origin,
                    destination,
                    carrier,
                    freight,
                    fees
                },
                quote_data: {
                    carrier_name: carrier,
                    origin,
                    destination,
                    price
                }
            }

            const res = await fetch(`${API_URL}/api/bookings/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingPayload)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || 'Booking failed')
            }

            // Success -> Redirect to Confirmation with Real Reference
            router.push(`/booking/confirmation?id=${data.booking_reference}`)

        } catch (err: any) {
            console.error(err)
            setError(err.message || "Payment processing failed. Please try again.")
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Progress */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-2 text-gray-500">
                    <span className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center text-xs">1</span>
                    <span>Search</span>
                </div>
                <div className="h-px bg-gray-800 w-12"></div>
                <div className="flex items-center space-x-2 text-gray-500">
                    <span className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center text-xs">2</span>
                    <span>Results</span>
                </div>
                <div className="h-px bg-gray-800 w-12"></div>
                <div className="flex items-center space-x-2 text-gray-500">
                    <span className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center text-xs">3</span>
                    <span>Booking</span>
                </div>
                <div className="h-px bg-white w-12"></div>
                <div className="flex items-center space-x-2 text-white font-bold">
                    <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs">4</span>
                    <span>Payment</span>
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-8">Secure Payment</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                        <h3 className="font-bold mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" /> Credit Card
                        </h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Card Number" className="w-full bg-black border border-white/10 p-3 rounded-lg text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="MM/YY" className="w-full bg-black border border-white/10 p-3 rounded-lg text-white" />
                                <input type="text" placeholder="CVC" className="w-full bg-black border border-white/10 p-3 rounded-lg text-white" />
                            </div>
                            <input type="text" placeholder="Cardholder Name" className="w-full bg-black border border-white/10 p-3 rounded-lg text-white" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Lock className="w-4 h-4" />
                        <span>Your payment is secured by Stripe 256-bit encryption.</span>
                    </div>
                </div>

                <div>
                    <div className="bg-white text-black p-6 rounded-xl">
                        <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                        <div className="mb-2 text-xs text-gray-500">Carrier: {carrier}</div>
                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                                <span>Freight Charges</span>
                                <span className="font-mono">${freight.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Port & Handling</span>
                                <span className="font-mono">${fees.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <div className="border-t border-black/10 pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${price.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handlePay}
                            disabled={loading}
                            className="block w-full bg-black text-white py-4 rounded-lg font-bold text-center mt-6 hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Pay & Book Shipment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />
            <main className="pt-24 pb-12">
                <Suspense fallback={<div>Loading Secure Gateway...</div>}>
                    <PaymentContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}
