"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Package, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { logisticsClient } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrackingEvent {
    event: string;
    status: 'done' | 'current' | 'pending';
    loc: string;
    date: string;
}

interface TrackingResult {
    status: string;
    eta: string;
    events: TrackingEvent[];
}

export default function TrackingPage() {
    const { t } = useLanguage();
    const [id, setId] = useState("");
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTrack = async () => {
        setIsLoading(true);
        const data = await logisticsClient.trackContainer(id || "MSCU1234567");
        setResult(data);
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 bg-mesh-dark">
            {/* Hero */}
            <section className="relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-[0.3em] mb-6 holographic-glow">
                            Quantum Tracking Link
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic">
                            {t('tracking.title')}
                        </h1>
                        <p className="text-xl text-gray-500 font-light tracking-tight">{t('tracking.subtitle')}</p>
                    </motion.div>

                    {/* Search Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Card className="p-8 bg-white/[0.02] border-white/10 ultra-card">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
                                    <Input
                                        placeholder={t('tracking.placeholder')}
                                        className="h-16 pl-16 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 text-xl font-bold uppercase tracking-tighter rounded-2xl"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                                    />
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleTrack}
                                    disabled={isLoading}
                                    className="bg-white text-black hover:bg-gray-200 h-16 px-12 font-black uppercase tracking-tighter rounded-2xl shadow-2xl transition-all"
                                >
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : t('tracking.track')}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Results */}
            {result && (
                <section className="container max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-10"
                    >
                        {/* Map and Status Row */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Map */}
                            <div className="lg:col-span-2 h-[450px] rounded-[32px] overflow-hidden border border-white/10 ultra-card bg-white/[0.02]">
                                <RouteMap
                                    origin={result.events[0].loc}
                                    destination={result.events[result.events.length - 1].loc}
                                    className="w-full h-full grayscale opacity-80"
                                />
                            </div>

                            {/* Status Card */}
                            <Card className="p-10 bg-white/[0.02] border border-white/10 ultra-card flex flex-col justify-center rounded-[32px]">
                                <div className="space-y-10">
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">{t('tracking.status')}</div>
                                        <div className="text-4xl font-black text-white italic uppercase tracking-tighter holographic-glow inline-block">{result.status}</div>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">{t('tracking.eta')}</div>
                                        <div className="text-4xl font-black text-white italic uppercase tracking-tighter">{result.eta}</div>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        <span>Last Synchronization: 250ms ago</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Timeline */}
                        <Card className="p-12 bg-white/[0.02] border border-white/10 ultra-card rounded-[40px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-3xl font-black text-white mb-12 uppercase tracking-tighter italic">Transmission History</h3>
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-[7px] top-4 bottom-4 w-px bg-white/10" />

                                <div className="space-y-10">
                                    {result.events.map((ev: TrackingEvent, i: number) => (
                                        <div key={i} className="flex gap-8 relative group">
                                            {/* Status dot */}
                                            <div className={`
                                                w-4 h-4 rounded-full flex-shrink-0 mt-2 z-10 transition-all duration-500
                                                ${ev.status === 'done'
                                                    ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                                    : ev.status === 'current'
                                                        ? 'bg-white shadow-[0_0_25px_rgba(255,255,255,0.6)] scale-125'
                                                        : 'bg-white/10'
                                                }
                                            `} />

                                            <div className="flex-1">
                                                <div className="font-black text-white flex items-center gap-3 text-lg uppercase tracking-tighter">
                                                    {ev.event}
                                                    {ev.status === 'done' && (
                                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                                                    <MapPin className="h-4 w-4" />
                                                    {ev.loc}
                                                </div>
                                                <div className="text-[10px] text-gray-600 mt-2 font-black uppercase tracking-[0.2em]">{ev.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </section>
            )}

            {/* Empty State */}
            {!result && (
                <section className="container max-w-4xl mx-auto px-6 mt-12">
                    <Card className="p-20 bg-white/[0.01] border border-dashed border-white/10 text-center rounded-[40px] ultra-card">
                        <Package className="h-20 w-20 text-gray-800 mx-auto mb-8 animate-pulse" />
                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">No Active Signal</h3>
                        <p className="text-gray-500 max-w-md mx-auto font-medium uppercase tracking-widest text-xs leading-relaxed">
                            Initialize a tracking request via container serial range. Real-time telemetry will stream upon secure handshake.
                        </p>
                    </Card>
                </section>
            )}
        </main>
    );
}
