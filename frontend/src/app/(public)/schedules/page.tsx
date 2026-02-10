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
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <span className="text-sm font-medium text-emerald-500 mb-4 block">Sailing Schedules</span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Vessel Schedules
                </h1>
                <div className="flex items-center justify-center gap-4 text-zinc-400">
                    <span className="text-lg font-medium text-white">{origin}</span>
                    <ArrowRight className="h-5 w-5" />
                    <span className="text-lg font-medium text-white">{dest}</span>
                </div>
            </motion.div>

            {/* Schedules List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-pulse text-zinc-500">
                            Loading schedules...
                        </div>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                        <Ship className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <div className="text-zinc-400">No schedules found for this route</div>
                    </div>
                ) : (
                    schedules.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all flex flex-col lg:flex-row items-center justify-between gap-6">
                                {/* Vessel Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-14 w-14 rounded-lg bg-zinc-800 flex items-center justify-center">
                                        <Ship className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">{s.carrier}</div>
                                        <div className="text-xl font-semibold text-white">{s.vessel}</div>
                                        <div className="text-sm text-zinc-500">{s.service} • Voyage {s.voyage}</div>
                                    </div>
                                </div>

                                {/* Schedule Details */}
                                <div className="flex items-center gap-8 flex-[2] justify-center">
                                    <div className="text-center">
                                        <div className="text-sm text-zinc-500 mb-1">Departure</div>
                                        <div className="flex items-center gap-2 text-lg font-semibold text-white">
                                            <Calendar className="h-4 w-4 text-zinc-400" />
                                            {s.departure}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                                            <Clock className="h-4 w-4" />
                                            {s.transitTime} days
                                        </div>
                                        <div className="w-24 h-0.5 bg-zinc-800 relative">
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-500" />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-zinc-600" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm text-zinc-500 mb-1">Arrival</div>
                                        <div className="flex items-center gap-2 text-lg font-semibold text-white">
                                            <Calendar className="h-4 w-4 text-zinc-400" />
                                            {s.arrival}
                                        </div>
                                    </div>
                                </div>

                                {/* Book Button */}
                                <Button className="bg-white text-black hover:bg-zinc-100 rounded-lg h-12 px-6 font-semibold transition-all">
                                    Book Space
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
