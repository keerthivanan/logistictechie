"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { logisticsClient } from "@/lib/logistics";
import { Ship, ArrowRight, Clock, Calendar, ArrowLeft, Zap } from "lucide-react";
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
        <div className="container max-w-[1400px] mx-auto px-8 py-48">

            {/* Architectural Header */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid lg:grid-cols-2 gap-32 mb-64"
            >
                <div>
                    <span className="arch-label mb-12 block">Vessel_Timeline</span>
                    <h1 className="arch-heading">Carrier <br />Schedules</h1>
                </div>
                <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-12 text-zinc-500 border-l border-white/10 pl-10 h-32">
                        <span className="text-4xl font-light text-white uppercase italic tracking-tighter">{origin}</span>
                        <ArrowRight className="h-8 w-8 text-zinc-800" />
                        <span className="text-4xl font-light text-white uppercase italic tracking-tighter">{dest}</span>
                    </div>
                </div>
            </motion.div>

            {/* Structured Schedules List */}
            <div className="border-t border-white/5 pt-32 space-y-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-48">
                        <div className="w-1 h-12 bg-white animate-pulse" />
                        <span className="arch-label mt-8">SYNC_VESSEL_DATA</span>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="py-48 text-center border border-white/5 bg-zinc-950/10">
                        <Zap className="w-12 h-12 text-zinc-900 mx-auto mb-8 animate-pulse" />
                        <span className="arch-label text-zinc-800">ZERO_ASSETS_DETECTED_ON_CORRIDOR</span>
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
                                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-2">{s.carrier}</div>
                                    <h3 className="text-4xl font-light text-white uppercase italic tracking-tighter transition-all group-hover:pl-4">{s.vessel}</h3>
                                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">{s.service} • VOY_{s.voyage}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-12 border-x border-white/5 px-16 h-32">
                                <div className="flex flex-col justify-center">
                                    <span className="arch-label mb-2 block">DEPARTURE</span>
                                    <div className="text-2xl font-light text-white italic">{s.departure}</div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-[9px] font-black text-white uppercase tracking-[0.6em] mb-4">{s.transitTime}D</div>
                                    <div className="w-full h-[1px] bg-zinc-900 relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 bg-emerald-500" />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 bg-zinc-800" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center text-right">
                                    <span className="arch-label mb-2 block">ARRIVAL</span>
                                    <div className="text-2xl font-light text-white italic">{s.arrival}</div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="h-20 px-12 border border-white/10 text-white text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-white hover:text-black">
                                    RESERVE_SPACE
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Sub-footer Section */}
            <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                <span className="arch-label mb-12 block">GLOBAL_VESSEL_SENSORS</span>
                <h2 className="arch-heading italic mb-16">Maritime. Flow.</h2>
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
