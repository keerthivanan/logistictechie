"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Package, MapPin, Clock, Loader2, Ship, Zap, Globe, Shield } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { logisticsClient } from "@/lib/logistics";

interface TrackingEvent {
    event: string;
    status: 'done' | 'current' | 'pending';
    loc: string;
    date: string;
}

interface TrackingResult {
    status: string;
    eta: string;
    events: TrackingEvent[];
}

export default function TrackingPage() {
    const [id, setId] = useState("");
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTrack = async () => {
        setIsLoading(true);
        // Simulate higher fidelity loading for tactical feel
        await new Promise(resolve => setTimeout(resolve, 800));
        const data = await logisticsClient.trackContainer(id || "MSCU1234567");
        setResult(data);
        setIsLoading(false);
    };

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
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">GLOBAL_TELEMETRY_SYNC</span>
                        </div>
                        <h1 className="titan-text mb-8">
                            Real-time. <br />
                            <span className="text-zinc-900 group">Intelligence.</span>
                        </h1>
                        <p className="max-w-2xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] leading-relaxed">
                            Orbital tracking and carrier-direct data streams. <br />
                            <span className="text-zinc-800">No Latency. No Assumptions.</span>
                        </p>
                    </motion.div>
                </div>

                {/* Tactical Search Interface */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="mb-32 max-w-5xl"
                >
                    <div className="p-[1px] bg-gradient-to-r from-emerald-500/20 via-white/5 to-transparent">
                        <div className="flex flex-col md:flex-row gap-0 bg-black backdrop-blur-3xl p-2 relative group">
                            <div className="relative flex-1">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-800 group-focus-within/field:text-emerald-500 transition-colors" />
                                <input
                                    placeholder="INPUT_UNIT_IDENTIFIER (CONTAINER / BOL)..."
                                    className="w-full h-20 pl-20 bg-transparent border-none text-white placeholder:text-zinc-900 font-black text-xs uppercase tracking-[0.3em] outline-none"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                                />
                            </div>
                            <Button
                                onClick={handleTrack}
                                disabled={isLoading}
                                className="h-20 px-16 bg-white text-black hover:bg-emerald-500 rounded-none font-black text-[11px] uppercase tracking-[0.5em] transition-all duration-700 shadow-[0_20px_60px_rgba(255,255,255,0.05)]"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "INITIATE_SYNC"}
                            </Button>
                        </div>
                    </div>
                </motion.section>

                <AnimatePresence mode="wait">
                    {result ? (
                        <motion.section
                            key="result"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-32"
                        >
                            {/* HUD Visualization */}
                            <div className="grid lg:grid-cols-12 gap-16">
                                {/* Synthetic Map Interface */}
                                <div className="lg:col-span-8 h-[700px] border border-white/5 bg-zinc-950/40 relative group overflow-hidden">
                                    <div className="absolute top-10 left-10 z-20 flex items-center gap-4 bg-black/90 backdrop-blur-2xl px-8 py-4 border border-white/5">
                                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white">ORBITAL_TELEMETRY_LINK_V4</span>
                                    </div>
                                    <RouteMap
                                        origin={result.events[0].loc}
                                        destination={result.events[result.events.length - 1].loc}
                                        className="w-full h-full grayscale invert opacity-30 contrast-150 saturate-0 scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

                                    {/* Scanlines Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]" />
                                </div>

                                {/* Tactical Metrics Rack */}
                                <div className="lg:col-span-4 flex flex-col gap-8">
                                    {[
                                        { label: "CURRENT_STATUS", value: result.status, icon: Ship, accent: "emerald-500" },
                                        { label: "EST_ARRIVAL", value: result.eta, icon: Clock, accent: "white" },
                                        { label: "UNIT_ID", value: id || "MSCU1234567", icon: Package, accent: "zinc-700" }
                                    ].map((stat, i) => (
                                        <div key={i} className="elite-card p-12 group hover:bg-zinc-950/40 transition-colors cursor-default">
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-hover:text-emerald-500 transition-colors">
                                                    {stat.label}
                                                </div>
                                                <stat.icon className={`h-5 w-5 text-zinc-800 transition-all duration-700 group-hover:text-white group-hover:rotate-12`} />
                                            </div>
                                            <div className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                                                {stat.value}
                                            </div>
                                            <div className={`absolute bottom-0 left-0 h-[1px] bg-emerald-500 w-0 group-hover:w-full transition-all duration-1000`} />
                                        </div>
                                    ))}

                                    {/* Live Connection Card */}
                                    <div className="p-10 border border-emerald-500/10 bg-emerald-500/[0.02] mt-auto">
                                        <div className="flex items-center gap-4 mb-6">
                                            <Globe className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">ENCRYPTED_STREAMING</span>
                                        </div>
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 leading-relaxed">
                                            Direct satellite uplink established. Neural telemetry synchronized with Global Node 08.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Log - Ultra Tactical */}
                            <div className="border-t border-white/5 pt-32">
                                <div className="flex items-end justify-between mb-20">
                                    <div>
                                        <h2 className="text-5xl font-black italic uppercase italic-heading text-white tracking-widest leading-none mb-6">
                                            Telemetry_Log
                                        </h2>
                                        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.6em]">HISTORICAL_MILESTONE_SYNCHRONIZATION</div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest mb-1">LATENCY</span>
                                            <span className="text-[10px] font-black text-emerald-500">0.03ms</span>
                                        </div>
                                        <div className="w-12 h-12 border border-white/5 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-zinc-800" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {result.events.map((ev, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`p-10 border border-white/5 relative group transition-all duration-700 ${ev.status === 'current' ? 'bg-white text-black' : 'hover:bg-zinc-950/60'
                                                }`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                                <div className="flex items-center gap-10">
                                                    <div className={`w-3 h-3 rounded-none ${ev.status === 'done' ? 'bg-emerald-500/20 border border-emerald-500' :
                                                            ev.status === 'current' ? 'bg-black animate-pulse' : 'bg-zinc-900 border border-white/5'
                                                        }`} />
                                                    <div>
                                                        <div className={`text-2xl font-black uppercase italic tracking-tighter ${ev.status === 'done' ? 'text-zinc-700' : 'text-current'
                                                            }`}>
                                                            {ev.event}
                                                        </div>
                                                        <div className={`text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-3 mt-2 ${ev.status === 'done' ? 'text-zinc-800' : 'text-zinc-500'
                                                            }`}>
                                                            <MapPin className="w-3 h-3" /> {ev.loc}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 tabular-nums">
                                                    {ev.date}
                                                </div>
                                            </div>

                                            {/* Tactical Background Number */}
                                            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-9xl font-black italic opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                                                0{result.events.length - i}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>
                    ) : !isLoading && (
                        <motion.section
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-64 flex flex-col items-center text-center border-t border-white/5"
                        >
                            <div className="w-24 h-24 mb-16 border border-white/5 flex items-center justify-center relative group">
                                <Package className="w-10 h-10 text-zinc-900 group-hover:text-emerald-500/20 transition-colors" />
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tighter mb-6">ORBITAL_SILENCE</h3>
                            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.6em] max-w-sm mx-auto leading-loose">
                                Initialize deployment identifiers to establish neural-telemetry synchronization.
                            </p>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
