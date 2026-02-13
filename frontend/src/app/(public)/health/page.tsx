"use client";

import { motion } from "framer-motion";
import { Activity, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HealthPage() {
    const { t } = useLanguage();

    const systems = [
        { name: "CORE_RMS_ENGINE", status: "Operational", uptime: "99.99%", latency: "24ms" },
        { name: "MAERSK_GATEWAY", status: "Operational", uptime: "99.92%", latency: "142ms" },
        { name: "MSC_HYPERBOLIC_LINK", status: "Operational", uptime: "99.95%", latency: "156ms" },
        { name: "CMA_CGM_PROTOCOL", status: "Operational", uptime: "99.91%", latency: "168ms" },
        { name: "ORACLE_DATABASE", status: "Operational", uptime: "100%", latency: "2ms" },
        { name: "AI_PROPHETIC_LAYER", status: "Operational", uptime: "99.98%", latency: "18ms" }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">SYSTEM_STATUS // LIVE</span>
                        <h1 className="arch-heading">Operational Health</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="flex items-center gap-6 px-8 py-4 border border-emerald-500/20 bg-zinc-950/50 w-fit ml-auto">
                            <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold tracking-[0.4em] text-emerald-500 uppercase">ALL_SYSTEMS_OPTIMAL</span>
                        </div>
                    </div>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid md:grid-cols-3 gap-0 border-y border-white/5">
                    {systems.map((system, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className="p-16 border-r last:border-r-0 border-b last:border-b-0 border-white/5 group hover:bg-zinc-950/20 transition-all duration-700"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <span className="arch-label text-zinc-600">{system.name}</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="space-y-4 mb-12">
                                <div className="text-5xl font-light text-white tracking-tighter">{system.uptime}</div>
                                <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-700 uppercase">UPTIME_24H</span>
                            </div>
                            <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-700">LATENCY</span>
                                <span className={`text-[10px] font-bold tracking-[0.4em] ${parseInt(system.latency) < 50 ? 'text-emerald-500' : 'text-zinc-400'}`}>{system.latency}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Network Topology */}
                <div className="mt-96 grid lg:grid-cols-[1fr,2fr] gap-32 border-t border-white/5 pt-32">
                    <div className="space-y-12">
                        <span className="arch-label mb-12 block">INFRASTRUCTURE</span>
                        <h2 className="text-5xl font-light text-white leading-tight">Global Network Topology</h2>
                        <div className="arch-detail-line h-48 opacity-20 hidden lg:block" />
                    </div>
                    <div className="p-16 bg-zinc-950/20 border border-white/5">
                        <h3 className="text-xl font-bold tracking-widest uppercase mb-12 flex items-center gap-4 text-white">
                            <Activity className="h-5 w-5" />
                            GLOBAL_NETWORK_TOPOLOGY
                        </h3>
                        <div className="grid md:grid-cols-2 gap-12 text-sm text-zinc-500 font-light leading-relaxed">
                            <p>
                                The Phoenix Global Network utilizes 14 distinct nodes across major shipping corridors.
                                Our &quot;True Ocean&quot; protocol ensures that data synchronization occurs across all RMS layers
                                within a maximum threshold of 500ms from carrier event triggers.
                            </p>
                            <p>
                                Maintenance window scheduled for Feb 28, 2026. No downtime anticipated for core booking functionality.
                                Sovereign predictive analytics may experience a transient 12% latency increase during database migration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">TELEMETRY_ACTIVE</span>
                    <h2 className="arch-heading italic mb-16">Always Operational.</h2>
                </div>
            </div>
        </main>
    );
}
