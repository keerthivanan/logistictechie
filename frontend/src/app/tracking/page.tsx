'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Ship, MapPin, Package, Clock, Shield, Search, Globe, ChevronRight, Loader2, Anchor, ShieldCheck, AlertTriangle } from 'lucide-react'
import { API_URL } from '@/lib/config'

function TrackingContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [tracking, setTracking] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchTracking()
        }
    }, [id])

    const fetchTracking = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/api/tracking/${id}`)
            const data = await res.json()
            setTracking(data)
        } catch (e) {
            console.error('Tracking fetch failed', e)
        } finally {
            setLoading(false)
        }
    }

    if (!id) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Global Tracking</h2>
            <p className="text-gray-400 mb-8">Enter a Booking Reference or Container ID to initialize telemetry.</p>
            <div className="max-w-md mx-auto flex gap-2">
                <input
                    type="text"
                    placeholder="BK-XXXXXXXX or MRKU1234567"
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white transition-all"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            window.location.href = `/tracking?id=${(e.target as HTMLInputElement).value}`
                        }
                    }}
                />
                <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                    Track
                </button>
            </div>
        </div>
    )

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-white" />
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">Connecting to AIS Satellite Node...</div>
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
                                Live AIS Signal
                            </div>
                            <span className="text-gray-500 text-xs">Last updated: Just now</span>
                        </div>

                        <h1 className="text-4xl font-bold mb-2">{tracking?.vessel_name || 'NEO-PANAMAX CLASS'}</h1>
                        <p className="text-gray-400 font-mono text-sm mb-8">TELEMETRY ID: AIS-{id?.substring(0, 6).toUpperCase()} • Ref: {id}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Status</div>
                                <div className="text-green-400 font-bold">{tracking?.status || 'Active Transit'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Position</div>
                                <div className="text-white font-bold">
                                    {tracking?.telemetry?.lat ? `${tracking.telemetry.lat}° N, ${tracking.telemetry.lon}° E` : 'Searching AIS...'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Speed</div>
                                <div className="text-white font-bold">{tracking?.telemetry?.speed || '14.0'} knots</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">ETA</div>
                                <div className="text-white font-bold">{tracking?.eta || 'CALCULATING...'}</div>
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
                                <div className="text-[10px] text-gray-500 italic">Expected 27d</div>
                            </div>
                        </div>

                        {/* Event Log */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Vessel passing Jebel Ali Corridor</div>
                                    <div className="text-xs text-gray-500">Live Telemetry Report • 2 hours ago</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-zinc-700 mt-2"></div>
                                <div>
                                    <div className="text-sm font-bold text-gray-400">Cargo Handover - CNSHA Base Node</div>
                                    <div className="text-xs text-gray-600">Authenticated Transaction • Feb 16, 2026</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Sentinel Insights */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            Sentinel Health Scan
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-black/50 rounded-xl border border-white/5">
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Route Security</div>
                                <div className="text-sm text-green-400 font-bold">OPTIMAL (98/100)</div>
                            </div>
                            <div className="p-4 bg-black/50 rounded-xl border border-white/5">
                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Weather Prediction</div>
                                <div className="text-sm text-white font-bold">Stable Current (2.4m Swells)</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-2 text-orange-500">
                            <AlertTriangle className="w-5 h-5" />
                            Suez Advisory
                        </h3>
                        <p className="text-xs text-orange-400 leading-relaxed">
                            Awaiting verification for Suez convoy. Current congestion index at Port Said is High. Possible +12h delay.
                        </p>
                    </div>

                    <div className="bg-white text-black rounded-3xl p-6">
                        <h3 className="font-bold mb-4">Actions</h3>
                        <button className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all mb-3">
                            Request Inspection Report
                        </button>
                        <button className="w-full border border-black/10 text-black py-3 rounded-xl font-bold text-sm hover:bg-black/5 transition-all">
                            Contact Agent
                        </button>
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
                <Suspense fallback={<div className="text-center py-20">Initializing Sovereign Trace...</div>}>
                    <TrackingContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}
