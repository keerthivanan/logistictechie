"use client";

import { useState } from "react";
import { Search, Package, MapPin, Clock, Loader2, Ship, Zap, Globe, Shield, ArrowRight, Activity, Terminal, ChevronRight } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { logisticsClient } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48 flex-1">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">SYNCHRONIZATION_TELEMETRY</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                            {t('trackingPage.title')} <br />
                            <span className="text-white/20 select-none">Pulse.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('trackingPage.orbital')}
                        </p>
                    </div>
                </div>

                {/* Structural Tracking Interface - Static Grid */}
                <div className="grid lg:grid-cols-[1fr,3fr] gap-16 md:gap-32 border-t-2 border-white/10 pt-32 mb-32 relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

                    {/* Left: Input Node - Tactical Registry */}
                    <div className="space-y-16">
                        <div className="bg-zinc-950/40 rounded-[64px] border-2 border-white/10 p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden group hover:border-white/30 transition-all duration-700">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-all rotate-12">
                                <Zap className="w-32 h-32 text-white" />
                            </div>
                            <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em] block mb-12 italic relative z-10">{t('trackingPage.nodeCommand')}</span>
                            <div className="relative space-y-12 z-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[1em]">ID_ENTIFIER</label>
                                    <input
                                        placeholder={t('trackingPage.placeholder')}
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        className="bg-transparent border-b-2 border-white/10 w-full py-6 text-5xl font-black text-white outline-none focus:border-white transition-all tracking-tighter uppercase tabular-nums italic"
                                    />
                                </div>
                                <button
                                    onClick={handleTrack}
                                    className="w-full h-32 flex items-center justify-center bg-white text-black rounded-full hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 group/btn"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-10 h-10 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-[16px] font-black uppercase tracking-[1em] ml-8">INITIALIZE_SYNC</span>
                                            <ChevronRight className="w-10 h-10 group-hover/btn:translate-x-3 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-12 px-10">
                            {[
                                { id: "01", label: "REAL-TIME_SYNC", desc: "CARRIER_DIRECT_L3" },
                                { id: "02", label: "NEURAL_PRED", desc: "CALCULATED_ETA_V8" },
                                { id: "03", label: "SECURE_FLUX", desc: "ENCRYPTED_SHIELD" }
                            ].map((item) => (
                                <div key={item.id} className="flex gap-8 items-center group">
                                    <span className="text-4xl font-black text-white/5 group-hover:text-white/20 transition-all tabular-nums italic leading-none">{item.id}</span>
                                    <div className="h-[2px] flex-1 bg-white/5" />
                                    <div className="text-right">
                                        <p className="text-[10px] font-black tracking-[0.6em] text-white/40 group-hover:text-white transition-colors uppercase">{item.label}</p>
                                        <p className="text-[9px] font-black text-white/10 tracking-[0.4em] uppercase">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Data Visualization - The Command Center */}
                    <div className="min-h-[800px]">
                        {result ? (
                            <div className="space-y-24">
                                <div className="grid md:grid-cols-2 gap-16">
                                    <div className="bg-zinc-950/40 rounded-[64px] border-2 border-white/10 p-16 transition-all hover:border-white/30 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-4xl font-black italic select-none">STATUS_REPORT</div>
                                        <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.8em] mb-6 block">{t('trackingPage.status')}</span>
                                        <div className="text-8xl font-black text-emerald-500 tracking-tighter uppercase italic leading-none underline decoration-emerald-500/10 underline-offset-[20px]">{result.status}</div>
                                    </div>
                                    <div className="bg-zinc-950/40 rounded-[64px] border-2 border-white/10 p-16 transition-all hover:border-white/30 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-4xl font-black italic select-none">ETA_TARGET</div>
                                        <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.8em] mb-6 block">{t('trackingPage.estArrival')}</span>
                                        <div className="text-8xl font-black text-white tracking-tighter uppercase tabular-nums leading-none italic underline decoration-white/10 underline-offset-[20px]">{result.eta}</div>
                                    </div>
                                </div>

                                <div className="h-[700px] border-2 border-white/10 bg-zinc-950/40 rounded-[80px] shadow-2xl relative overflow-hidden group backdrop-blur-2xl">
                                    <RouteMap
                                        origin={result.events[0]?.location || ""}
                                        destination={result.events[result.events.length - 1]?.location || ""}
                                        className="w-full h-full grayscale hover:grayscale-0 transition-all duration-2000 opacity-40 group-hover:opacity-100 scale-105 group-hover:scale-100"
                                    />
                                    <div className="absolute top-16 right-16 px-12 py-4 bg-white text-black text-[12px] font-black rounded-full uppercase tracking-[1em] flex items-center gap-6 shadow-2xl transition-all group-hover:scale-110">
                                        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                                        LIVE_SYNC_ACTIVE
                                    </div>
                                    <div className="absolute bottom-16 left-16 p-10 bg-black/80 backdrop-blur-3xl border border-white/20 rounded-[40px] max-w-sm">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em] mb-4 block">ACTIVE_CORRIDOR</span>
                                        <p className="text-xl font-black text-white uppercase tracking-tighter italic">
                                            {result.events[0]?.location} <ArrowRight className="inline mx-4 w-6 h-6 text-white/40" /> {result.events[result.events.length - 1]?.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-24 pt-48 border-t-2 border-white/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-black text-white/40 uppercase tracking-[1em] block">{t('trackingPage.operationLog')}</span>
                                        <div className="h-[2px] flex-1 bg-white/10 mx-12 hidden md:block" />
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">SYNC_VERIFIED_PROTOCOL_82</span>
                                    </div>
                                    <div className="space-y-12">
                                        {result.events.map((ev, i) => (
                                            <div key={i} className="bg-zinc-950/40 rounded-[64px] border-2 border-white/5 p-16 flex flex-col md:flex-row items-center justify-between gap-12 group hover:bg-white/[0.03] hover:border-white/20 transition-all duration-700 backdrop-blur-3xl shadow-2xl">
                                                <div className="flex items-center gap-16">
                                                    <span className="text-7xl md:text-9xl font-black text-white/[0.03] group-hover:text-white/10 transition-all duration-1000 tracking-tighter leading-none italic select-none">
                                                        0{result.events.length - i}
                                                    </span>
                                                    <div className="space-y-4">
                                                        <h4 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter transition-all duration-500 italic decoration-white/10 underline underline-offset-8">{ev.event}</h4>
                                                        <p className="text-[12px] font-black tracking-[0.8em] text-white/20 uppercase group-hover:text-white/40 transition-colors italic">{ev.location}</p>
                                                    </div>
                                                </div>
                                                <div className="text-4xl font-black text-white/20 group-hover:text-white transition-all tabular-nums tracking-tighter italic underline decoration-white/5 underline-offset-8">{ev.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[800px] flex flex-col items-center justify-center bg-zinc-950/40 border-2 border-white/10 rounded-[80px] shadow-2xl backdrop-blur-3xl group relative overflow-hidden">
                                <div className="absolute top-12 right-12 opacity-[0.02] text-8xl font-black italic select-none">WAITING_FOR_ID</div>
                                <div className="w-48 h-48 bg-white/5 rounded-[64px] flex items-center justify-center mb-16 group-hover:bg-white/10 transition-all duration-1000 relative border-2 border-white/5">
                                    <Activity className="w-20 h-20 text-white/10 group-hover:text-white transition-colors duration-700" />
                                    <div className="absolute inset-0 border-4 border-white/5 border-t-white rounded-[64px] animate-spin [animation-duration:5s]" />
                                </div>
                                <span className="text-[14px] font-black text-white/10 uppercase tracking-[1.5em] group-hover:text-white/40 transition-all italic">{t('trackingPage.waiting')}</span>
                                <div className="mt-12 p-8 bg-white/5 rounded-[40px] border border-white/10 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] text-center italic">
                                        Enter your Container ID or Booking Reference <br /> to wake the orbital telemetry sensors.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Monumental Sub-footer - Static */}
                <div className="mt-64 text-center border-t border-white/10 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block relative z-10">{t('trackingPage.globalTracker')}</span>
                    <h2 className="text-7xl md:text-[200px] font-black text-white/5 uppercase tracking-tighter leading-none group-hover:text-white/10 transition-all duration-1000 italic select-none">{t('trackingPage.alwaysOn')}</h2>
                </div>
            </div>

            {/* Tactical Feed Overlay - Minimalist High Contrast */}
            <div className="border-t-2 border-white/10 py-24 bg-black">
                <div className="container max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">
                    <span className="flex items-center gap-8">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                        TRACKING_DEPLOYMENT : ACTIVE_ORBITAL_SYNC
                    </span>
                    <div className="h-[2px] w-48 bg-white/10 hidden md:block" />
                    <span className="text-white/40">SYSTEM_MODE : ABSOLUTE_VISIBILITY_V2</span>
                </div>
            </div>
        </main >
    );
}
