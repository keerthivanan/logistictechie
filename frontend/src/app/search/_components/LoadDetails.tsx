'use client'

import { motion } from 'framer-motion'
import { Box, Layers, Weight, Ruler } from 'lucide-react'
import { Load } from './types'

export default function LoadDetails({ load, setLoad }: { load: Load, setLoad: (l: Load) => void }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Left Side: Load Metrics */}
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase italic mb-6">Load Intelligence</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-4 hover:border-white/10 transition-colors">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Total Units</span>
                            <div className="flex items-center gap-4">
                                <Box className="w-5 h-5 text-white opacity-40" />
                                <input
                                    type="number"
                                    value={load.units}
                                    onChange={(e) => setLoad({ ...load, units: parseInt(e.target.value) || 0 })}
                                    className="bg-transparent text-3xl font-black text-white focus:outline-none w-full tracking-tighter"
                                />
                            </div>
                        </div>

                        {load.mode === 'FCL' ? (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-4 hover:border-white/10 transition-colors">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Container Scale</span>
                                <div className="flex items-center gap-4">
                                    <Layers className="w-5 h-5 text-white opacity-40" />
                                    <select
                                        value={load.containerType}
                                        onChange={(e) => setLoad({ ...load, containerType: e.target.value as any })}
                                        className="bg-transparent text-xl font-black text-white focus:outline-none w-full tracking-tighter uppercase"
                                    >
                                        <option value="20FT" className="bg-zinc-900">20' Standard</option>
                                        <option value="40FT" className="bg-zinc-900">40' Standard</option>
                                        <option value="40HC" className="bg-zinc-900">40' High-Cube</option>
                                        <option value="45HC" className="bg-zinc-900">45' High-Cube</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-4 hover:border-white/10 transition-colors">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Gross Weight</span>
                                <div className="flex items-center gap-4">
                                    <Weight className="w-5 h-5 text-white opacity-40" />
                                    <div className="flex items-baseline gap-2">
                                        <input
                                            type="text"
                                            value={load.weight.value}
                                            onChange={(e) => setLoad({ ...load, weight: { ...load.weight, value: e.target.value } })}
                                            className="bg-transparent text-3xl font-black text-white focus:outline-none w-20 tracking-tighter"
                                            placeholder="0"
                                        />
                                        <span className="text-xs font-black text-zinc-600 uppercase">KG</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Visual Scale */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] p-10 flex items-center justify-center relative overflow-hidden group">
                <div className="relative z-10 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform duration-500">
                        {load.mode === 'Air' ? <Plane className="w-10 h-10 text-black" /> : <Ship className="w-10 h-10 text-black" />}
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white tracking-tighter uppercase">Vessel Eligibility Verified</h4>
                        <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto mt-2">
                            Load parameters compatible with global sovereign fleet.
                        </p>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
                </div>
            </div>
        </div>
    )
}

import { Plane, Ship } from 'lucide-react'
