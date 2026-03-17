'use client'

import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Ship, ArrowRight, CheckCircle2, Clock, FileText } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { motion } from 'framer-motion'

function BookingContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!authLoading && user?.role === 'forwarder') router.push('/dashboard')
  }, [user, authLoading, router])

  const quoteId     = searchParams.get('quoteId')   || ''
  const carrier     = searchParams.get('carrier')   || 'Carrier'
  const priceStr    = searchParams.get('price')     || '0'
  const price       = parseFloat(priceStr)
  const origin      = searchParams.get('origin')    || 'CNSHA'
  const destination = searchParams.get('destination') || 'USNYC'
  const transit     = searchParams.get('transit')   || '30'
  const vessel      = searchParams.get('vessel')    || 'TBD'
  const container   = searchParams.get('container') || '40FT'
  const wisdom      = searchParams.get('wisdom')    || ''
  const breakdownStr = searchParams.get('breakdown') || '{}'

  let breakdown: any = {}
  try { breakdown = JSON.parse(breakdownStr) } catch { /* ignore */ }

  const baseRate      = breakdown.base_rate      || Math.round(price * 0.63)
  const fuelSurcharge = breakdown.fuel_surcharge || Math.round(price * 0.18)
  const portFees      = breakdown.port_fees      || Math.round(price * 0.07)
  const surcharges    = breakdown.surcharges     || 0
  const total         = breakdown.total          || price

  const handleConfirm = () => {
    const params = new URLSearchParams({
      carrier, price: priceStr, origin, destination,
      container, transit, vessel, quoteId,
    }).toString()
    router.push(`/booking/confirmation?${params}`)
  }

  const details = [
    { label: 'Carrier',   value: carrier },
    { label: 'Vessel',    value: vessel, mono: true },
    { label: 'Container', value: `1 × ${container}` },
    { label: 'Service',   value: 'Full Container Load' },
    { label: 'Cargo',     value: 'General Cargo' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-5 gap-6"
      >
        {/* ── Left panel ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Route card */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-5">Route Overview</p>

            {/* Visual route */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1">
                <p className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{origin}</p>
                <p className="text-[10px] text-zinc-600 mt-1 font-inter">Origin Port</p>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1 px-2">
                <p className="text-xs font-bold text-zinc-300 font-inter">{transit} days</p>
                <div className="flex items-center gap-1 w-full">
                  <div className="h-px flex-1 bg-white/10" />
                  <Ship className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <p className="text-[10px] text-zinc-700 font-inter">Transit</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{destination}</p>
                <p className="text-[10px] text-zinc-600 mt-1 font-inter">Destination Port</p>
              </div>
            </div>

            {/* Details rows */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              {details.map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">{label}</p>
                  <p className={`text-xs font-bold text-white ${mono ? 'font-mono' : 'font-inter'}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Insight */}
            {wisdom && !wisdom.includes('PROPHETIC') && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[11px] text-zinc-500 font-inter leading-relaxed italic">{wisdom}</p>
              </div>
            )}
          </div>

          {/* What happens next */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-5">What Happens Next</p>
            <div className="space-y-4">
              {[
                { icon: Ship,       text: 'Booking request sent to the carrier immediately.' },
                { icon: Clock,      text: 'Freight specialist confirms your slot within 24 hours.' },
                { icon: FileText,   text: 'Shipping instructions and B/L draft delivered to your email.' },
                { icon: CheckCircle2, text: 'Cargo loaded and tracked until delivery.' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <p className="text-xs text-zinc-400 font-inter leading-relaxed pt-0.5">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sticky top-24">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-5">Cost Breakdown</p>

            <div className="space-y-3">
              {[
                { label: 'Base Rate',       value: baseRate },
                { label: 'Fuel Surcharge',  value: fuelSurcharge },
                { label: 'Port Fees',       value: portFees },
                ...(surcharges > 0 ? [{ label: 'Surcharges', value: surcharges }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500 font-inter">{label}</p>
                  <p className="text-xs font-mono font-bold text-zinc-300">${value.toLocaleString()}</p>
                </div>
              ))}

              <div className="pt-3 mt-1 border-t border-white/5">
                <div className="flex items-end justify-between">
                  <p className="text-xs font-bold text-white font-inter">Total</p>
                  <div className="text-right">
                    <p className="text-2xl font-black font-mono text-white leading-none">${total.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-600 font-inter mt-0.5">per container · all-in</p>
                  </div>
                </div>
              </div>
            </div>

            {quoteId && (
              <p className="text-[10px] text-zinc-700 font-mono mt-4">Quote #{quoteId.slice(0, 12)}</p>
            )}

            <button
              onClick={handleConfirm}
              className="mt-5 w-full bg-white text-black py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all font-inter flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Confirm Booking <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <p className="text-[10px] text-center text-zinc-700 mt-3 font-inter">
              By confirming you agree to our{' '}
              <Link href="/legal/terms" className="underline hover:text-zinc-500 transition-colors">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
      <Navbar />

      {/* Step bar */}
      <div className="bg-black border-b border-white/5 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            {[
              { label: 'Search',       done: true,  active: false },
              { label: 'Results',      done: true,  active: false },
              { label: 'Booking',      done: false, active: true  },
              { label: 'Confirmation', done: false, active: false },
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

      {/* Page title */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <h1 className="text-xl font-black font-outfit uppercase tracking-tight text-white">Review & Confirm</h1>
        <p className="text-xs text-zinc-500 font-inter mt-1">Check the details below before confirming your booking.</p>
      </div>

      <Suspense fallback={<div className="text-center py-20 text-zinc-600 text-xs">Loading booking details...</div>}>
        <BookingContent />
      </Suspense>
    </div>
  )
}
