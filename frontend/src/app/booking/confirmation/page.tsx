'use client'

import React, { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Printer, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ConfirmationContent() {
    const searchParams = useSearchParams()
    const [booking, setBooking] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const refId = searchParams.get('id')

    React.useEffect(() => {
        if (!refId) return

        const token = localStorage.getItem('token')
        fetch(`http://localhost:8000/api/bookings/${refId}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBooking(data.data)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [refId])

    if (loading) {
        return <div className="text-center py-20">Retrieving Booking Details...</div>
    }

    if (!booking) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-red-500">Booking Not Found</h1>
                <p className="text-gray-400 mt-4">The reference ID #{refId} could not be located.</p>
                <Link href="/dashboard" className="text-white underline mt-8 block">Return to Dashboard</Link>
            </div>
        )
    }

    // Parse cargo details if string
    const details = typeof booking.cargo_details === 'string'
        ? JSON.parse(booking.cargo_details)
        : booking.cargo_details

    const arrivalDate = new Date()
    // Add transit time (default 30 if not found)
    arrivalDate.setDate(arrivalDate.getDate() + 30)

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                <CheckCircle className="w-12 h-12 text-black" />
            </div>

            <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-gray-400 mb-12">
                Reference ID: <span className="font-mono text-white">#{booking.booking_reference}</span>
            </p>

            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-12 text-left">
                <h3 className="font-bold mb-6 border-b border-white/10 pb-4">Shipment Details</h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold">Origin</div>
                        <div className="font-medium text-lg">{details.origin || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold">Destination</div>
                        <div className="font-medium text-lg">{details.destination || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold">Carrier</div>
                        <div className="font-medium">{details.carrier || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs uppercase font-bold">Status</div>
                        <div className="font-medium text-green-400">{booking.status}</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link href="/dashboard" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-all flex items-center justify-center">
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
                <Suspense fallback={<div>Finalizing Booking...</div>}>
                    <ConfirmationContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}
