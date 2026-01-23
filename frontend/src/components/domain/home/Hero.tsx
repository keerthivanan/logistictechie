"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";

import Hyperspeed from "@/components/ui/Hyperspeed";
import GradientText from "@/components/ui/GradientText";

// ... imports

// ... imports

import { useLanguage } from "@/contexts/LanguageContext";

export function Hero() {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-center pt-20">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <Hyperspeed
                    effectOptions={{
                        onSpeedUp: () => { },
                        onSlowDown: () => { },
                        distortion: 'turbulentDistortion',
                        length: 400,
                        roadWidth: 10,
                        islandWidth: 2,
                        lanesPerRoad: 3,
                        fov: 90,
                        fovSpeedUp: 150,
                        speedUp: 2,
                        carLightsFade: 0.4,
                        totalSideLightSticks: 20,
                        lightPairsPerRoadWay: 40,
                        shoulderLinesWidthPercentage: 0.05,
                        brokenLinesWidthPercentage: 0.1,
                        brokenLinesLengthPercentage: 0.5,
                        lightStickWidth: [0.12, 0.5],
                        lightStickHeight: [1.3, 1.7],
                        movingAwaySpeed: [60, 80],
                        movingCloserSpeed: [-120, -160],
                        carLightsLength: [400 * 0.03, 400 * 0.2],
                        carLightsRadius: [0.05, 0.14],
                        carWidthPercentage: [0.3, 0.5],
                        carShiftX: [-0.8, 0.8],
                        carFloorSeparation: [0, 5],
                        colors: {
                            roadColor: 0x080808,
                            islandColor: 0x0a0a0a,
                            background: 0x000000,
                            shoulderLines: 0x131318,
                            brokenLines: 0x131318,
                            leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
                            rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
                            sticks: 0x03b3c3
                        }
                    }}
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/60 z-10" />
                {/* Bottom gradient fade for seamless blend */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

                    {/* Left: Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
                                <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
                                {t('hero.badge')}
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl xl:text-8xl">
                                <GradientText className="font-extrabold">{t('hero.title_start')}</GradientText> <br />
                                <span className="text-white">{t('hero.title_end')}</span>
                            </h1>
                            <p className="max-w-[600px] text-gray-400 md:text-xl leading-relaxed">
                                {t('hero.subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 min-[400px]:flex-row">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                {t('hero.start')} <ArrowRight className="ml-2 h-5 w-5 rtl:-scale-x-100" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 h-14 text-lg">
                                {t('hero.demo')}
                            </Button>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                <span>{t('hero.verified')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                <span>{t('hero.instant')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-blue-500" />
                                <span>{t('hero.global')}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: The Quote Widget (Glassmorphism) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mx-auto w-full max-w-[500px]"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 opacity-30 blur-2xl" />

                        <Card className="relative glass-panel p-8 border-white/10 bg-black/60 backdrop-blur-xl">
                            <QuoteWidgetMini />
                        </Card>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function QuoteWidgetMini() {
    const [tab, setTab] = useState<'sea' | 'air'>('sea');
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{t('quote.title')}</h3>
                <div className="flex rounded-lg bg-white/5 p-1">
                    <button
                        onClick={() => setTab('sea')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'sea' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t('quote.tabs.sea')}
                    </button>
                    <button
                        onClick={() => setTab('air')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'air' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t('quote.tabs.air')}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('quote.origin')}</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-500 rtl:right-3 rtl:left-auto" />
                        <Input placeholder={t('quote.origin')} className="pl-10 rtl:pr-10 rtl:pl-3 bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12" />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('quote.destination')}</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-500 rtl:right-3 rtl:left-auto" />
                        <Input placeholder={t('quote.destination')} className="pl-10 rtl:pr-10 rtl:pl-3 bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-12" />
                    </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white h-12 text-lg font-bold shadow-lg shadow-blue-900/20">
                    {t('quote.getRates')}
                </Button>
            </div>
        </div>
    )
}
