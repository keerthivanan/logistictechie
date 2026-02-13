"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, MapPin, Clock, Loader2, Ship, Zap, Globe, Shield, ArrowRight } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { logisticsClient } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrackingEvent {
    event: string;
    status: 'done' | 'current' | 'pending';
    location: string;
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
        await new Promise(resolve => setTimeout(resolve, 800));
        const data = await logisticsClient.trackContainer(id || "MSCU1234567");
        setResult(data);
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-24">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 mb-48"
                >
                    <div>
                        <span className="arch-label">{t('trackingPage.telemetry')}</span>
                        <h1 className="arch-heading">{t('trackingPage.title')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            {t('trackingPage.orbital')}
                        </p>
                    </div>
                </motion.div>

                {/* Structural Tracking Interface */}
                <div className="grid lg:grid-cols-[1fr,2.5fr] gap-16 border-t border-white/5 pt-16 mb-32">

                    {/* Left: Input Node */}
                    <div className="space-y-24">
                        <div className="arch-detail-line">
                            <span className="arch-label block mb-6">{t('trackingPage.nodeCommand')}</span>
                            <div className="relative group">
                                <input
                                    placeholder={t('trackingPage.placeholder')}
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="bg-transparent border-b border-white/10 w-full py-6 text-3xl font-light text-white italic outline-none focus:border-white transition-all tracking-tighter"
                                />
                                <button
                                    onClick={handleTrack}
                                    className="absolute right-0 bottom-6 h-10 w-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {[
                                { id: "01", label: "Real-time Sync", desc: "Carrier-direct API linkage." },
                                { id: "02", label: "Neural Pred.", desc: "Advanced delay calculations." },
                                { id: "03", label: "Secure Flux", desc: "Military-grade encryption." }
                            ].map((item) => (
                                <div key={item.id} className="arch-detail-line opacity-30">
                                    <span className="arch-number block mb-1.5">{item.id}</span>
                                    <p className="text-[9px] font-bold tracking-[0.2em] text-white uppercase">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Data Visualization */}
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-24"
                            >
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="arch-detail-line border-white">
                                        <span className="arch-label mb-3 block">{t('trackingPage.status')}</span>
                                        <div className="text-4xl font-light italic text-emerald-500 tracking-widest">{result.status}</div>
                                    </div>
                                    <div className="arch-detail-line">
                                        <span className="arch-label mb-3 block">{t('trackingPage.estArrival')}</span>
                                        <div className="text-4xl font-light text-white tracking-tighter">{result.eta}</div>
                                    </div>
                                </div>

                                <div className="h-[450px] border border-white/5 bg-zinc-950/10 p-6">
                                    <RouteMap
                                        origin={result.events[0].location}
                                        destination={result.events[result.events.length - 1].location}
                                        className="w-full h-full grayscale-0 invert-0"
                                    />
                                </div>

                                <div className="space-y-12 border-t border-white/5 pt-24">
                                    <span className="arch-label block mb-16">{t('trackingPage.operationLog')}</span>
                                    <div className="grid gap-6">
                                        {result.events.map((ev, i) => (
                                            <div key={i} className="arch-detail-line group flex items-center justify-between">
                                                <div className="flex items-center gap-10">
                                                    <span className="arch-number text-zinc-900 group-hover:text-white transition-all">0{result.events.length - i}</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-2xl font-light text-white uppercase italic tracking-tighter">{ev.event}</h4>
                                                        <p className="text-[9px] font-bold tracking-[0.4em] text-zinc-600 uppercase">{ev.location}</p>
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold text-zinc-800 tracking-tighter tabular-nums">{ev.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[600px] flex flex-col items-center justify-center border border-white/5 bg-zinc-950/10"
                            >
                                <Zap className="w-10 h-10 text-zinc-900 mb-6 animate-pulse" />
                                <span className="arch-label text-zinc-800">{t('trackingPage.waiting')}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-64 text-center border-t border-white/5 pt-32 pb-16">
                    <span className="arch-label">{t('trackingPage.globalTracker')}</span>
                    <h2 className="arch-heading italic mb-12">{t('trackingPage.alwaysOn')}</h2>
                </div>
            </div>
        </main >
    );
}
