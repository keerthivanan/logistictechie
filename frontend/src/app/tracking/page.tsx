'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Ship, MapPin, Anchor, CheckCircle, AlertTriangle } from 'lucide-react'
import { Spinner, FullPageSpinner } from '@/components/ui/Spinner'
import { apiFetch } from '@/lib/config'
import { useT } from '@/lib/i18n/t'

function TrackingContent() {
    const t = useT()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [tracking, setTracking] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [inputId, setInputId] = useState('')

    const fetchTracking = useCallback(async () => {
        try {
            setLoading(true)
            const res = await apiFetch(`/api/tracking/${id}`)
            const data = await res.json()
            setTracking(data)
        } catch (e) {
            console.error('Tracking fetch failed', e)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) {
            fetchTracking()
        }
    }, [id, fetchTracking])

    if (!id) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('track.title')}</h2>
            <p className="text-gray-400 mb-8">{t('track.sub')}</p>
            <div className="max-w-md mx-auto flex gap-2">
                <input
                    type="text"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    placeholder={t('track.placeholder')}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white transition-all"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputId.trim()) {
                            window.location.href = `/tracking?id=${encodeURIComponent(inputId.trim())}`
                        }
                    }}
                />
                <button
                    onClick={() => { if (inputId.trim()) window.location.href = `/tracking?id=${encodeURIComponent(inputId.trim())}` }}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                    {t('track.cta')}
                </button>
            </div>
        </div>
    )

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">{t('track.connecting')}</div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Master Telemetry */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Ship className="w-24 h-24 text-white/5" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/30 uppercase tracking-widest">
                                {t('track.live.signal')}
                            </div>
                            <span className="text-gray-500 text-xs">{t('track.last.updated')}</span>
                        </div>

                        <h1 className="text-4xl font-bold mb-2">{tracking?.vessel_name || 'NEO-PANAMAX CLASS'}</h1>
                        <p className="text-gray-400 font-mono text-sm mb-8">TELEMETRY ID: AIS-{id?.substring(0, 6).toUpperCase()} • Ref: {id}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('track.status')}</div>
                                <div className="text-white font-bold">{tracking?.status || t('track.active.transit')}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('track.position')}</div>
                                <div className="text-white font-bold">
                                    {tracking?.telemetry?.lat ? `${tracking.telemetry.lat}° N, ${tracking.telemetry.lon}° E` : t('track.searching')}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('track.speed')}</div>
                                <div className="text-white font-bold">{tracking?.telemetry?.speed || '14.0'} knots</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('track.eta')}</div>
                                <div className="text-white font-bold">{tracking?.eta || t('track.calculating')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Visual */}
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-12">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    <Anchor className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-bold text-white uppercase">{tracking?.origin || 'YANTIAN'}</div>
                                <div className="text-[10px] text-gray-500">Feb 15, 2026</div>
                            </div>
                            <div className="flex-1 px-4 relative">
                                <div className="h-0.5 bg-white/10 w-full relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-white w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <div className="absolute top-1/2 left-[65%] transform -translate-y-1/2 -translate-x-1/2">
                                        <Ship className="w-5 h-5 text-white animate-bounce" />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-zinc-800 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/5">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-bold text-gray-500 uppercase">{tracking?.destination || 'ROTTERDAM'}</div>
                                <div className="text-[10px] text-gray-500 italic">{t('track.expected')}</div>
                            </div>
                        </div>

                        {/* Event Log */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                                <div>
                                    <div className="text-sm font-bold text-white">{t('track.event1.title')}</div>
                                    <div className="text-xs text-gray-500">{t('track.event1.sub')}</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-zinc-700 mt-2"></div>
                                <div>
                                    <div className="text-sm font-bold text-gray-400">{t('track.event2.title')}</div>
                                    <div className="text-xs text-gray-600">{t('track.event2.sub')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Sentinel Insights */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-white" />
                            {t('track.sentinel')}
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-black/50 rounded-xl border border-white/5">
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('track.route.security')}</div>
                                <div className="text-sm text-white font-bold">OPTIMAL (98/100)</div>
                            </div>
                            <div className="p-4 bg-black/50 rounded-xl border border-white/5">
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('track.weather')}</div>
                                <div className="text-sm text-white font-bold">Stable Current (2.4m Swells)</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-2 text-orange-500">
                            <AlertTriangle className="w-5 h-5" />
                            {t('track.advisory')}
                        </h3>
                        <p className="text-xs text-orange-400 leading-relaxed">
                            {t('track.advisory.text')}
                        </p>
                    </div>

                    <div className="bg-white text-black rounded-3xl p-6">
                        <h3 className="font-bold mb-4">{t('track.actions')}</h3>
                        <button
                            onClick={() => window.print()}
                            className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all mb-3"
                        >
                            {t('track.inspect.btn')}
                        </button>
                        <a
                            href={`mailto:support@cargolink.io?subject=Tracking Inquiry: ${id || 'N/A'}`}
                            className="w-full border border-black/10 text-black py-3 rounded-xl font-bold text-sm hover:bg-black/5 transition-all flex items-center justify-center"
                        >
                            {t('track.contact.agent')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TrackingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
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
