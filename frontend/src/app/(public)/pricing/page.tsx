"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const plans = [
        {
            name: "Nomad_Node",
            description: "BASIC_OPERATIONAL_ACCESS",
            price: "$0",
            period: "",
            icon: Zap,
            features: [
                "5 Automated_Quotes / Week",
                "Standard_Telemetry",
                "Public_API_Access",
                "Community_Intel"
            ],
            cta: "INITIATE_PROTOCOL",
            highlight: false,
        },
        {
            name: "Sovereign_OS",
            description: "PREMIUM_LOGISTICS_INFRA",
            price: "$299",
            period: "/MO",
            icon: Shield,
            features: [
                "Unlimited_Global_Quotes",
                "Real-time_GPS_Tracking",
                "Priority_AI_Routing",
                "Direct_Carrier_APIs",
                "Digital_Manifest_Sync",
                "Private_VPC_Access"
            ],
            cta: "ASCEND_NOW",
            highlight: true,
        },
        {
            name: "Titan_Ledger",
            description: "BESPOKE_GLOBAL_NETWORK",
            price: "CUSTOM",
            period: "",
            icon: Crown,
            features: [
                "Dedicated_Strategist",
                "Custom_LLM_Training",
                "99.99%_Uptime_SLA",
                "Global_Ledger_Sync",
                "Quantum_Security",
                "Priority_Bandwidth"
            ],
            cta: "FORGE_ALLIANCE",
            highlight: false,
        },
    ];

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
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">PRICING_HIERARCHY</span>
                        </div>
                        <h1 className="titan-text mb-8">
                            Operational. <br />
                            <span className="text-zinc-900 group">Transparency.</span>
                        </h1>
                        <p className="max-w-2xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] leading-relaxed">
                            Direct carrier rates with zero latent fees. <br />
                            <span className="text-zinc-800">Pure. Unfiltered. Velocity.</span>
                        </p>
                    </motion.div>
                </div>

                {/* Pricing Architecture */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-white/5">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={`p-12 border-l border-b border-white/5 relative group transition-colors flex flex-col ${plan.highlight ? 'bg-zinc-950/40' : 'hover:bg-zinc-950/20'
                                }`}
                        >
                            <div className="mb-16">
                                <div className="flex justify-between items-start mb-12">
                                    <div className={`w-16 h-16 flex items-center justify-center transition-all duration-700 group-hover:rotate-12 ${plan.highlight ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600 group-hover:bg-white group-hover:text-black'
                                        }`}>
                                        <plan.icon className="w-8 h-8" />
                                    </div>
                                    {plan.highlight && (
                                        <div className="text-[10px] font-black bg-emerald-500 text-black px-4 py-1 uppercase tracking-widest">
                                            RECOMMENDED
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 group-hover:text-emerald-500 transition-colors">
                                    {plan.name}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 group-hover:text-zinc-500 transition-colors">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-16">
                                <span className="text-7xl font-black italic tracking-tighter">
                                    {plan.price}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-800 ml-4">
                                    {plan.period}
                                </span>
                            </div>

                            <div className="flex-1 mb-16">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 mb-8 border-l border-emerald-500 pl-4">
                                    Capabilities:
                                </div>
                                <ul className="space-y-4">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-4 group/item">
                                            <div className="w-1.5 h-1.5 bg-emerald-500/20 group-hover/item:bg-emerald-500 transition-colors" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover/item:text-white transition-colors">
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link href="/quote">
                                <Button className={`w-full h-16 rounded-none font-black text-[10px] uppercase tracking-[0.4em] transition-all duration-700 ${plan.highlight
                                        ? 'bg-emerald-500 text-black hover:bg-white'
                                        : 'bg-white text-black hover:bg-emerald-500'
                                    }`}>
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Sub-Interface CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 p-16 md:p-24 bg-zinc-950/40 border border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 italic font-black text-9xl text-white select-none pointer-events-none uppercase">
                        Enterprise
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl text-center md:text-left">
                            <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-8">
                                Bespoke. <span className="text-zinc-900 group-hover:text-white transition-colors duration-1000">Intelligence.</span>
                            </h3>
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] leading-loose">
                                Connect with our Strategic Operations Group for specialized global deployment and custom neural link training.
                            </p>
                        </div>
                        <Link href="/company">
                            <Button className="h-20 px-16 rounded-none bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] hover:bg-emerald-500 hover:scale-105 transition-all flex items-center gap-4">
                                INITIATE_CONTACT <ArrowUpRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
