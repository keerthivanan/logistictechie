"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { logisticsClient } from "@/lib/logistics";
import { Ship, ArrowRight, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function SchedulesContent() {
    const searchParams = useSearchParams();
    const origin = searchParams.get("origin") || "Shanghai";
    const dest = searchParams.get("dest") || "Rotterdam";
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await logisticsClient.getSchedules(origin, dest, "");
            setSchedules(data);
            setLoading(false);
        };
        fetch();
    }, [origin, dest]);

    return (
        <div className="container max-w-7xl mx-auto px-6">
            {/* Header - Apple Style */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-24"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500 mb-6 block">Maritime Timeline</span>
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9] mb-10">
                    Carrier. <br />
                    <span className="text-zinc-800">Schedules.</span>
                </h1>
                <div className="flex items-center gap-6 text-zinc-500 border-l border-white/10 pl-10">
                    <span className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">{origin}</span>
                    <ArrowRight className="h-6 w-6 stroke-[3]" />
                    <span className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">{dest}</span>
                </div>
            </motion.div>

            {/* Schedules List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-24 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800">
                        Synchronizing Vessel Data...
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-32 border border-white/5 bg-zinc-950/50">
                        <Ship className="h-16 w-16 text-zinc-900 mx-auto mb-8" />
                        <div className="text-zinc-800 font-black uppercase tracking-[0.4em]">Zero Assets Detected on this Corridor</div>
                    </div>
                ) : (
                    schedules.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="bg-zinc-950 border border-white/5 p-10 hover:border-white/20 transition-all flex flex-col lg:flex-row items-center justify-between gap-12 group">
                                {/* Vessel Info */}
                                <div className="flex items-center gap-10 flex-1">
                                    <div className="h-20 w-20 bg-white text-black flex items-center justify-center transition-transform duration-500 group-hover:-rotate-12">
                                        <Ship className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">{s.carrier}</div>
                                        <div className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{s.vessel}</div>
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.service} • VOYAGE_{s.voyage}</div>
                                    </div>
                                </div>

                                {/* Schedule Details */}
                                <div className="flex items-center gap-16 flex-[2] justify-center border-x border-white/5 px-16 py-4">
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-4">Departure</div>
                                        <div className="flex items-center justify-center gap-3 text-xl font-black text-white uppercase italic">
                                            <Calendar className="h-4 w-4 text-emerald-500" />
                                            {s.departure}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="text-[10px] font-black text-white uppercase tracking-widest mb-4">
                                            {s.transitTime} DAYS
                                        </div>
                                        <div className="w-32 h-px bg-zinc-900 relative">
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 bg-emerald-500" />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 bg-zinc-800" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-4">Arrival</div>
                                        <div className="flex items-center justify-center gap-3 text-xl font-black text-white uppercase italic">
                                            <Calendar className="h-4 w-4 text-emerald-500" />
                                            {s.arrival}
                                        </div>
                                    </div>
                                </div>

                                {/* Book Button */}
                                <Button className="bg-white text-black hover:bg-emerald-500 h-16 px-12 rounded-none font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.05)]">
                                    RESERVE SPACE
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function SchedulesPage() {
    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                    <span className="text-zinc-500">Loading schedules...</span>
                </div>
            }>
                <SchedulesContent />
            </Suspense>
        </main>
    );
}
