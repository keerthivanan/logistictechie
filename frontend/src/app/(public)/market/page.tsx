"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, Zap, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { logisticsClient } from "@/lib/logistics";
import { SovereignTrendChart } from "@/components/domain/market/SovereignTrendChart";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarketTrendWidget } from "@/components/widgets/MarketTrendWidget";

export default function MarketPage() {
    const { t } = useLanguage();
    const [marketIndices, setMarketIndices] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [indices, trend] = await Promise.all([
                logisticsClient.getMarketIndices(),
                logisticsClient.getMarketTrends("GLOBAL", "General Cargo")
            ]);
            setMarketIndices(indices);
            setTrendData(trend);
        };
        fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-48"
                >
                    <span className="arch-label mb-12 block">{t('marketPage.intelligence')}</span>
                    <h1 className="arch-heading">{t('marketPage.title')}</h1>
                </motion.div>

                {/* Index Matrix - Numbered Pattern */}
                <div className="grid md:grid-cols-3 gap-16 border-t border-white/5 pt-32 mb-64">
                    {marketIndices.length > 0 ? marketIndices.map((idx) => (
                        <div key={idx.id} className="arch-detail-line group cursor-default">
                            <span className="arch-number block mb-8 transition-all group-hover:text-white">{idx.id}</span>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-light text-white uppercase tracking-tight">{idx.name}</h3>
                                <div className="text-5xl font-black italic text-zinc-900 group-hover:text-emerald-500 transition-colors duration-1000 tracking-tighter tabular-nums">
                                    {idx.value}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="arch-label text-emerald-500">{idx.change}</span>
                                    <div className="h-[1px] flex-1 bg-white/5" />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${idx.status === 'URGENT' ? 'text-red-500' : 'text-zinc-800'}`}>{idx.status}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        [1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-white/5 h-48 border border-white/5" />
                        ))
                    )}
                </div>

                {/* Primary Visualization - Sovereign Hub */}
                <div className="mb-64">
                    <MarketTrendWidget initialCountry="GLOBAL" className="border-white/10" />
                </div>

                {/* Native Sovereign Trend Analyzer */}
                {trendData && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-64 border-t border-white/5 pt-32"
                    >
                        <SovereignTrendChart
                            data={trendData.data}
                            title={trendData.commodity + " _ " + trendData.country}
                            summary={trendData.summary}
                        />
                    </motion.div>
                )}

                {/* Sub-footer Context */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">{t('marketPage.sensorsActive')}</span>
                    <h2 className="arch-heading italic mb-16">{t('marketPage.globalPulse')}</h2>
                    <div className="flex justify-center gap-12 mt-24">
                        <ArrowRight className="w-12 h-12 text-zinc-900 animate-pulse" />
                        <ArrowRight className="w-12 h-12 text-zinc-900 animate-pulse [animation-delay:0.2s]" />
                        <ArrowRight className="w-12 h-12 text-zinc-900 animate-pulse [animation-delay:0.4s]" />
                    </div>
                </div>
            </div>

            {/* Minimal Sub-footer */}
            <div className="border-t border-white/5 py-32 bg-black">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-900 uppercase">
                    <span>{t('marketPage.liveFeed')}</span>
                    <span>{t('marketPage.structuralIntegrity')}</span>
                </div>
            </div>
        </main>
    );
}
