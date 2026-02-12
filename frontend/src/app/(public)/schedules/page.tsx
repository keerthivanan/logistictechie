"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { logisticsClient } from "@/lib/logistics";
import { Ship, ArrowRight, Clock, Calendar, ArrowLeft, Zap, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
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
        const data = await logisticsClient.getSchedules(origin, dest, "");
        setSchedules(data);
        setLoading(false);
    };

    useEffect(() => {
        performSearch();
    }, []);

    return (
        <div className="container max-w-[1400px] mx-auto px-8 py-48">

            {/* Architectural Header */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid lg:grid-cols-2 gap-32 mb-48"
            >
                <div>
                    <span className="arch-label mb-12 block">{t('schedulesPage.version')}</span>
                    <h1 className="arch-heading">{t('schedulesPage.title')}</h1>
                </div>
                <div className="flex flex-col justify-end">
                    <div className="grid grid-cols-2 gap-8 p-8 border border-white/5 bg-zinc-950/20 backdrop-blur-xl">
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{t('schedulesPage.origin')}</label>
                            <input
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 text-white font-black text-sm p-2 outline-none focus:border-emerald-500 transition-colors uppercase tracking-widest"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{t('schedulesPage.destination')}</label>
                            <input
                                value={dest}
                                onChange={(e) => setDest(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 text-white font-black text-sm p-2 outline-none focus:border-emerald-500 transition-colors uppercase tracking-widest"
                            />
                        </div>
                        <Button
                            onClick={performSearch}
                            className="col-span-2 h-12 bg-white text-black hover:bg-emerald-500 rounded-none font-black text-[9px] uppercase tracking-[0.4em] transition-all"
                        >
                            {t('schedulesPage.sync')} <RotateCw className={cn("ml-4 h-3 w-3", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Structured Schedules List */}
            <div className="border-t border-white/5 pt-32 space-y-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-48">
                        <div className="w-1 h-12 bg-white animate-pulse" />
                        <span className="arch-label mt-8">{t('schedulesPage.syncData')}</span>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="py-48 text-center border border-white/5 bg-zinc-950/10">
                        <Zap className="w-12 h-12 text-zinc-900 mx-auto mb-8 animate-pulse" />
                        <span className="arch-label text-zinc-800">{t('schedulesPage.zeroAssets')}</span>
                    </div>
                ) : (
                    schedules.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="arch-detail-line group grid lg:grid-cols-[1fr,2fr,1fr] gap-32 items-center"
                        >
                            <div className="flex items-center gap-8">
                                <span className="arch-number text-zinc-900 group-hover:text-white transition-all">0{i + 1}</span>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em]">{s.carrier}</div>
                                        {s.is_estimate && <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 text-zinc-500 font-bold uppercase tracking-widest">{t('schedulesPage.sovereignEst')}</span>}
                                    </div>
                                    <h3 className="text-4xl font-light text-white uppercase italic tracking-tighter transition-all group-hover:pl-4">{s.vessel}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-none">{s.service} • VOY_{s.voyage}</p>
                                        <span className="h-[10px] w-[1px] bg-zinc-800" />
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">IMO_{s.imo || "9842102"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-12 border-x border-white/5 px-16">
                                <div className="flex flex-col justify-center">
                                    <span className="arch-label mb-2 block text-zinc-600">{t('schedulesPage.departure')}</span>
                                    <div className="text-2xl font-light text-white italic">{new Date(s.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4">
                                    <div className="text-[9px] font-black text-white uppercase tracking-[0.6em] mb-4">{s.transit_time} DAYS</div>
                                    <div className="w-full h-[1px] bg-zinc-900 relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                        <motion.div
                                            initial={{ left: "0%" }}
                                            animate={{ left: "100%" }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute top-1/2 -translate-y-1/2 h-4 w-[1px] bg-white/40"
                                        />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 bg-zinc-800" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center text-right">
                                    <span className="arch-label mb-2 block text-zinc-600">{t('schedulesPage.arrival')}</span>
                                    <div className="text-2xl font-light text-white italic">{new Date(s.arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="h-20 px-12 border border-white/10 text-white text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-white hover:text-black">
                                    {t('schedulesPage.reserve')}
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Sub-footer Section */}
            <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                <span className="arch-label mb-12 block">{t('schedulesPage.sensors')}</span>
                <h2 className="arch-heading italic mb-16">{t('schedulesPage.maritimeFlow')}</h2>
            </div>
        </div>
    );
}

export default function SchedulesPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-1 h-12 bg-white animate-pulse" />
                </div>
            }>
                <SchedulesContent />
            </Suspense>
        </main>
    );
}
