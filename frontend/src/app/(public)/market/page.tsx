"use client";

import { motion } from "framer-motion";
import { Zap, Globe, Shield, TrendingUp, BarChart3, ArrowUpRight } from "lucide-react";
import InfogramChart from "@/components/widgets/InfogramChart";

export default function MarketPage() {
    const marketIndices = [
        { id: "01", name: "SCFI_INDEX", value: "2,143.50", change: "+1.2%", status: "UPWARD" },
        { id: "02", name: "BDI_DRY_BULK", value: "1,894.00", change: "-0.5%", status: "STABLE" },
        { id: "03", name: "AIR_FREIGHT_G2", value: "4.82/KG", change: "+2.4%", status: "URGENT" }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-48"
                >
                    <span className="arch-label mb-12 block">INTELLIGENCE</span>
                    <h1 className="arch-heading">Market Data</h1>
                </motion.div>

                {/* Index Matrix - Numbered Pattern */}
                <div className="grid md:grid-cols-3 gap-16 border-t border-white/5 pt-32 mb-64">
                    {marketIndices.map((idx) => (
                        <div key={idx.id} className="arch-detail-line group cursor-default">
                            <span className="arch-number block mb-8 transition-all group-hover:text-white">{idx.id}</span>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-light text-white uppercase tracking-tight">{idx.name}</h3>
                                <div className="text-5xl font-black italic text-zinc-900 group-hover:text-emerald-500 transition-colors duration-1000 tracking-tighter tabular-nums">
                                    {idx.value}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="arch-label">{idx.change}</span>
                                    <div className="h-[1px] flex-1 bg-white/5" />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${idx.status === 'URGENT' ? 'text-red-500' : 'text-zinc-800'}`}>{idx.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Primary Visualization Nodes */}
                <div className="space-y-64">
                    <div className="grid lg:grid-cols-[1fr,2.5fr] gap-32 border-t border-white/5 pt-32">
                        <div className="space-y-12">
                            <span className="arch-label block">GLOBAL_CORRIDORS</span>
                            <h2 className="text-5xl font-light text-white leading-tight">Maritime <br />Intelligence</h2>
                            <p className="text-xl text-zinc-500 leading-relaxed max-w-sm">
                                High-fidelity tracking of trans-pacific and trans-atlantic freight corridors using sovereign AI prediction.
                            </p>
                            <div className="arch-detail-line p-8 bg-zinc-950/20">
                                <span className="arch-label block mb-4 italic text-zinc-400">TECHNICAL_NOTE</span>
                                <p className="text-[11px] font-bold text-zinc-700 leading-normal uppercase tracking-widest leading-loose">
                                    Data extracted from 12,000+ autonomous maritime logs and refreshed via millisecond API linkage.
                                </p>
                            </div>
                        </div>
                        <div className="h-[600px] border border-white/5 p-8 bg-zinc-950/10">
                            <InfogramChart dataId="3595eb48-cb86-455b-801a-8e29a8a72ec2" title="Global Sea Freight Index" />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[2.5fr,1fr] gap-32 border-t border-white/5 pt-32">
                        <div className="h-[600px] border border-white/5 p-8 bg-zinc-950/10 order-2 lg:order-1">
                            <InfogramChart dataId="d2c0b6b2-ef67-4632-9cb9-897d91cb61d8" title="Global Vessel Capacity Index" />
                        </div>
                        <div className="space-y-12 order-1 lg:order-2 lg:text-right">
                            <span className="arch-label block">ECONOMIC_LOAD</span>
                            <h2 className="text-5xl font-light text-white leading-tight">Vessel <br />Capacity</h2>
                            <p className="text-xl text-zinc-500 leading-relaxed max-w-sm lg:ml-auto">
                                Analyzing total available planetary tonnage to predict capacity crunches and optimize routing windows.
                            </p>
                            <div className="arch-detail-line lg:border-l-0 lg:border-r lg:pr-8 bg-zinc-950/20">
                                <span className="arch-label block mb-4 italic text-zinc-400">DATA_RELIABILITY</span>
                                <p className="text-[11px] font-bold text-zinc-700 leading-normal uppercase tracking-widest leading-loose">
                                    100% Honest Data Legitimacy sourced directly from Port Authorities and Global Node Monitors.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-footer Context */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">SENSORS_ACTIVE</span>
                    <h2 className="arch-heading italic mb-16">Global Pulse.</h2>
                    <div className="flex justify-center gap-12 mt-24">
                        <ArrowUpRight className="w-12 h-12 text-zinc-900 animate-pulse" />
                        <ArrowUpRight className="w-12 h-12 text-zinc-900 animate-pulse [animation-delay:0.2s]" />
                        <ArrowUpRight className="w-12 h-12 text-zinc-900 animate-pulse [animation-delay:0.4s]" />
                    </div>
                </div>
            </div>

            {/* Minimal Sub-footer */}
            <div className="border-t border-white/5 py-32 bg-black">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-900 uppercase">
                    <span>LIVE_MARKET_FEED_V2.0</span>
                    <span>STRUCTURAL_INTEGRITY_SAFE</span>
                </div>
            </div>
        </main>
    );
}
