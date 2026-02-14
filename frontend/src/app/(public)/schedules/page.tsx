"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { logisticsClient } from "@/lib/logistics";
import { Ship, ArrowRight, Clock, Calendar, ArrowLeft, Zap, RotateCw, ChevronRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

function SchedulesContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const [origin, setOrigin] = useState(searchParams.get("origin") || "Shanghai");
    const [dest, setDest] = useState(searchParams.get("dest") || "Rotterdam");
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const performSearch = async () => {
        setLoading(true);
        try {
            const data = await logisticsClient.getSchedules(origin, dest, "");
            setSchedules(data);
        } catch (error) {
            console.error("Failed to sync maritime schedules.", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        performSearch();
    }, []);

    return (
        <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48 flex flex-col min-h-screen">

            {/* Monumental Tactical Header - Static */}
            <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                <div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">TEMPORAL_LOGISTICS_FEED</span>
                    <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                        {t('schedulesPage.title')} <br />
                        <span className="text-white/20 select-none">Timeline.</span>
                    </h1>
                </div>
                <div className="flex flex-col justify-end">
                    <div className="grid grid-cols-2 gap-8 p-12 bg-zinc-950/40 border-2 border-white/10 rounded-[64px] shadow-2xl backdrop-blur-3xl group-hover:border-white/20 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-4xl font-black italic select-none">SYNC_NODE</div>
                        <div className="space-y-6 relative z-10">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em] ml-4">{t('schedulesPage.origin')}</label>
                            <input
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-white/10 text-white font-black text-2xl px-4 py-4 outline-none focus:border-white transition-all uppercase tracking-tighter italic placeholder:text-white/5"
                            />
                        </div>
                        <div className="space-y-6 relative z-10">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em] ml-4">{t('schedulesPage.destination')}</label>
                            <input
                                value={dest}
                                onChange={(e) => setDest(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-white/10 text-white font-black text-2xl px-4 py-4 outline-none focus:border-white transition-all uppercase tracking-tighter italic placeholder:text-white/5"
                            />
                        </div>
                        <button
                            onClick={performSearch}
                            className="col-span-2 h-28 bg-white text-black hover:bg-zinc-200 rounded-full font-black text-[14px] uppercase tracking-[1em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-8 group/btn"
                        >
                            {t('schedulesPage.sync')} <RotateCw className={cn("h-8 w-8 group-hover/btn:rotate-180 transition-transform duration-700", loading && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Structured Schedules List - The Maritime Hub */}
            <div className="border-t-2 border-white/10 pt-32 space-y-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-64">
                        <div className="w-48 h-48 bg-white/5 rounded-[64px] flex items-center justify-center mb-16 relative border-2 border-white/5 animate-pulse">
                            <RotateCw className="w-20 h-20 text-white/20 animate-spin" />
                            <div className="absolute inset-0 border-4 border-white/5 border-t-white rounded-[64px]" />
                        </div>
                        <span className="text-[14px] font-black text-white/20 uppercase tracking-[1.5em] italic">{t('schedulesPage.syncData')}</span>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="py-64 text-center border-2 border-white/5 bg-zinc-950/40 rounded-[80px] shadow-2xl backdrop-blur-3xl group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.02] text-8xl font-black italic select-none">ZERO_ASSETS_DETECTED</div>
                        <Zap className="w-24 h-24 text-white/5 mx-auto mb-16 group-hover:text-white/10 transition-all" />
                        <span className="text-[14px] font-black text-white/20 uppercase tracking-[1.5em] italic">{t('schedulesPage.zeroAssets')}</span>
                        <p className="mt-8 text-[10px] font-black text-white/10 uppercase tracking-[0.4em] italic">No active vessels reported for this trade corridor. Check back in 24 hours.</p>
                    </div>
                ) : (
                    schedules.map((s, i) => (
                        <div
                            key={i}
                            className="bg-zinc-950/40 rounded-[64px] border-2 border-white/5 p-16 grid lg:grid-cols-[1.5fr,2fr,1fr] gap-16 items-center hover:bg-white/[0.03] hover:border-white/20 transition-all duration-700 group backdrop-blur-3xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex items-center gap-16">
                                <span className="text-8xl md:text-[140px] font-black text-white/[0.03] group-hover:text-white/10 transition-all duration-1000 tracking-tighter leading-none italic select-none">0{i + 1}</span>
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-6">
                                        <div className="px-8 py-3 bg-white/5 text-[10px] font-black text-white uppercase tracking-[0.6em] rounded-full border border-white/10 shadow-2xl">{s.carrier}</div>
                                        {s.is_estimate && <span className="text-[9px] border border-white/10 px-6 py-2 text-white/20 font-black uppercase tracking-[0.6em] rounded-full italic">{t('schedulesPage.sovereignEst')}</span>}
                                    </div>
                                    <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter group-hover:pl-6 group-hover:italic transition-all duration-700 leading-none underline decoration-white/10 underline-offset-[16px]">{s.vessel}</h3>
                                    <div className="flex items-center gap-8 pt-4">
                                        <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.6em] italic">{s.service} • VOY_{s.voyage}</p>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_emerald]" />
                                        <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.6em]">IMO_{s.imo || "9842102"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-16 px-20 border-x-2 border-white/5 h-full self-stretch">
                                <div className="flex flex-col justify-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.8em] mb-6 text-white/20 italic">{t('schedulesPage.departure')}</span>
                                    <div className="text-4xl font-black text-white uppercase tracking-tighter tabular-nums leading-none italic underline decoration-white/10 underline-offset-8">
                                        {new Date(s.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em] mb-8 italic">{s.transit_time} DAYS_TRANSIT</div>
                                    <div className="w-full h-[4px] bg-white/5 relative rounded-full shadow-inner overflow-hidden">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 blur-xl rounded-full animate-pulse" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                                    </div>
                                    <Activity className="w-6 h-6 text-white/10 mt-6" />
                                </div>
                                <div className="flex flex-col justify-center text-right">
                                    <span className="text-[10px] font-black uppercase tracking-[0.8em] mb-6 text-white/20 italic">{t('schedulesPage.arrival')}</span>
                                    <div className="text-4xl font-black text-white uppercase tracking-tighter tabular-nums leading-none italic underline decoration-white/10 underline-offset-8">
                                        {new Date(s.arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pr-8">
                                <button className="h-28 px-20 bg-white text-black font-black uppercase tracking-[1em] text-[14px] rounded-full transition-all hover:bg-zinc-200 active:scale-95 shadow-2xl flex items-center gap-6 group/btn">
                                    {t('schedulesPage.reserve')} <ChevronRight className="w-8 h-8 group-hover/btn:translate-x-3 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Monumental Sub-footer - Static */}
            <div className="mt-64 text-center border-t border-white/10 pt-48 pb-32 group relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block relative z-10">{t('schedulesPage.sensors')}</span>
                <h2 className="text-7xl md:text-[200px] font-black text-white/5 uppercase tracking-tighter leading-none group-hover:text-white/10 transition-all duration-1000 italic select-none">{t('schedulesPage.maritimeFlow')}</h2>
            </div>
        </div>
    );
}

export default function SchedulesPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-black">
                    <div className="w-[1px] h-48 bg-white animate-pulse" />
                </div>
            }>
                <SchedulesContent />
            </Suspense>
        </main>
    );
}
