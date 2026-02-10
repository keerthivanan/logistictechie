"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { CarrierCard } from "../CarrierCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState, useMemo } from "react";
import { logisticsClient } from "@/lib/logistics";
import { Anchor, Filter } from "lucide-react";
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

    return (
        <div className="space-y-12 bg-black">
            {/* Titan Header Summary */}
            <div className="bg-white/[0.01] border border-white/10 flex flex-wrap divide-x divide-white/5 items-stretch text-sm">
                <div className="flex-1 p-8 flex flex-col min-w-[200px]">
                    <span className="titan-label mb-2">Transit Origin</span>
                    <span className="font-bold text-white flex items-center gap-3 text-lg uppercase tracking-tight">
                        <Anchor className="w-4 h-4 text-white/30" />
                        {formData.origin.split(',')[0]}
                    </span>
                </div>
                <div className="flex-1 p-8 flex flex-col min-w-[200px]">
                    <span className="titan-label mb-2">Destination Point</span>
                    <span className="font-bold text-white flex items-center gap-3 text-lg uppercase tracking-tight">
                        <Anchor className="w-4 h-4 text-white/30" />
                        {formData.destination.split(',')[0]}
                    </span>
                </div>
                <div className="flex-1 p-8 flex flex-col min-w-[200px]">
                    <span className="titan-label mb-2">Inventory Data</span>
                    <span className="font-bold text-white text-lg uppercase tracking-tight">
                        {formData.containerSize}' HC Protocol
                    </span>
                </div>
                <div className="p-8 flex items-center">
                    <Button variant="outline" size="sm" className="h-12 rounded-none px-8 border-white/10 text-gray-500 font-bold text-xs tracking-widest uppercase hover:bg-white hover:text-black">
                        RESET CORE
                    </Button>
                </div>
            </div>

            {/* AI PROPHETIC WIDGET (NEW) */}
            {bestPrice > 0 && (
                <div className="px-0">
                    <PropheticRateWidget
                        origin={formData.origin}
                        destination={formData.destination}
                        currentPrice={bestPrice}
                    />
                </div>
            )}

            {/* WORLD CLASS MAP VISUALIZATION - Square */}
            <div className="h-[400px] w-full rounded-none overflow-hidden border border-white/10 relative group transition-all duration-1000">
                <RouteMap
                    origin={formData.origin}
                    destination={formData.destination}
                    className="w-full h-full grayscale opacity-60 hover:opacity-100 transition-all duration-1000"
                />
                <div className="absolute top-10 right-10 z-20 bg-black/95 p-6 border border-white/5 shadow-2xl">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">NODE: GLOBAL_TRANSIT_ACTIVE</span>
                </div>
            </div>

            {/* Sorting Tabs - Titan Block Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/10 divide-x divide-white/10">
                {([
                    { id: 'best', label: 'OPTIMAL', sub: metrics ? `${metrics.best.days} DAYS • $${metrics.best.price.toLocaleString()}` : '--' },
                    { id: 'fastest', label: 'VELOCITY', sub: metrics ? `${metrics.fastest.days} DAYS • $${metrics.fastest.price.toLocaleString()}` : '--' },
                    { id: 'cheapest', label: 'EFFICIENCY', sub: metrics ? `${metrics.cheapest.days} DAYS • $${metrics.cheapest.price.toLocaleString()}` : '--' },
                    { id: 'greenest', label: 'ECO_CORE', sub: metrics ? `${metrics.greenest.days} DAYS • $${metrics.greenest.price.toLocaleString()}` : '--' }
                ] as const).map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setSortMode(mode.id)}
                        className={`p-10 flex flex-col items-center justify-center transition-all ${sortMode === mode.id ? 'bg-white text-black' : 'text-gray-500 hover:bg-white/[0.02] hover:text-white'}`}
                    >
                        <span className={`font-bold uppercase tracking-tight text-2xl mb-1 ${sortMode === mode.id ? 'text-black' : 'text-white'}`}>{mode.label}</span>
                        <span className={`text-xs font-bold tracking-widest ${sortMode === mode.id ? 'text-black/60' : 'text-gray-600'}`}>
                            {mode.sub}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
                {/* Sidebar Filters */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="space-y-12 sticky top-32">
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <h3 className="titan-label flex items-center gap-3"><Filter className="w-3 h-3" /> TELEMETRY FILTERS</h3>
                            <button className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">DE-SYNC</button>
                        </div>

                        <div className="space-y-6">
                            <h4 className="titan-label">BUDGET BOUNDARY</h4>
                            <Slider defaultValue={[100]} max={100} step={1} className="w-full" />
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span className="text-white">${bestPrice}</span>
                                <span>${Math.round(bestPrice * 2)}</span>
                            </div>
                        </div>

                        <div className="space-y-6 border-t border-white/5 pt-10">
                            <h4 className="titan-label">CAPACITY STATUS</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4"><Checkbox id="guaranteed" checked className="rounded-none border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" /><Label htmlFor="guaranteed" className="text-xs font-bold uppercase tracking-widest text-white leading-none">GUARANTEED_SPACE</Label></div>
                                <div className="flex items-center gap-4"><Checkbox id="standard" className="rounded-none border-white/20" /><Label htmlFor="standard" className="text-xs font-bold uppercase tracking-widest text-gray-600 leading-none">FLEX_STANDARD</Label></div>
                            </div>
                        </div>

                        <div className="space-y-6 border-t border-white/5 pt-10">
                            <h4 className="titan-label">MODAL PROTOCOL</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4"><Checkbox id="ocean" checked className="rounded-none border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" /><Label htmlFor="ocean" className="text-xs font-bold uppercase tracking-widest text-white leading-none">OCEAN_FCL</Label></div>
                                <div className="flex items-center gap-4"><Checkbox id="air" className="rounded-none border-white/20" /><Label htmlFor="air" className="text-xs font-bold uppercase tracking-widest text-gray-600 leading-none">BETA_AIR_UNIT</Label></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Results Feed */}
                <div className="lg:col-span-9 space-y-10">
                    <div className="flex items-center justify-between pb-8 border-b border-white/5">
                        <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
                            {sortedQuotes.length} <span className="text-white/30 not-italic font-bold">Identified Results.</span>
                        </h2>
                    </div>

                    {loading ? (
                        <PremiumSearchingState />
                    ) : quotes.length > 0 ? (
                        <div className="space-y-6">
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
                        <div className="text-center py-32 border border-white/10 bg-white/[0.01]">
                            <Anchor className="w-12 h-12 text-gray-400 mx-auto mb-8" />
                            <h3 className="text-4xl font-bold text-white uppercase tracking-tight">NO INSTANT RATES</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-6 text-xs font-bold uppercase tracking-widest leading-loose px-10">
                                REAL-TIME DATA UNAVAILABLE FOR THIS ROUTE. PLEASE REQUEST A MANUAL QUOTE FROM OUR TEAM.
                            </p>
                            <Button variant="outline" className="mt-12 border-white/10 text-white hover:bg-white hover:text-black transition-all h-16 px-12 rounded-none uppercase font-bold tracking-widest text-xs">
                                REQUEST CUSTOM QUOTE
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
