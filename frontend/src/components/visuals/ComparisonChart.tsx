'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ComparisonChart() {
    return (
        <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex justify-between items-end mb-12">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Outperforming the industry.</h3>
                    <p className="text-gray-400">OMEGO vs Legacy Freight</p>
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-sm font-bold">OMEGO</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                        <span className="text-sm text-gray-500">Industry Avg.</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-8 h-64 items-end">
                {/* Accuracy */}
                <div className="flex flex-col gap-2 group">
                    <div className="relative h-full flex items-end gap-2">
                        <div className="w-full bg-zinc-800 rounded-t-lg h-[40%] group-hover:bg-zinc-700 transition-colors"></div>
                        <div className="w-full bg-blue-500 rounded-t-lg h-[98%] shadow-[0_0_20px_rgba(59,130,246,0.3)] relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 text-xs px-2 py-1 rounded">99.9%</div>
                        </div>
                    </div>
                    <span className="text-xs text-center font-bold text-gray-400 uppercase tracking-wider">Rank Accuracy</span>
                </div>

                {/* Speed */}
                <div className="flex flex-col gap-2 group">
                    <div className="relative h-full flex items-end gap-2">
                        <div className="w-full bg-zinc-800 rounded-t-lg h-[20%] group-hover:bg-zinc-700 transition-colors"></div>
                        <div className="w-full bg-blue-500 rounded-t-lg h-[95%] shadow-[0_0_20px_rgba(59,130,246,0.3)] relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 text-xs px-2 py-1 rounded">Real-time</div>
                        </div>
                    </div>
                    <span className="text-xs text-center font-bold text-gray-400 uppercase tracking-wider">Update Speed</span>
                </div>

                {/* Depth */}
                <div className="flex flex-col gap-2 group">
                    <div className="relative h-full flex items-end gap-2">
                        <div className="w-full bg-zinc-800 rounded-t-lg h-[50%] group-hover:bg-zinc-700 transition-colors"></div>
                        <div className="w-full bg-purple-500 rounded-t-lg h-[90%] shadow-[0_0_20px_rgba(168,85,247,0.3)] relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 text-xs px-2 py-1 rounded">High</div>
                        </div>
                    </div>
                    <span className="text-xs text-center font-bold text-gray-400 uppercase tracking-wider">Data Depth</span>
                </div>

                {/* Efficiency */}
                <div className="flex flex-col gap-2 group">
                    <div className="relative h-full flex items-end gap-2">
                        <div className="w-full bg-zinc-800 rounded-t-lg h-[60%] group-hover:bg-zinc-700 transition-colors"></div>
                        <div className="w-full bg-pink-500 rounded-t-lg h-[85%] shadow-[0_0_20px_rgba(236,72,153,0.3)] relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 text-xs px-2 py-1 rounded">Best</div>
                        </div>
                    </div>
                    <span className="text-xs text-center font-bold text-gray-400 uppercase tracking-wider">Cost Efficiency</span>
                </div>
            </div>
        </div>
    )
}
