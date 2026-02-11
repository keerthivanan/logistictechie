"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { CarrierCard } from "../CarrierCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState, useMemo } from "react";
import { logisticsClient } from "@/lib/logistics";
import { Anchor, Filter, Zap, Globe, Shield, Ship, ArrowRight, X } from "lucide-react";
import { PremiumSearchingState } from "../PremiumSearchingState";
import RouteMap from "@/components/ui/RouteMap";
import { QuoteResult } from "@/lib/logistics";
import { PropheticRateWidget } from "../PropheticRateWidget";

type SortMode = 'best' | 'fastest' | 'cheapest' | 'greenest';

export function ResultsStep() {
    const { formData } = useQuoteStore();
    const [quotes, setQuotes] = useState<QuoteResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortMode, setSortMode] = useState<SortMode>('best');

    useEffect(() => {
        const fetch = async () => {
            try {
                // Tactical artificial delay for search feel
                await new Promise(resolve => setTimeout(resolve, 2000));
                const data = await logisticsClient.getRates({
                    origin: formData.origin,
                    destination: formData.destination,
                    container: formData.containerSize
                });
                setQuotes(data);
            } catch (e) {
                console.error(e);
                setQuotes([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [formData]);

    // Sorting Logic
    const sortedQuotes = useMemo(() => {
        const sorted = [...quotes];
        if (sortMode === 'cheapest') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortMode === 'fastest') {
            sorted.sort((a, b) => a.days - b.days);
        } else if (sortMode === 'best') {
            sorted.sort((a, b) => (a.price * a.days) - (b.price * b.days));
        }
        return sorted;
    }, [quotes, sortMode]);

    const metrics = useMemo(() => {
        if (quotes.length === 0) return null;
        const sortedByPrice = [...quotes].sort((a, b) => a.price - b.price);
        const sortedByDays = [...quotes].sort((a, b) => a.days - b.days);
        const sortedByBest = [...quotes].sort((a, b) => (a.price * a.days) - (b.price * b.days));
        return {
            cheapest: sortedByPrice[0],
            fastest: sortedByDays[0],
            best: sortedByBest[0],
            greenest: sortedByDays[0]
        };
    }, [quotes]);

    const bestPrice = metrics?.cheapest?.price || 0;

    if (loading) return <PremiumSearchingState />;

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Tactical Telemetry Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 border border-white/5 divide-x divide-white/5 bg-zinc-950/40">
                <div className="p-10 flex flex-col group">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-4 group-hover:text-emerald-500 transition-colors">ORIGIN_NODE</span>
                    <span className="text-xl font-black text-white italic tracking-tighter uppercase truncate">
                        {formData.origin.split(',')[0]}
                    </span>
                </div>
                <div className="p-10 flex flex-col group">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-4 group-hover:text-emerald-500 transition-colors">TARGET_DESTINATION</span>
                    <span className="text-xl font-black text-white italic tracking-tighter uppercase truncate">
                        {formData.destination.split(',')[0]}
                    </span>
                </div>
                <div className="p-10 flex flex-col group">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-4 group-hover:text-emerald-500 transition-colors">SPEC_UNIT</span>
                    <span className="text-xl font-black text-white italic tracking-tighter uppercase">
                        {formData.containerSize}' HC_PROTOCOL
                    </span>
                </div>
                <div className="p-10 flex items-center justify-center">
                    <Button variant="outline" className="h-16 w-full rounded-none border-white/5 bg-zinc-900 text-zinc-600 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
                        RECONFIG_CORE
                    </Button>
                </div>
            </div>

            {/* AI Analysis Interface */}
            {bestPrice > 0 && (
                <div className="border border-emerald-500/10 bg-emerald-500/[0.02] p-[1px]">
                    <PropheticRateWidget
                        origin={formData.origin}
                        destination={formData.destination}
                        currentPrice={bestPrice}
                    />
                </div>
            )}

            {/* Visualization Grid */}
            <div className="grid lg:grid-cols-12 gap-16">
                {/* Side Control Deck */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white flex items-center gap-4">
                            <Filter className="w-3 h-3 text-emerald-500" /> FILTERS
                        </h3>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">BUDGET_THRESHOLD</label>
                            <Slider defaultValue={[100]} max={100} step={1} className="w-full" />
                            <div className="flex justify-between text-[9px] font-black text-zinc-800 uppercase tracking-widest">
                                <span className="text-emerald-500">${bestPrice}</span>
                                <span>${Math.round(bestPrice * 2)}</span>
                            </div>
                        </div>

                        <div className="space-y-6 pt-10 border-t border-white/5">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">MODAL_PROTOCOL</label>
                            <div className="space-y-4">
                                <div className="flex items-center gap-6 group cursor-pointer">
                                    <Checkbox id="ocean" checked className="rounded-none border-white/5 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                                    <Label htmlFor="ocean" className="text-[10px] font-black uppercase tracking-[0.2em] text-white cursor-pointer group-hover:text-emerald-500 transition-colors">OCEAN_FCL</Label>
                                </div>
                                <div className="flex items-center gap-6 group cursor-pointer opacity-30">
                                    <Checkbox id="air" disabled className="rounded-none border-white/5" />
                                    <Label htmlFor="air" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-800 cursor-pointer">BETA_AIR_UNIT</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Support Badge */}
                    <div className="mt-20 p-8 border border-white/5 bg-zinc-950/40 group hover:border-white/20 transition-all">
                        <span className="text-[9px] font-black text-zinc-800 block mb-4 tracking-[0.4em]">LIVE_INTELLIGENCE</span>
                        <p className="text-[10px] font-black uppercase text-zinc-600 leading-relaxed mb-6 group-hover:text-zinc-400 transition-colors">
                            Need custom routing logic? Our strategic ops group is active.
                        </p>
                        <Button className="w-full h-12 bg-white text-black font-black text-[9px] uppercase tracking-[0.4em] rounded-none hover:bg-emerald-500 transition-colors">
                            OPEN_COMMS
                        </Button>
                    </div>
                </div>

                {/* Primary Intelligence Feed */}
                <div className="lg:col-span-9 space-y-12">
                    {/* Sorting Matrix */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/5">
                        {([
                            { id: 'best', label: 'OPTIMAL', sub: metrics ? `${metrics.best.days} DAYS • $${metrics.best.price.toLocaleString()}` : '--' },
                            { id: 'fastest', label: 'VELOCITY', sub: metrics ? `${metrics.fastest.days} DAYS • $${metrics.fastest.price.toLocaleString()}` : '--' },
                            { id: 'cheapest', label: 'EFFICIENCY', sub: metrics ? `${metrics.cheapest.days} DAYS • $${metrics.cheapest.price.toLocaleString()}` : '--' },
                            { id: 'greenest', label: 'ECO_CORE', sub: metrics ? `${metrics.greenest.days} DAYS • $${metrics.greenest.price.toLocaleString()}` : '--' }
                        ] as const).map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setSortMode(mode.id)}
                                className={`p-10 flex flex-col items-center justify-center transition-all duration-700 relative overflow-hidden group ${sortMode === mode.id ? 'bg-white' : 'hover:bg-zinc-950/40'
                                    }`}
                            >
                                <span className={`text-2xl font-black italic uppercase tracking-tighter mb-2 transition-all duration-700 ${sortMode === mode.id ? 'text-black' : 'text-zinc-600 group-hover:text-white'
                                    }`}>
                                    {mode.label}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-700 ${sortMode === mode.id ? 'text-zinc-500' : 'text-zinc-800'
                                    }`}>
                                    {mode.sub}
                                </span>
                                {sortMode === mode.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pb-8">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                            {sortedQuotes.length} <span className="text-zinc-800 not-italic ml-4">IDENTIFIED_RESULTS_SYNCED</span>
                        </h2>
                    </div>

                    {quotes.length > 0 ? (
                        <div className="grid gap-8">
                            {sortedQuotes.map((q, i) => (
                                <CarrierCard
                                    key={i}
                                    quote={q}
                                    origin={formData.origin}
                                    destination={formData.destination}
                                    onBook={() => {
                                        useQuoteStore.getState().selectQuote(q);
                                        useQuoteStore.getState().nextStep();
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-48 text-center border-t border-white/5 bg-zinc-950/10">
                            <Ship className="w-16 h-16 text-zinc-900 mx-auto mb-10 opacity-20" />
                            <h3 className="text-3xl font-black text-zinc-800 uppercase italic tracking-tighter mb-6">NO_INSTANT_SYNC</h3>
                            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.6em] max-w-sm mx-auto leading-loose mb-12">
                                Real-time telemetry unavailable for this trajectory. Manual protocol suggested.
                            </p>
                            <Button className="h-20 px-16 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-none hover:bg-emerald-500 transition-colors">
                                REQUEST_CUSTOM_INITIATIVE
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
