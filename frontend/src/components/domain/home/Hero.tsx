"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogisticsSearchBar } from "./LogisticsSearchBar";
import { Zap, Globe, Shield } from "lucide-react";

export function Hero() {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-48 pb-32 px-8 overflow-hidden bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto flex flex-col items-center text-center z-10">
                {/* Eyebrow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-4 mb-20"
                >
                    <div className="w-8 h-[1px] bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-[1em] text-emerald-500">
                        GLOBAL_AUTONOMY_INITIATED
                    </span>
                    <div className="w-8 h-[1px] bg-emerald-500" />
                </motion.div>

                {/* Cinematic Title */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-24"
                >
                    <h1 className="titan-text">
                        The Sovereignty <br />
                        <span className="text-zinc-900 group">Of Velocity.</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="max-w-4xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] mb-24 leading-relaxed"
                >
                    Direct Access to Global Daily Vessel Schedules and Real-time Freight Intelligence. <br />
                    <span className="text-zinc-800">No Mediators. No Latency.</span>
                </motion.p>

                {/* Tactical Search Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-6xl relative"
                >
                    <div className="p-1 bg-gradient-to-b from-white/10 to-transparent">
                        <div className="bg-black/80 backdrop-blur-3xl p-8 border border-white/5">
                            <LogisticsSearchBar />
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-12 mt-16">
                        {[
                            { icon: Globe, label: "GLOBAL_NODES: ACTIVE" },
                            { icon: Shield, label: "ENCRYPTION: LEVEL_IV" },
                            { icon: Zap, label: "LATENCY: 0.04ms" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group cursor-default">
                                <item.icon className="w-4 h-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                                <span className="text-[9px] font-black text-zinc-800 tracking-[0.2em] group-hover:text-zinc-400 transition-colors">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Ambient Elements */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </section>
    );
}

