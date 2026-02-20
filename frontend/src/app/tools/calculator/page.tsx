'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calculator, ArrowRight, Info, Zap, Shield, BarChart3, Loader2, ShieldCheck, MapPin, RefreshCw, Package } from 'lucide-react'
import { API_URL } from '@/lib/config'

export default function CalculatorPage() {
    const [origin, setOrigin] = useState('CNSHA')
    const [destination, setDestination] = useState('SAJED')
    const [container, setContainer] = useState('40FT')
    const [commodity, setCommodity] = useState('General')
    const [goodsValue, setGoodsValue] = useState('50000')
    const [calculating, setCalculating] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCalculating(true)
        try {
            const res = await fetch(`${API_URL}/api/quotes/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin,
                    destination,
                    container,
                    commodity,
                    goods_value: parseFloat(goodsValue)
                })
            })
            const data = await res.json()
            if (data.success) {
                setResult(data.data)
            }
        } catch (e) {
            console.error('Calculation failed', e)
        } finally {
            setCalculating(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                        <div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                                Precision <br />Freight <span className="text-gray-500 italic">Calc</span>
                            </h1>
                        </div>
                        <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verification</div>
                                <div className="text-sm font-bold text-white">L1 Blockchain Authenticated</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Inputs */}
                        <div className="lg:col-span-1 space-y-6">
                            <form onSubmit={handleCalculate} className="bg-zinc-900 border border-white/10 rounded-3xl p-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Trade Corridor</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={origin}
                                                onChange={(e) => setOrigin(e.target.value)}
                                                placeholder="Origin"
                                                className="w-full bg-black border border-white/10 p-3 pl-10 rounded-xl text-sm focus:border-white transition-colors"
                                            />
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                placeholder="Dest"
                                                className="w-full bg-black border border-white/10 p-3 pl-10 rounded-xl text-sm focus:border-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Transport Details</label>
                                    <select
                                        value={container}
                                        onChange={(e) => setContainer(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm mb-4"
                                    >
                                        <option value="20FT">20' Dry Container</option>
                                        <option value="40FT">40' Dry Container</option>
                                        <option value="40HC">40' High Cube</option>
                                    </select>
                                    <select
                                        value={commodity}
                                        onChange={(e) => setCommodity(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm"
                                    >
                                        <option value="General">General Cargo</option>
                                        <option value="Hazardous">Hazardous (IMDG)</option>
                                        <option value="Refrigerated">Refrigerated</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Commercial Value (USD)</label>
                                    <input
                                        type="number"
                                        value={goodsValue}
                                        onChange={(e) => setGoodsValue(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={calculating}
                                    className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {calculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Recalculate Quote</>}
                                </button>
                            </form>
                        </div>

                        {/* Results Display */}
                        <div className="lg:col-span-2">
                            {!result && !calculating && (
                                <div className="h-full flex items-center justify-center border border-white/5 rounded-3xl p-12 text-center">
                                    <div className="max-w-xs">
                                        <Calculator className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500">Configure your trade corridor to see the baseline Sovereign rates.</p>
                                    </div>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Calculator className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Estimated Landed Cost</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-7xl font-bold">${result.total_landed.toLocaleString()}</span>
                                                <span className="text-xl text-gray-500 font-bold">{result.currency}</span>
                                            </div>
                                            <p className="mt-4 text-gray-400 font-medium max-w-lg">
                                                {result.wisdom}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
                                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest">Rate Breakdown</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Ocean Freight (Net)</span>
                                                    <span className="font-mono text-white">${result.price - result.breakdown.terminal_handling - result.breakdown.surcharges}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">THC (Terminal Handling)</span>
                                                    <span className="font-mono text-white">${result.breakdown.terminal_handling}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Surcharges (BAF/PSS)</span>
                                                    <span className="font-mono text-white">${result.breakdown.surcharges}</span>
                                                </div>
                                                <div className="border-t border-white/5 pt-4 flex justify-between font-bold">
                                                    <span className="text-gray-300">Duty/Tax Estimate</span>
                                                    <span className="text-purple-400">${result.duty_estimate}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
                                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-widest">Transit Intelligence</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Estimated Transit</span>
                                                    <span className="text-white font-bold">{result.transit_time} Days</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Port Congestion</span>
                                                    <span className="text-orange-400 font-bold">{result.breakdown.port_congestion}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Daily Market Pulse</span>
                                                    <span className="text-blue-400 font-bold">{result.breakdown.daily_pulse}x</span>
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-white/5">
                                                <button className="w-full bg-zinc-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                                                    <Package className="w-4 h-4" /> Ship Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
