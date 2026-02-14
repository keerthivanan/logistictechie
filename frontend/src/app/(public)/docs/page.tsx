"use client";

import { motion } from "framer-motion";
import { Cpu, Shield, Database, Zap, Globe, Ship } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function DocsPage() {
    const { t } = useLanguage();

    const modules = [
        {
            id: "01",
            title: "API_LAYER",
            desc: "Direct integration with Maersk, MSC, and CMA CGM legacy infrastructure via our proprietary Quantum-Tunneling middleware.",
            version: "v4.1.0_STABLE",
            icon: Cpu
        },
        {
            id: "02",
            title: "SOVEREIGN_RMS",
            desc: "Real-time Revenue Management System calculating Suez premiums, fuel indexes, and geopolitical tension surcharges.",
            version: "PROPHETIC_CORE",
            icon: Shield
        },
        {
            id: "03",
            title: "ORACLE_DB",
            desc: "Qdrant vector intelligence layer storing millions of global shipping nodes and historical pricing anomalies for AI forecasting.",
            version: "GLOBAL_BRAIN",
            icon: Database
        },
        {
            id: "04",
            title: "SECURITY_FIBER",
            desc: "NextAuth.js authentication with Google OAuth integration and JWT-based session integrity for secure logistics operations.",
            version: "ZERO_TRUST",
            icon: Zap
        }
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
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">LOGISTICS_OS_INTELLIGENCE</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            System <br /><span className="text-white/20 italic">Documentation.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl md:text-3xl font-bold text-white/40 leading-tight max-w-xl md:text-right md:ml-auto uppercase tracking-tighter opacity-80">
                            The Phoenix Logistics OS is built on the &quot;True Ocean&quot; protocol, orchestrating <strong className="text-white">real-time intelligence</strong> across the global supply chain.
                        </p>
                    </div>
                </motion.div>

                {/* Module Grid - High Density Tactical Patterns */}
                <div className="grid md:grid-cols-2 gap-0 border-y border-white/5 bg-zinc-950/20 backdrop-blur-3xl">
                    {modules.map((mod, idx) => (
                        <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="p-10 md:p-20 border-r last:border-r-0 border-b last:border-b-0 border-white/5 group hover:bg-white/[0.02] transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.01] group-hover:opacity-10 transition-all">
                                <mod.icon className="w-48 h-48 text-white" />
                            </div>
                            <div className="space-y-12 relative z-10">
                                <div className="flex justify-between items-start">
                                    <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors tracking-tighter tabular-nums leading-none">{mod.id}</span>
                                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500">
                                        <mod.icon className="h-6 w-6 transition-transform group-hover:scale-110" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter group-hover:pl-6 group-hover:italic transition-all duration-700 leading-none">{mod.title}</h3>
                                    <p className="text-white/30 text-[13px] font-bold uppercase tracking-widest leading-loose max-w-sm group-hover:text-white/60 transition-colors">{mod.desc}</p>
                                </div>
                                <div className="pt-8 border-t border-white/5">
                                    <span className="text-[10px] font-black text-white/20 tracking-[0.6em] uppercase group-hover:text-white/40 transition-colors">{mod.version}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Architecture Overview - Tactical Node */}
                <div className="mt-64 grid lg:grid-cols-[1fr,3fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <div className="space-y-16">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">INFRASTRUCTURE_TOPOLOGY</span>
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
                                The system is designed for sub-millisecond precision in rate calculation, leveraging
                                distributed computing across NEOM, Singapore, and Rotterdam data centers with
                                automated failover and 99.99% SLA compliance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">DOCUMENT_CONTROL_OS</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">Phoenix OS.</h2>
                </div>
            </div>
        </main>
    );
}
