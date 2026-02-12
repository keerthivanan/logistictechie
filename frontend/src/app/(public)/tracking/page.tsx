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
        await new Promise(resolve => setTimeout(resolve, 800));
        const data = await logisticsClient.trackContainer(id || "MSCU1234567");
        setResult(data);
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">{t('trackingPage.telemetry')}</span>
                        <h1 className="arch-heading">{t('trackingPage.title')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            {t('trackingPage.orbital')}
                        </p>
                    </div>
                </motion.div>

                {/* Structural Tracking Interface */}
                <div className="grid lg:grid-cols-[1fr,2fr] gap-32 border-t border-white/5 pt-32 mb-48">

                    {/* Left: Input Node */}
                    <div className="space-y-32">
                        <div className="arch-detail-line">
                            <span className="arch-label block mb-8">{t('trackingPage.nodeCommand')}</span>
                            <div className="relative group">
                                <input
                                    placeholder={t('trackingPage.placeholder')}
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="bg-transparent border-b border-white/10 w-full py-8 text-4xl font-light text-white italic outline-none focus:border-white transition-all tracking-tighter"
                                />
                                <button
                                    onClick={handleTrack}
                                    className="absolute right-0 bottom-8 h-12 w-12 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-16">
                            {[
                                { id: "01", label: "Real-time Sync", desc: "Carrier-direct API linkage." },
                                { id: "02", label: "Neural Pred.", desc: "Advanced delay calculations." },
                                { id: "03", label: "Secure Flux", desc: "Military-grade encryption." }
                            ].map((item) => (
                                <div key={item.id} className="arch-detail-line opacity-40">
                                    <span className="arch-number block mb-2">{item.id}</span>
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">{item.label}</p>
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
                                className="space-y-32"
                            >
                                <div className="grid md:grid-cols-2 gap-16">
                                    <div className="arch-detail-line border-white">
                                        <span className="arch-label mb-4 block">{t('trackingPage.status')}</span>
                                        <div className="text-5xl font-light italic text-white tracking-widest">{result.status}</div>
                                    </div>
                                    <div className="arch-detail-line">
                                        <span className="arch-label mb-4 block">{t('trackingPage.estArrival')}</span>
                                        <div className="text-5xl font-light text-white tracking-tighter">{result.eta}</div>
                                    </div>
                                </div>

                                <div className="h-[500px] border border-white/5 bg-zinc-950/10 p-8">
                                    <RouteMap
                                        origin={result.events[0].loc}
                                        destination={result.events[result.events.length - 1].loc}
                                        className="w-full h-full grayscale-0 invert-0"
                                    />
                                </div>

                                <div className="space-y-16 border-t border-white/5 pt-32">
                                    <span className="arch-label block mb-24">{t('trackingPage.operationLog')}</span>
                                    <div className="grid gap-8">
                                        {result.events.map((ev, i) => (
                                            <div key={i} className="arch-detail-line group flex items-center justify-between">
                                                <div className="flex items-center gap-12">
                                                    <span className="arch-number text-zinc-900 group-hover:text-white transition-all">0{result.events.length - i}</span>
                                                    <div className="space-y-1">
                                                        <h4 className="text-3xl font-light text-white uppercase italic tracking-tighter">{ev.event}</h4>
                                                        <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase">{ev.loc}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xl font-bold text-zinc-800 tracking-tighter tabular-nums">{ev.date}</div>
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
                                className="h-full flex flex-col items-center justify-center border border-white/5 bg-zinc-950/10"
                            >
                                <Zap className="w-12 h-12 text-zinc-900 mb-8 animate-pulse" />
                                <span className="arch-label text-zinc-800">{t('trackingPage.waiting')}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">{t('trackingPage.globalTracker')}</span>
                    <h2 className="arch-heading italic mb-16">{t('trackingPage.alwaysOn')}</h2>
                </div>
            </div>
        </main>
    );
}
