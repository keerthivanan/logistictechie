'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ComparisonChart() {
    return (
        <div className="bg-black border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Subtle Grid Lines */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-16">
                    <div>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-3xl font-bold mb-2 tracking-tight"
                        >
                            Outperforming the industry.
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-zinc-500 font-medium"
                        >
                            SOVEREIGN <span className="text-zinc-700 mx-2">vs</span> Legacy Freight
                        </motion.p>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                            <span className="text-xs font-black tracking-widest uppercase">SOVEREIGN</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                            <span className="text-xs font-black tracking-widest uppercase text-zinc-600">Industry Avg.</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-12 h-72 items-end px-4">
                    {[
                        { label1: 'RANK', label2: 'ACCURACY', value: '99.9%', percent: 98, industryLevel: 45 },
                        { label1: 'UPDATE', label2: 'SPEED', value: 'Real-time', percent: 95, industryLevel: 25 },
                        { label1: 'DATA', label2: 'DEPTH', value: 'High', percent: 90, industryLevel: 55 },
                        { label1: 'COST', label2: 'EFFICIENCY', value: 'Best', percent: 85, industryLevel: 65 },
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-8 group relative">
                            <div className="relative h-full flex items-end justify-center gap-3">
                                {/* Tooltip Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    className="absolute -top-14 left-1/2 -translate-x-1/2 z-20"
                                >
                                    <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 text-[10px] px-3.5 py-2 rounded-xl text-white font-bold shadow-2xl whitespace-nowrap">
                                        {item.value}
                                    </div>
                                    <div className="w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45 mx-auto -mt-1 shadow-2xl"></div>
                                </motion.div>

                                {/* Industry Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${item.industryLevel}%` }}
                                    transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                                    className="w-14 bg-zinc-900 rounded-t-2xl border-x border-t border-white/5 relative overflow-hidden group-hover:bg-zinc-800 transition-colors"
                                >
                                </motion.div>

                                {/* Sovereign Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${item.percent}%` }}
                                    transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: idx * 0.1 }}
                                    className="w-14 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)] relative group-hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] transition-all duration-500"
                                >
                                    {/* Top Highlight */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-2xl"></div>

                                    {/* Scan Effect */}
                                    <motion.div
                                        animate={{
                                            top: ['-20%', '120%'],
                                            opacity: [0, 1, 0]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: idx * 0.5,
                                            ease: "linear"
                                        }}
                                        className="absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none"
                                    />
                                </motion.div>
                            </div>

                            {/* Labels */}
                            <div className="text-center space-y-1">
                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-tight group-hover:text-zinc-300 transition-colors">{item.label1}</div>
                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-tight group-hover:text-blue-400 transition-colors">{item.label2}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
