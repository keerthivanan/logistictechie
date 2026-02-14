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
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-64 group"
                >
                    <div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">SYSTEM_BIOS_HEALTH_STREAM</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            Operational <br /><span className="text-white/20 italic">Vitality.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="flex items-center gap-8 px-10 py-6 border border-emerald-500/20 bg-emerald-500/5 rounded-full w-fit md:ml-auto group-hover:border-emerald-500/50 transition-all duration-700 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <span className="text-[12px] font-black tracking-[0.6em] text-emerald-500 uppercase">ALL_SYSTEMS_OPTIMAL</span>
                        </div>
                    </div>
                </motion.div>

                {/* Metrics Matrix - High Density Tactical Cards */}
                <div className="grid md:grid-cols-3 gap-0 border-y border-white/5 bg-zinc-950/20 backdrop-blur-3xl">
                    {systems.map((system, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className="p-10 md:p-16 border-r last:border-r-0 border-b last:border-b-0 border-white/5 group hover:bg-white/[0.02] transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-12 relative z-10">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] group-hover:text-white/40 transition-colors">{system.name}</span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 group-hover:scale-125 transition-transform" />
                            </div>
                            <div className="space-y-6 mb-12 relative z-10">
                                <div className="text-6xl md:text-8xl font-black text-white tracking-tighter tabular-nums group-hover:italic transition-all leading-none">{system.uptime}</div>
                                <span className="text-[10px] font-black tracking-[0.6em] text-white/10 uppercase group-hover:text-white/20 transition-colors">UPTIME_24H_PROTOCOL</span>
                            </div>
                            <div className="pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
                                <span className="text-[10px] font-black tracking-[0.8em] text-white/10 uppercase group-hover:text-white/20 transition-colors">LATENCY</span>
                                <span className={`text-xl font-black tracking-tighter tabular-nums italic ${parseInt(system.latency) < 50 ? 'text-emerald-400' : 'text-white/30'}`}>{system.latency}</span>
                            </div>
                            <div className="absolute -bottom-10 -right-10 opacity-[0.01] group-hover:opacity-5 transition-all duration-1000">
                                <Activity className="w-48 h-48 text-white rotate-12" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Network Topology - Tactical Node */}
                <div className="mt-64 grid lg:grid-cols-[1fr,3fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <div className="space-y-16">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">INFRASTRUCTURE_METRICS</span>
                        <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.8] uppercase tracking-tighter group-hover:italic transition-all duration-700">Global Network</h2>
                    </div>
                    <div className="bg-zinc-950/40 rounded-[64px] border border-white/5 p-12 md:p-20 backdrop-blur-3xl shadow-2xl transition-all duration-700 group-hover:border-white/10">
                        <div className="grid md:grid-cols-2 gap-16 text-[14px] text-white/40 font-bold leading-loose uppercase tracking-widest">
                            <p className="hover:text-white/60 transition-colors">
                                The Phoenix Global Network utilizes 14 distinct nodes across major shipping corridors.
                                Our &quot;True Ocean&quot; protocol ensures that data synchronization occurs across all RMS layers
                                within a maximum threshold of 500ms from carrier event triggers.
                            </p>
                            <p className="hover:text-white/60 transition-colors">
                                Maintenance window scheduled for Feb 28, 2026. No downtime anticipated for core booking functionality.
                                Sovereign predictive analytics may experience a transient 12% latency increase during database migration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">TELEMETRY_ENGINE</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">Always Operational.</h2>
                </div>
            </div>
        </main>
    );
}
