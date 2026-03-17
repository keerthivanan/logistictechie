'use client'

import React, { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import { CheckCircle2, Printer, ArrowRight, Ship, FileText, Clock, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function ConfirmationContent() {
    const searchParams = useSearchParams()

    const carrier     = searchParams.get('carrier')     || 'Carrier'
    const priceStr    = searchParams.get('price')       || '0'
    const price       = parseFloat(priceStr)
    const origin      = searchParams.get('origin')      || 'CNSHA'
    const destination = searchParams.get('destination') || 'USNYC'
    const container   = searchParams.get('container')   || '40FT'
    const transit     = searchParams.get('transit')     || '30'
    const vessel      = searchParams.get('vessel')      || 'TBD'
    const quoteId     = searchParams.get('quoteId')     || ''

    const bookingRef = quoteId
        ? `BK-${quoteId.slice(0, 8).toUpperCase()}`
        : `BK-${Date.now().toString(36).toUpperCase()}`

    const arrivalDate = new Date()
    arrivalDate.setDate(arrivalDate.getDate() + parseInt(transit))
    const arrivalStr = arrivalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const details = [
        { label: 'Carrier',           value: carrier },
        { label: 'Vessel',            value: vessel, mono: true },
        { label: 'Container',         value: `1 × ${container} · FCL` },
        { label: 'Transit Time',      value: `${transit} days` },
        { label: 'Est. Arrival',      value: arrivalStr },
        { label: 'Status',            value: 'Confirmed', highlight: true },
    ]

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
            >
                {/* Success header */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-7 h-7 text-black" />
                    </div>
                    <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-2">Booking Confirmed</h1>
                    <p className="text-xs text-zinc-500 font-inter mb-4">
                        Your shipment has been booked. A confirmation has been recorded in our system.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2.5">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Booking Reference</span>
                        <span className="text-sm font-black font-mono text-white">{bookingRef}</span>
                    </div>
                </div>

                {/* Route + details */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-5">Shipment Details</p>

                    {/* Route visual */}
                    <div className="flex items-center gap-4 mb-5 bg-black/50 rounded-xl px-5 py-4 border border-white/[0.04]">
                        <div className="flex-1">
                            <p className="text-xl font-black font-mono text-white leading-none">{origin}</p>
                            <p className="text-[10px] text-zinc-600 mt-1 font-inter">Origin</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-[10px] font-bold text-zinc-400 font-inter">{transit} days</p>
                            <Ship className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-xl font-black font-mono text-white leading-none">{destination}</p>
                            <p className="text-[10px] text-zinc-600 mt-1 font-inter">Destination</p>
                        </div>
                    </div>

                    {/* Detail rows */}
                    <div className="space-y-3">
                        {details.map(({ label, value, mono, highlight }) => (
                            <div key={label} className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">{label}</p>
                                <p className={`text-xs font-bold font-inter ${highlight ? 'text-emerald-400' : 'text-white'} ${mono ? 'font-mono' : ''}`}>{value}</p>
                            </div>
                        ))}
                        <div className="pt-3 mt-1 border-t border-white/5 flex items-end justify-between">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Total Charged</p>
                            <div className="text-right">
                                <p className="text-2xl font-black font-mono text-white leading-none">${price.toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-600 font-inter mt-0.5">per container · all-in</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What's next */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-4">Next Steps</p>
                    <div className="space-y-3">
                        {[
                            { icon: Ship,      text: 'Carrier will confirm your slot within 24 hours.' },
                            { icon: FileText,  text: 'Shipping instructions and B/L draft sent to your email.' },
                            { icon: Clock,     text: `Estimated arrival at ${destination}: ${arrivalStr}.` },
                        ].map(({ icon: Icon, text }, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon className="w-3 h-3 text-zinc-600" />
                                </div>
                                <p className="text-xs text-zinc-500 font-inter leading-relaxed">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/dashboard"
                        className="flex-1 bg-white text-black py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 font-inter"
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" /> Go to Dashboard
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-transparent border border-white/10 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:border-white/30 hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2 font-inter"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print Receipt
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default function ConfirmationPage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            {/* Step bar */}
            <div className="bg-black border-b border-white/5 pt-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-3">
                        {[
                            { label: 'Search',       done: true,  active: false },
                            { label: 'Results',      done: true,  active: false },
                            { label: 'Booking',      done: true,  active: false },
                            { label: 'Confirmation', done: false, active: true  },
                        ].map((step, i) => (
                            <div key={step.label} className="flex items-center gap-2">
                                {i > 0 && <div className="h-px w-8 bg-white/10" />}
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${step.done || step.active ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}>
                                    {step.done ? '✓' : i + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest font-inter ${step.active ? 'text-white' : step.done ? 'text-zinc-500' : 'text-zinc-700'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Suspense fallback={<div className="text-center py-20 text-zinc-600 text-xs">Loading confirmation...</div>}>
                <ConfirmationContent />
            </Suspense>
        </div>
    )
}
