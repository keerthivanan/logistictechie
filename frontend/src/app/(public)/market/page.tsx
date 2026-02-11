"use client";

import { motion } from "framer-motion";
import InfogramChart from "@/components/widgets/InfogramChart";
import { Zap, Globe, Shield, TrendingUp, BarChart3 } from "lucide-react";

export default function MarketPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 pt-48 pb-48 relative z-10">
                {/* Cinematic Header */}
                <div className="flex flex-col mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-[1px] bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">GLOBAL_ECONOMICS</span>
                        </div>
                        <h1 className="titan-text mb-8">
                            Market. <br />
                            <span className="text-zinc-900 group">Intelligence.</span>
                        </h1>
                        <p className="max-w-3xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] leading-relaxed border-l-2 border-white/5 pl-12">
                            Real-time macroeconomic benchmarks and high-velocity predictive telemetry <br />
                            <span className="text-zinc-800">synchronized via specialized global carrier networks.</span>
                        </p>
                    </motion.div>
                </div>

                {/* Primary Global Indices */}
                <div className="grid lg:grid-cols-2 gap-0 border border-white/5 mb-32 bg-zinc-950/20">
                    <div className="p-12 md:p-16 border-r border-white/5 group hover:bg-zinc-950/40 transition-all duration-700">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-6">
                                <div className="h-12 w-12 bg-zinc-900 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.6em]">FREIGHTOS_AIR_INDEX (FAX)</h3>
                            </div>
                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" /> LIVE_SYNC
                            </div>
                        </div>
                        <div className="elite-card p-1 grayscale group-hover:grayscale-0 transition-all duration-1000">
                            <InfogramChart
                                title="Air Freight Intelligence"
                                dataId="_/11uV8DUwjiugBxwssg1C"
                                className="min-h-[600px] contrast-125"
                            />
                        </div>
                    </div>

                    <div className="p-12 md:p-16 group hover:bg-zinc-950/40 transition-all duration-700">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-6">
                                <div className="h-12 w-12 bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.6em]">FREIGHTOS_BALTIC_INDEX (FBX)</h3>
                            </div>
                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" /> LIVE_SYNC
                            </div>
                        </div>
                        <div className="elite-card p-1 grayscale group-hover:grayscale-0 transition-all duration-1000">
                            <InfogramChart
                                title="Maritime Freight Intelligence"
                                dataId="_/AcDi5xXouXrzQMLqbVpj"
                                className="min-h-[600px] contrast-125"
                            />
                        </div>
                    </div>
                </div>

                {/* Corridor Specific Telemetry */}
                <div className="mb-24 pt-32 border-t border-white/5">
                    <div className="flex items-end justify-between mb-24">
                        <div>
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                                Corridor. <span className="text-zinc-900">Logic.</span>
                            </h2>
                            <div className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.8em]">NODE_SPECIFIC_TELEMETRY_STREAM</div>
                        </div>
                        <div className="flex items-center gap-12 mb-8">
                            <TrendingUp className="w-6 h-6 text-zinc-950" />
                            <div className="w-24 h-[1px] bg-white/5" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {[
                            { title: "FBX01: CHINA / NA_WEST_COAST", id: "_/iWaVJnijhUTxyFOJszmw" },
                            { title: "FBX03: CHINA / NA_EAST_COAST", id: "_/iU90H18RtmIZ82eRtOdF" },
                            { title: "FBX11: CHINA / NORTH_EUROPE", id: "_/64yDIIsZPdLEdOaaq4q6" },
                            { title: "FBX13: CHINA / MEDITERRANEAN", id: "_/yaGUtPV8Th3j5czlzctX" }
                        ].map((idx, i) => (
                            <motion.div
                                key={idx.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="elite-card p-12 relative group hover:bg-zinc-950/20 transition-all duration-1000"
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] group-hover:text-white transition-colors">{idx.title}</h4>
                                    <BarChart3 className="w-4 h-4 text-zinc-900 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <div className="grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2000ms]">
                                    <InfogramChart
                                        title={idx.title}
                                        dataId={idx.id}
                                        className="min-h-[500px]"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
