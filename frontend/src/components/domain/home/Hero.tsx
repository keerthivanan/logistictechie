"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { useLanguage } from "@/contexts/LanguageContext";

export function Hero() {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-[90vh] w-full flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-black">

            {/* Subtle Silver Glows (Pure Classic) */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.05] blur-[150px] rounded-full pointer-events-none" />

            <div className="container max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 z-10">

                {/* 1. Badge - Premium Tracking */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center space-x-3 bg-white/[0.03] border border-white/10 rounded-full px-5 py-2 backdrop-blur-3xl"
                >
                    <span className="flex h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_15px_white] animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase">
                        {t('hero.badge') || "Master-Protocol Logistics"}
                    </span>
                </motion.div>

                {/* 2. Alpha Typography */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="space-y-8"
                >
                    <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black tracking-[-0.04em] text-white leading-[0.9] uppercase">
                        Built for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Efficiency.</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-lg md:text-2xl text-gray-500 font-light leading-relaxed uppercase tracking-tight">
                        Zero Friction Network. <span className="text-white font-black">100% Precision Data.</span><br className="hidden md:block" />
                        Engineered for the industry&apos;s standard-bearers.
                    </p>
                </motion.div>

                {/* 3. High Contrast Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-6 items-center pt-4"
                >
                    <Link href="/quote">
                        <Button size="lg" className="h-16 px-12 text-xl font-black bg-white text-black hover:bg-gray-200 transition-all rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] uppercase tracking-tighter">
                            {t('hero.start')} <ArrowRight className="ml-2 h-6 w-6 rtl:-scale-x-100" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-black border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-2xl uppercase tracking-tighter">
                        {t('hero.demo')}
                    </Button>
                </motion.div>

                {/* 4. Quote Widget integrated as a "Tool" -- Refactored for Classic */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="w-full max-w-4xl mt-20 bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[40px] p-2 sm:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <QuoteWidgetMini />
                </motion.div>

            </div>
        </section>
    );
}

function QuoteWidgetMini() {
    const [tab, setTab] = useState<'sea' | 'air'>('sea');
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Instant Terminal</h3>
                <div className="flex rounded-xl bg-white/[0.05] p-1.5 border border-white/5">
                    <button
                        onClick={() => setTab('sea')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === 'sea' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                    >
                        {t('quote.tabs.sea')}
                    </button>
                    <button
                        onClick={() => setTab('air')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === 'air' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                    >
                        {t('quote.tabs.air')}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">{t('quote.origin')}</label>
                    <div className="relative group/input">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-hover/input:text-white transition-colors" />
                        <Input placeholder="Enter Global Port" className="pl-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-700 h-14 rounded-xl focus:border-white transition-all text-lg font-bold" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">{t('quote.destination')}</label>
                    <div className="relative group/input">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-hover/input:text-white transition-colors" />
                        <Input placeholder="Enter Final Terminal" className="pl-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-700 h-14 rounded-xl focus:border-white transition-all text-lg font-bold" />
                    </div>
                </div>

                <Link href="/quote" className="md:col-span-2 lg:col-span-1">
                    <Button className="w-full bg-white hover:bg-gray-200 text-black h-14 text-lg font-black uppercase tracking-tighter rounded-xl shadow-2xl transition-all active:scale-95">
                        {t('quote.getRates')}
                    </Button>
                </Link>
            </div>
        </div>
    )
}

import Link from "next/link";
