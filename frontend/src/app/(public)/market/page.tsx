"use client";

import { ArrowRight, Globe, Zap, BarChart3, TrendingUp, Activity, MoveDown } from "lucide-react";
import { useEffect, useState } from "react";
import { logisticsClient } from "@/lib/logistics";
import { MarketForecastChart } from "@/components/domain/market/MarketForecastChart";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarketTrendWidget } from "@/components/widgets/MarketTrendWidget";
import { cn } from "@/lib/utils";

export default function MarketPage() {
    const { t } = useLanguage();
    const [marketIndices, setMarketIndices] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [indices, trend] = await Promise.all([
                    logisticsClient.getMarketIndices(),
                    logisticsClient.getMarketTrends("GLOBAL", "General Cargo")
                ]);
                setMarketIndices(indices);
                setTrendData(trend);
            } catch (error) {
                console.error("Failed to synchronize market telemetry.", error);
            }
        };
        fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">MARKET_INTELLIGENCE_STREAM</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                            {t('marketPage.title')} <br />
                            <span className="text-white/20 select-none">Telemetry.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            Global trade corridors mapped in real-time. Direct Maersk/MSC data synchronization enabled.
                        </p>
                    </div>
                </div>

                {/* Index Matrix - Monumental Dark Grid */}
                <div className="grid md:grid-cols-3 gap-16 border-t border-white/10 pt-32 mb-48">
                    {marketIndices.length > 0 ? marketIndices.map((idx, i) => (
                        <div key={idx.id} className="bg-zinc-950/40 rounded-[64px] border border-white/10 p-16 hover:border-white/20 transition-all duration-700 group relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-10 transition-all">
                                <Activity className="w-48 h-48 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em] block mb-12 italic">CORE_INDEX_0{i + 1}</span>
                            <div className="space-y-12 relative z-10">
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{idx.name}</h3>
                                <div className="text-8xl font-black text-white tracking-tighter tabular-nums leading-none underline decoration-white/10 underline-offset-[16px]">
                                    {idx.value}
                                </div>
                                <div className="flex items-center gap-8 pt-12 border-t border-white/10">
                                    <div className="flex items-center gap-4 bg-emerald-500 text-black px-6 py-3 rounded-full shadow-2xl">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="text-[12px] font-black uppercase tracking-widest">{idx.change}</span>
                                    </div>
                                    <div className="h-px flex-1 bg-white/10" />
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.8em] italic",
                                        idx.status === 'URGENT' ? 'text-red-500' : 'text-white/20'
                                    )}>{idx.status}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-zinc-950/40 rounded-[64px] h-[300px] border border-white/10 flex items-center justify-center">
                                <span className="text-[10px] font-black text-white/10 uppercase tracking-[1em] animate-pulse italic">SYNCING_NODE_0{i}...</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Primary Visualization - Sovereign Hub */}
                <div className="mb-48 border-t border-white/10 pt-32 group">
                    <div className="flex items-center justify-between mb-24">
                        <div>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em] mb-4 block">GLOBAL_TREND_ANALYSIS</span>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">Live. Predictive. Sovereign.</h2>
                        </div>
                        <div className="hidden md:flex gap-8">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 text-white/40" />
                            </div>
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center">
                                <Globe className="w-8 h-8 text-white/40" />
                            </div>
                        </div>
                    </div>
                    <MarketTrendWidget initialCountry="GLOBAL" className="bg-zinc-950/40 border-2 border-white/10 shadow-2xl rounded-[64px] p-8 md:p-16 backdrop-blur-3xl" />
                </div>

                {/* Native Market Trend Analyzer - Monumental Chart Integration */}
                {trendData && (
                    <div className="mb-48 border-t border-white/10 pt-32 relative">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.01] blur-[150px] rounded-full" />
                        <MarketForecastChart
                            data={trendData.data}
                            title={`${trendData.commodity} | ${trendData.country}`}
                            summary={trendData.summary}
                            className="relative z-10"
                        />
                    </div>
                )}

                {/* Sub-footer Section - Monumental Static */}
                <div className="mt-64 text-center border-t border-white/10 pt-48 pb-48 relative group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block relative z-10">{t('marketPage.sensorsActive')}</span>
                    <h2 className="text-7xl md:text-[200px] font-black text-white/5 uppercase tracking-tighter leading-none italic select-none group-hover:text-white transition-all duration-1000">Global Pulse.</h2>
                    <div className="flex justify-center gap-12 mt-32 relative z-10">
                        <MoveDown className="w-16 h-16 text-white/20 hover:text-white transition-colors cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Tactical Feed Overlay - Minimalist High Contrast */}
            <div className="border-t border-white/10 py-24 bg-black">
                <div className="container max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">
                    <div className="flex items-center gap-8">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                        {t('marketPage.liveFeed')} : NODE_OMEGA_SYNCED
                    </div>
                    <div className="h-[2px] w-48 bg-white/10 hidden md:block" />
                    <span>{t('marketPage.structuralIntegrity')} : 100%_OPERATIONAL</span>
                </div>
            </div>
        </main>
    );
}
