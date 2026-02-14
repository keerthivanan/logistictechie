"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

export function DashboardPreview() {
    const { t } = useLanguage();

    return (
        <section className="py-48 bg-black overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-32">
                    {/* Left Content - Tactical Typography */}
                    <div className="flex-1 space-y-12 group">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">COMMAND_CENTRAL</span>
                        <h2 className="text-4xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter group-hover:italic transition-all duration-700">
                            The_Oracle. <br /><span className="text-white/20">Control_Nexus.</span>
                        </h2>
                        <p className="text-[12px] font-bold text-white/40 leading-relaxed uppercase tracking-widest max-w-lg">
                            {t('home.dashboard_preview.description')}
                        </p>
                        <button className="flex items-center gap-6 text-white font-black text-[10px] uppercase tracking-[0.6em] group/btn">
                            {t('home.dashboard_preview.cta')}
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>

                    {/* Right Visual (High-Density Dark Mockup) */}
                    <div className="flex-1 relative">
                        <div className="relative z-10 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/5 backdrop-blur-3xl">
                            <div className="bg-zinc-950 p-10 aspect-[4/3] flex flex-col gap-6">
                                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                                    <div className="flex gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                    </div>
                                    <div className="w-48 h-2 bg-white/10 rounded-full" />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl" />
                                            <div className="w-16 h-1.5 bg-white/5 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-1 bg-white/[0.02] rounded-[40px] border border-white/5 p-8">
                                    <div className="w-full h-full bg-black/40 rounded-[32px] border border-white/5 flex items-center justify-center relative overflow-hidden">
                                        <span className="text-[10px] font-black text-white/10 uppercase tracking-[1em] z-10">GLOBAL_TELEMETRY_PULSE</span>
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Command Module */}
                        <div className="absolute -bottom-16 -left-16 z-20 w-96 rounded-[40px] overflow-hidden shadow-2xl border border-white/10 bg-zinc-950/90 p-10 backdrop-blur-2xl hidden md:block">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em]">NODE_STATISTICS</span>
                                <div className="flex gap-3">
                                    <div className="w-10 h-1.5 bg-white/20 rounded-full" />
                                    <div className="w-6 h-1.5 bg-white/5 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <span className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">40.8K</span>
                                <div className="w-full h-32 bg-white/5 rounded-[32px] relative overflow-hidden border border-white/5">
                                    <div className="absolute bottom-0 left-0 w-full h-2/3 bg-white/5 blur-3xl" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-px h-16 bg-white/10 mx-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Tactics */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[120px]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
