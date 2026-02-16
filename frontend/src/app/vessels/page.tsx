'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Ship, Globe, Shield, Activity, Anchor } from 'lucide-react'

export default function VesselsPage() {
    const [vessels, setVessels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('http://localhost:8000/api/vessels/active')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setVessels(data.vessels)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />
            <main className="pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Anchor className="w-6 h-6 text-blue-500" />
                            <h1 className="text-4xl font-bold tracking-tighter uppercase">Maritime Assets</h1>
                        </div>
                        <p className="text-gray-400 max-w-2xl text-lg">
                            Global fleet telemetry. Real-time AIS monitoring and vessel performance analytics across all core trade lanes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-64 bg-zinc-900/50 border border-white/5 rounded-2xl animate-pulse"></div>
                            ))
                        ) : (
                            vessels.map((v, i) => (
                                <div key={i} className="group bg-zinc-900 border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Ship className="w-48 h-48" />
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{v.name}</h3>
                                            <div className="text-[10px] font-mono text-gray-500">IMO: {v.imo} • FLAG: {v.flag}</div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-xl">
                                            <Shield className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Operator</div>
                                            <div className="text-sm font-bold text-white">{v.operator}</div>
                                        </div>
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</div>
                                            <div className="text-sm font-bold text-green-400 flex items-center gap-1">
                                                <div className="w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                                                UNDERWAY
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Activity className="w-4 h-4" />
                                            <span>Telemetry: Optimal</span>
                                        </div>
                                        <button className="text-white font-bold underline underline-offset-4 hover:text-blue-400 transition-colors">
                                            Live AIS View
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-20 p-12 bg-white text-black rounded-[3rem] text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <Globe className="w-12 h-12 mx-auto mb-6" />
                            <h2 className="text-4xl font-bold mb-4 tracking-tighter">Unified Fleet Command</h2>
                            <p className="max-w-xl mx-auto mb-8 font-medium">
                                Integrate your own fleet assets directly into the Sovereign node for 100% deterministic tracking.
                            </p>
                            <button className="bg-black text-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-transform">
                                Request Enterprise Integration
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
