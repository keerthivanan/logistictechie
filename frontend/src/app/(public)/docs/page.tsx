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
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">LOGISTICS_OS // 2026</span>
                        <h1 className="arch-heading">System Documentation</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            The Phoenix Logistics OS is built on the &quot;True Ocean&quot; protocol, orchestrating <strong className="text-white">real-time intelligence</strong> across the global supply chain.
                        </p>
                    </div>
                </motion.div>

                {/* Module Grid */}
                <div className="grid md:grid-cols-2 gap-0 border-y border-white/5">
                    {modules.map((mod, idx) => (
                        <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="p-16 border-r last:border-r-0 border-b last:border-b-0 border-white/5 group hover:bg-zinc-950/20 transition-all duration-700"
                        >
                            <div className="space-y-12">
                                <div className="flex justify-between items-start">
                                    <span className="arch-number text-zinc-900 group-hover:text-white transition-all">{mod.id}</span>
                                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-all">
                                        <mod.icon className="h-5 w-5 text-zinc-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-light text-white uppercase italic tracking-tighter group-hover:pl-4 transition-all duration-700">{mod.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">{mod.desc}</p>
                                <div className="pt-8 border-t border-white/5">
                                    <span className="text-[10px] font-bold text-zinc-700 tracking-[0.4em]">{mod.version}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Architecture Overview */}
                <div className="mt-96 grid lg:grid-cols-[1fr,2fr] gap-32 border-t border-white/5 pt-32">
                    <div className="space-y-12">
                        <span className="arch-label mb-12 block">INFRASTRUCTURE</span>
                        <h2 className="text-5xl font-light text-white leading-tight">Global Network Topology</h2>
                        <div className="arch-detail-line h-48 opacity-20 hidden lg:block" />
                    </div>
                    <div className="p-16 bg-zinc-950/20 border border-white/5">
                        <div className="grid md:grid-cols-2 gap-12 text-sm text-zinc-500 font-light leading-relaxed">
                            <p>
                                The Phoenix Global Network utilizes 14 distinct nodes across major shipping corridors.
                                Our &quot;True Ocean&quot; protocol ensures that data synchronization occurs across all RMS layers
                                within a maximum threshold of 500ms from carrier event triggers.
                            </p>
                            <p>
                                The system is designed for sub-millisecond precision in rate calculation, leveraging
                                distributed computing across NEOM, Singapore, and Rotterdam data centers with
                                automated failover and 99.99% SLA compliance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">DOCUMENTATION_CORE</span>
                    <h2 className="arch-heading italic mb-16">Phoenix OS.</h2>
                </div>
            </div>
        </main>
    );
}
