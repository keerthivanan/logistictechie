'use client'

import { motion } from 'framer-motion'
import { Ship, Plane, Package } from 'lucide-react'
import { Load } from './types'

export default function SearchHeader({ mode, setMode }: { mode: 'LCL' | 'FCL' | 'Air', setMode: (m: 'LCL' | 'FCL' | 'Air') => void }) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
            >
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.8]">
                    TRU<span className="text-zinc-600">OCEAN</span>
                </h1>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.5em] ml-1">
                    Sovereign Logistics Protocol &bull; V3.1
                </p>
            </motion.div>

            <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/5 backdrop-blur-xl">
                {[
                    { id: 'FCL', label: 'Full Container', icon: Ship },
                    { id: 'LCL', label: 'Shared Load', icon: Package },
                    { id: 'Air', label: 'Air Freight', icon: Plane }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setMode(item.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === item.id
                                ? 'bg-white text-black shadow-2xl'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon className={`w-4 h-4 ${mode === item.id ? 'text-black' : 'text-zinc-600'}`} />
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
