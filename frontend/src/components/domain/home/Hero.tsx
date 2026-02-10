"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogisticsSearchBar } from "./LogisticsSearchBar";

export function Hero() {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-32 pb-24 px-6 bg-black">

            {/* Clean Background Lines */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>

            <div className="container max-w-6xl mx-auto flex flex-col items-center text-center space-y-12 z-10">

                {/* Professional Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center space-x-3 bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-full"
                >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        {t('landing.hero.badge')}
                    </span>
                </motion.div>

                {/* Clean Professional Typography - NOS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-6"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-tight">
                        {t('landing.hero.title_global')} <span className="text-zinc-500">{t('landing.hero.title_velocity')}</span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-zinc-400 text-lg md:text-xl font-normal leading-relaxed">
                        {t('landing.hero.description')}
                    </p>
                </motion.div>

                {/* Primary Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-5xl mt-8"
                >
                    <div className="bg-zinc-900/80 border border-zinc-800 p-2 rounded-lg">
                        <LogisticsSearchBar />
                    </div>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-8 pt-8 text-zinc-500"
                >
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">{t('landing.hero.trust.security')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">{t('landing.hero.trust.realtime')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">{t('landing.hero.trust.support')}</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}

