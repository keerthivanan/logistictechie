"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown, ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const plans = [
        {
            id: "01",
            name: "Nomad_Node",
            description: "BASIC_OPERATIONAL_ACCESS",
            price: "$0",
            period: "FREE",
            features: [
                "5 Automated_Quotes / Week",
                "Standard_Telemetry",
                "Public_API_Access"
            ]
        },
        {
            id: "02",
            name: "Sovereign_OS",
            description: "PREMIUM_LOGISTICS_INFRA",
            price: "$299",
            period: "/MO",
            features: [
                "Unlimited_Global_Quotes",
                "Real-time_GPS_Tracking",
                "Priority_AI_Routing",
                "Digital_Manifest_Sync"
            ]
        },
        {
            id: "03",
            name: "Titan_Ledger",
            description: "BESPOKE_GLOBAL_NETWORK",
            price: "CUSTOM",
            period: "POA",
            features: [
                "Dedicated_Strategist",
                "Custom_LLM_Training",
                "99.99%_Uptime_SLA",
                "Quantum_Security"
            ]
        },
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
                        <span className="arch-label mb-12 block">PRICING</span>
                        <h1 className="arch-heading">Tiered <br />Hierarchy</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            Direct carrier rates with <strong className="text-white">zero latent fees</strong>. Pure. Unfiltered. Velocity.
                        </p>
                    </div>
                </motion.div>

                {/* Structured Pricing Matrix */}
                <div className="grid lg:grid-cols-3 gap-0 border-y border-white/5">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className={`p-16 border-r last:border-r-0 border-white/5 group relative transition-all duration-700 hover:bg-zinc-950/20`}
                        >
                            <div className="space-y-12">
                                <div className="flex justify-between items-start">
                                    <span className="arch-number text-zinc-900 group-hover:text-white transition-all">{plan.id}</span>
                                    <span className="arch-label text-zinc-800">{plan.description}</span>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-5xl font-light text-white uppercase italic tracking-tighter transition-all group-hover:pl-4">{plan.name}</h3>
                                    <div className="flex items-baseline gap-4 mt-8">
                                        <div className="text-6xl font-light text-white tabular-nums tracking-tighter">{plan.price}</div>
                                        <div className="arch-label text-zinc-600">{plan.period}</div>
                                    </div>
                                </div>
                                <div className="arch-detail-line space-y-4 py-8">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 bg-zinc-900 group-hover:bg-white transition-colors" />
                                            <span className="text-[10px] font-bold text-zinc-600 group-hover:text-white uppercase tracking-[0.4em]">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/quote" className="block pt-8">
                                    <button className="w-full h-20 border border-white/10 text-white text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-white hover:text-black">
                                        INITIALIZE_PROTOCOL
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Sub-Interface: Enterprise */}
                <div className="mt-96 grid lg:grid-cols-[2fr,1fr] gap-32 border-t border-white/5 pt-32">
                    <div className="space-y-12">
                        <span className="arch-label mb-12 block">BESPOKE</span>
                        <h2 className="text-5xl font-light text-white leading-tight">Complex <br />Deployment</h2>
                        <p className="text-2xl text-zinc-500 leading-relaxed max-w-2xl">
                            Connect with our <strong className="text-white text-3xl italic">Strategic Operations Group</strong> for specialized global deployment and custom neural link training.
                        </p>
                    </div>
                    <div className="flex flex-col justify-end items-end pb-12">
                        <Link href="/contact">
                            <button className="h-24 px-16 bg-white text-black font-bold uppercase tracking-[1em] text-[12px] transition-all hover:bg-zinc-200 flex items-center gap-6">
                                FORGE_ALLIANCE <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">PRICING_HIERARCHY</span>
                    <h2 className="arch-heading italic mb-16">Pure. Unfiltered.</h2>
                </div>
            </div>
        </main>
    );
}
