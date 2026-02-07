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
import { PremiumSearchingState } from "../PremiumSearchingState"; // New Import

type SortMode = 'best' | 'fastest' | 'cheapest' | 'greenest';

import { QuoteResult } from "@/lib/logistics";
// ...
export function ResultsStep() {
    // const { t } = useLanguage();
    const { formData } = useQuoteStore();
    const [quotes, setQuotes] = useState<QuoteResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortMode, setSortMode] = useState<SortMode>('best');

    useEffect(() => {
        const fetch = async () => {
            try {
                // Use the centralized client which calls Python backend
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
            // "Best Value" = Balance of Price and Speed (Heuristic)
            sorted.sort((a, b) => (a.price * a.days) - (b.price * b.days));
        }
        // Greenest is mock for now (could be random or based on carrier)
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
        <div className="space-y-8 bg-black">
            {/* Header Summary - Classic High Contrast */}
            <div className="bg-white/[0.03] rounded-xl border border-white/10 p-6 flex flex-wrap gap-10 items-center text-sm shadow-2xl">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Origin</span>
                    <span className="font-bold text-white flex items-center gap-2 text-base">
                        <Anchor className="w-4 h-4 text-white" />
                        {formData.origin.split(',')[0]}
                    </span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Destination</span>
                    <span className="font-bold text-white flex items-center gap-2 text-base">
                        <Anchor className="w-4 h-4 text-white" />
                        {formData.destination.split(',')[0]}
                    </span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Package Info</span>
                    <span className="font-bold text-white text-base">1 x {formData.containerSize}&apos; HC Container</span>
                </div>
                <div className="ml-auto">
                    <Button variant="outline" size="sm" className="h-9 border-white/20 text-white hover:bg-white hover:text-black transition-all">
                        Modify Search
                    </Button>
                </div>
            </div>

            {/* Sorting Tabs - Monochrome Style */}
            <div className="grid grid-cols-4 gap-0 bg-black rounded-xl border border-white/10 overflow-hidden divide-x divide-white/10 shadow-xl">
                {([
                    { id: 'best', label: 'Best choice', sub: metrics ? `${metrics.best.days} days • $${metrics.best.price.toLocaleString()}` : '--' },
                    { id: 'fastest', label: 'Quickest', sub: metrics ? `${metrics.fastest.days} days • $${metrics.fastest.price.toLocaleString()}` : '--' },
                    { id: 'cheapest', label: 'Cheapest', sub: metrics ? `${metrics.cheapest.days} days • $${metrics.cheapest.price.toLocaleString()}` : '--' },
                    { id: 'greenest', label: 'Eco-route', sub: metrics ? `${metrics.greenest.days} days • $${metrics.greenest.price.toLocaleString()}` : '--' }
                ] as const).map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setSortMode(mode.id)}
                        className={`p-6 text-sm flex flex-col items-center justify-center transition-all ${sortMode === mode.id ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <span className={`font-black uppercase tracking-tighter text-lg ${sortMode === mode.id ? 'text-black' : 'text-white'}`}>{mode.label}</span>
                        <span className={`text-xs font-medium ${sortMode === mode.id ? 'text-black/60' : 'text-gray-500'}`}>
                            {mode.sub}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters - Classic Dark View */}
                <div className="w-full lg:w-64 space-y-8 h-fit sticky top-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-xs"><Filter className="w-4 h-4" /> Ship-Filters</h3>
                            <button className="text-xs text-gray-500 hover:text-white transition-colors">Reset</button>
                        </div>

                        <div className="space-y-6 border-t border-white/10 pt-6">
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Price Threshold</h4>
                            <Slider defaultValue={[100]} max={100} step={1} className="w-full" />
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span className="text-white">${bestPrice}</span>
                                <span>${Math.round(bestPrice * 2)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-6">
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Booking Mode</h4>
                            <div className="flex items-center gap-3"><Checkbox id="guaranteed" checked className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" /><Label htmlFor="guaranteed" className="text-sm font-medium text-white">Guaranteed Space</Label></div>
                            <div className="flex items-center gap-3"><Checkbox id="standard" className="border-white/20" /><Label htmlFor="standard" className="text-sm font-medium text-gray-400">Flex Standard</Label></div>
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-6">
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Global Modes</h4>
                            <div className="flex items-center gap-3"><Checkbox id="ocean" checked className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" /><Label htmlFor="ocean" className="text-sm font-medium text-white">Ocean FCL</Label></div>
                            <div className="flex items-center gap-3"><Checkbox id="air" className="border-white/20" /><Label htmlFor="air" className="text-sm font-medium text-gray-400">Air Freight</Label></div>
                        </div>
                    </div>
                </div>

                {/* Main Results Feed */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">
                            {sortedQuotes.length} <span className="text-gray-500 not-italic font-bold">Verified Routes Found</span>
                        </h2>
                    </div>

                    {loading ? (
                        <PremiumSearchingState />
                    ) : quotes.length > 0 ? (
                        sortedQuotes.map((q, i) => (
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
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                            <Anchor className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Routes Found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-4 text-sm font-medium">
                                We couldn&apos;t find any verified quotes for this route.
                                Our experts are working on manual verification.
                            </p>
                            <Button variant="outline" className="mt-8 border-white/20 text-white hover:bg-white hover:text-black transition-all h-12 px-8">
                                Request Manual Quote
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
