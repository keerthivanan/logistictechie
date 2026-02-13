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
        <div className="container max-w-[1400px] mx-auto px-8 py-24">

            {/* Architectural Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid lg:grid-cols-2 gap-16 mb-32"
            >
                <div>
                    <span className="arch-label">{t('schedulesPage.version')}</span>
                    <h1 className="arch-heading">{t('schedulesPage.title')}</h1>
                </div>
                <div className="flex flex-col justify-end">
                    <div className="grid grid-cols-2 gap-4 p-6 border border-white/5 bg-zinc-950/20 backdrop-blur-xl">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{t('schedulesPage.origin')}</label>
                            <input
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 text-white font-black text-xs p-1.5 outline-none focus:border-white transition-colors uppercase tracking-widest"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{t('schedulesPage.destination')}</label>
                            <input
                                value={dest}
                                onChange={(e) => setDest(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 text-white font-black text-xs p-1.5 outline-none focus:border-white transition-colors uppercase tracking-widest"
                            />
                        </div>
                        <Button
                            onClick={performSearch}
                            className="col-span-2 h-10 bg-white text-black hover:bg-zinc-200 rounded-none font-black text-[8px] uppercase tracking-[0.3em] transition-all"
                        >
                            {t('schedulesPage.sync')} <RotateCw className={cn("ml-3 h-2.5 w-2.5", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Structured Schedules List */}
            <div className="border-t border-white/5 pt-16 space-y-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-1 h-8 bg-white animate-pulse" />
                        <span className="arch-label mt-4">{t('schedulesPage.syncData')}</span>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="py-24 text-center border border-white/5 bg-zinc-950/10">
                        <Zap className="w-8 h-8 text-zinc-900 mx-auto mb-4 animate-pulse" />
                        <span className="arch-label text-zinc-800">{t('schedulesPage.zeroAssets')}</span>
                    </div>
                ) : (
                    schedules.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="arch-detail-line group grid lg:grid-cols-[1fr,2fr,1fr] gap-16 items-center"
                        >
                            <div className="flex items-center gap-6">
                                <span className="arch-number text-zinc-900 group-hover:text-white transition-all">0{i + 1}</span>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.3em]">{s.carrier}</div>
                                        {s.is_estimate && <span className="text-[7px] bg-white/5 border border-white/10 px-1.5 py-0.5 text-zinc-500 font-bold uppercase tracking-widest">{t('schedulesPage.sovereignEst')}</span>}
                                    </div>
                                    <h3 className="text-3xl font-light text-white uppercase italic tracking-tighter transition-all group-hover:pl-3">{s.vessel}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest leading-none">{s.service} • VOY_{s.voyage}</p>
                                        <span className="h-[8px] w-[1px] bg-zinc-800" />
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">IMO_{s.imo || "9842102"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 border-x border-white/5 px-8">
                                <div className="flex flex-col justify-center">
                                    <span className="text-[8px] font-bold uppercase tracking-widest mb-1 text-zinc-600">{t('schedulesPage.departure')}</span>
                                    <div className="text-xl font-light text-white italic">{new Date(s.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2">
                                    <div className="text-[8px] font-black text-white uppercase tracking-[0.4em] mb-2">{s.transit_time} DAYS</div>
                                    <div className="w-full h-[1px] bg-zinc-900 relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-emerald-500" />
                                        <motion.div
                                            initial={{ left: "0%" }}
                                            animate={{ left: "100%" }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute top-1/2 -translate-y-1/2 h-3 w-[1px] bg-white/40"
                                        />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-zinc-800" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center text-right">
                                    <span className="text-[8px] font-bold uppercase tracking-widest mb-1 text-zinc-600">{t('schedulesPage.arrival')}</span>
                                    <div className="text-xl font-light text-white italic">{new Date(s.arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="h-16 px-8 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white hover:text-black">
                                    {t('schedulesPage.reserve')}
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Sub-footer Section */}
            <div className="mt-64 text-center border-t border-white/5 pt-32 pb-16">
                <span className="arch-label">{t('schedulesPage.sensors')}</span>
                <h2 className="arch-heading italic mb-12">{t('schedulesPage.maritimeFlow')}</h2>
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
