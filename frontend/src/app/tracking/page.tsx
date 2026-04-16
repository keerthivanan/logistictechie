'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Ship, MapPin, Anchor, Search, ArrowRight, MessageSquare } from 'lucide-react'
import { Spinner, FullPageSpinner } from '@/components/ui/Spinner'
import { apiFetch } from '@/lib/config'
import { useT } from '@/lib/i18n/t'
import Link from 'next/link'

function TrackingContent() {
    const t = useT()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [tracking, setTracking] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [inputId, setInputId] = useState('')

    const fetchTracking = useCallback(async () => {
        try {
            setLoading(true)
            setNotFound(false)
            const res = await apiFetch(`/api/tracking/${id}`)
            if (!res.ok) { setNotFound(true); return }
            const data = await res.json()
            setTracking(data)
        } catch {
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) fetchTracking()
        else setLoading(false)
    }, [id, fetchTracking])

    // ── No ID entered — search form ──
    if (!id) return (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Ship className="w-7 h-7 text-zinc-500" />
            </div>
            <h1 className="text-2xl font-bold font-outfit text-white mb-2">{t('track.title')}</h1>
            <p className="text-zinc-500 text-sm font-inter mb-10">{t('track.sub')}</p>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        type="text"
                        value={inputId}
                        onChange={e => setInputId(e.target.value)}
                        placeholder={t('track.placeholder')}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-all font-inter"
                        onKeyDown={e => {
                            if (e.key === 'Enter' && inputId.trim())
                                window.location.href = `/tracking?id=${encodeURIComponent(inputId.trim())}`
                        }}
                    />
                </div>
                <button
                    onClick={() => { if (inputId.trim()) window.location.href = `/tracking?id=${encodeURIComponent(inputId.trim())}` }}
                    className="bg-white text-black px-5 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 font-inter"
                >
                    Track <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
            <p className="text-[11px] text-zinc-700 font-inter mt-4">Enter a booking reference, bill of lading number, or request ID</p>
        </div>
    )

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 font-inter">{t('track.connecting')}</div>
        </div>
    )

    // ── Not found — honest state ──
    if (notFound || !tracking) return (
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-7 h-7 text-zinc-700" />
            </div>
            <h2 className="text-lg font-bold font-outfit text-white mb-2">Shipment Not Found</h2>
            <p className="text-zinc-500 text-sm font-inter mb-2">
                No tracking data found for <span className="text-white font-mono text-xs bg-white/[0.05] px-2 py-0.5 rounded-md">{id}</span>
            </p>
            <p className="text-zinc-600 text-xs font-inter mb-8">
                Live vessel tracking is managed by your assigned freight forwarder. Contact them directly via the platform for real-time updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href="/dashboard/messages"
                    className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all font-inter"
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message Your Forwarder
                </Link>
                <a
                    href={`mailto:support@cargolink.sa?subject=Tracking Inquiry: ${id}`}
                    className="flex items-center justify-center gap-2 border border-white/10 text-zinc-400 px-5 py-2.5 rounded-xl text-xs font-bold hover:border-white/20 hover:text-white transition-all font-inter"
                >
                    {t('track.contact.agent')}
                </a>
            </div>
            <button
                onClick={() => window.location.href = '/tracking'}
                className="mt-6 text-[11px] text-zinc-700 hover:text-zinc-500 transition-colors font-inter"
            >
                ← Search again
            </button>
        </div>
    )

    // ── Real tracking data found ──
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Ship className="w-24 h-24 text-white" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {t('track.live.signal')}
                            </span>
                            <span className="text-zinc-600 text-[11px] font-inter">{t('track.last.updated')}</span>
                        </div>
                        <h1 className="text-2xl font-bold font-outfit text-white mb-1">{tracking.vessel_name}</h1>
                        <p className="text-zinc-600 font-mono text-xs mb-6">Ref: {id}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: t('track.status'), value: tracking.status },
                                { label: t('track.position'), value: tracking.telemetry?.lat ? `${tracking.telemetry.lat}°N ${tracking.telemetry.lon}°E` : '—' },
                                { label: t('track.speed'), value: tracking.telemetry?.speed ? `${tracking.telemetry.speed} kn` : '—' },
                                { label: t('track.eta'), value: tracking.eta || '—' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 font-inter">{item.label}</div>
                                    <div className="text-sm font-bold text-white font-inter">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Route progress */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-center">
                                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Anchor className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] font-bold text-white uppercase font-inter">{tracking.origin}</div>
                            </div>
                            <div className="flex-1 px-4 relative">
                                <div className="h-px bg-white/10 w-full relative">
                                    <div className="absolute inset-0 bg-white/40 w-1/2" />
                                    <Ship className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-white/[0.04] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <MapPin className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase font-inter">{tracking.destination}</div>
                            </div>
                        </div>
                        {tracking.events?.length > 0 && (
                            <div className="space-y-4">
                                {tracking.events.map((ev: any, i: number) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-white' : 'bg-zinc-700'}`} />
                                        <div>
                                            <div className={`text-sm font-bold font-inter ${i === 0 ? 'text-white' : 'text-zinc-500'}`}>{ev.title}</div>
                                            <div className="text-xs text-zinc-600 font-inter">{ev.subtitle}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-white font-outfit uppercase tracking-widest mb-4">Actions</h3>
                        <div className="space-y-2">
                            <Link
                                href="/dashboard/messages"
                                className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all font-inter"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Message Forwarder
                            </Link>
                            <a
                                href={`mailto:support@cargolink.sa?subject=Tracking Inquiry: ${id}`}
                                className="w-full flex items-center justify-center border border-white/10 text-zinc-400 py-2.5 rounded-xl text-xs font-bold hover:border-white/20 hover:text-white transition-all font-inter"
                            >
                                {t('track.contact.agent')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TrackingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
            <Navbar />
            <main className="pt-24 pb-12">
                <Suspense fallback={<FullPageSpinner />}>
                    <TrackingContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}
