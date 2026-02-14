"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { CarrierCard } from "../CarrierCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState, useMemo } from "react";
import { logisticsClient } from "@/lib/logistics";
import { Ship, ArrowRight, X, MapPin, ChevronDown, Calendar } from "lucide-react";
import { PremiumSearchingState } from "../PremiumSearchingState";
import { QuoteResult } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";

type SortMode = 'best' | 'fastest' | 'cheapest' | 'greenest';

export function ResultsStep() {
    const { t } = useLanguage();
    const { formData } = useQuoteStore();
    const [quotes, setQuotes] = useState<QuoteResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortMode] = useState<SortMode>('best');

    useEffect(() => {
        const fetch = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const data = await logisticsClient.getRates({
                    origin: formData.origin,
                    destination: formData.destination,
                    container: formData.containerSize
                });
                setQuotes(data);
            } catch (e) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(e);
                }
                setQuotes([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [formData]);

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

    if (loading) return <PremiumSearchingState />;

    return (
        <div className="max-w-[1400px] mx-auto space-y-16">
            {/* --- Top Search Summary Bar - Monumental & High Contrast --- */}
            <div className="flex flex-wrap items-center gap-6 py-12 border-b border-white/10">
                <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full">
                    <MapPin className="h-5 w-5 text-white" />
                    <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">{formData.origin}</span>
                    <X className="h-5 w-5 text-white/20 cursor-pointer hover:text-white transition-colors" />
                </div>
                <div className="h-10 w-10 flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-white/40" />
                </div>
                <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full">
                    <MapPin className="h-5 w-5 text-white" />
                    <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">{formData.destination}</span>
                    <X className="h-5 w-5 text-white/20 cursor-pointer hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full">
                    <Calendar className="h-5 w-5 text-white" />
                    <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">14 Feb, 2026</span>
                    <X className="h-5 w-5 text-white/20 cursor-pointer hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full">
                    <Ship className="h-5 w-5 text-white" />
                    <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">FCL, {formData.containerSize}&apos; ST</span>
                    <X className="h-5 w-5 text-white/20 cursor-pointer hover:text-white transition-colors" />
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-16 items-start">

                {/* --- Left: Filter Sidebar - Monumental Scales --- */}
                <aside className="lg:col-span-3 space-y-12 h-fit lg:sticky lg:top-32">
                    <div className="p-12 rounded-[64px] border border-white/10 bg-zinc-950/40 backdrop-blur-3xl space-y-12 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em]">{t('quote.results.filter') || "Filter"}</h3>
                            <button className="text-[10px] font-black text-white uppercase tracking-widest hover:underline decoration-white/20 underline-offset-4">RESET</button>
                        </div>

                        {/* Included Services Section */}
                        <div className="space-y-10">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em]">Integrated_Modules</h4>
                            <div className="space-y-8">
                                {[
                                    { label: 'Place of loading', checked: true },
                                    { label: 'Port of origin', checked: true },
                                    { label: 'Ocean freight', checked: true },
                                    { label: 'Port of destination', checked: false },
                                    { label: 'Place of discharge', checked: false },
                                ].map((service, i) => (
                                    <div key={i} className="flex items-center gap-6 cursor-pointer group/filter">
                                        <Checkbox
                                            id={`service-${i}`}
                                            checked={service.checked}
                                            className="h-6 w-6 rounded-full border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black transition-all"
                                        />
                                        <Label
                                            htmlFor={`service-${i}`}
                                            className="text-[12px] font-black text-white uppercase tracking-[0.2em] cursor-pointer group-hover/filter:translate-x-1 transition-transform"
                                        >
                                            {service.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Section */}
                        <div className="space-y-10">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em]">Cost_Spectrum</h4>
                            <div className="flex items-center gap-6">
                                <div className="flex-1 p-5 rounded-full border border-white/10 bg-black text-[12px] font-black text-white text-center tabular-nums italic">1757_USD</div>
                                <div className="flex-1 p-5 rounded-full border border-white/10 bg-black text-[12px] font-black text-white text-center tabular-nums italic">3690_USD</div>
                            </div>
                            <Slider defaultValue={[40]} max={100} step={1} className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white h-10" />
                        </div>

                        {/* Transit Time Section */}
                        <div className="space-y-10">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em]">Transit_Velocity</h4>
                            <Slider defaultValue={[20]} max={60} step={1} className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white h-10" />
                        </div>
                    </div>
                </aside>

                {/* --- Right: Results Architecture --- */}
                <main className="lg:col-span-9 space-y-16">
                    {/* Secondary Sorting/Status Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 pb-12 border-b border-white/10">
                        <div className="flex gap-8">
                            <button className="flex items-center gap-6 px-12 py-5 bg-white text-black text-[12px] font-black uppercase tracking-[1em] rounded-full active:scale-95 transition-all shadow-2xl">
                                SUBSCRIBE_INDEX
                            </button>
                            <button className="flex items-center gap-6 px-12 py-5 border border-white/10 text-white text-[12px] font-black uppercase tracking-[0.8em] rounded-full hover:bg-white/5 active:scale-95 transition-all">
                                PROTOCOL_DISCLAIMER
                            </button>
                        </div>

                        <div className="flex items-center gap-8">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em]">SORT_BY</span>
                            <div className="flex items-center gap-4 border-b-2 border-white/10 pb-2 cursor-pointer group/sort">
                                <span className="text-[12px] font-black text-white uppercase tracking-[0.4em] group-hover:text-white transition-colors italic">RECOMMENDED</span>
                                <ChevronDown className="h-5 w-5 text-white/40 group-hover:text-white transition-all group-hover:translate-y-0.5" />
                            </div>
                        </div>
                    </div>

                    {/* Results Feed - Static */}
                    <div className="space-y-12">
                        {sortedQuotes.map((q, i) => (
                            <CarrierCard
                                key={i}
                                quote={q}
                                origin={formData.origin.split(',')[0]}
                                destination={formData.destination.split(',')[0]}
                                onBook={() => {
                                    useQuoteStore.getState().selectQuote(q);
                                    useQuoteStore.getState().nextStep();
                                }}
                            />
                        ))}
                    </div>

                    {quotes.length === 0 && (
                        <div className="py-48 text-center bg-zinc-950/40 rounded-[64px] border border-white/10 shadow-2xl">
                            <Ship className="h-24 w-24 text-white/5 mx-auto mb-10" />
                            <h3 className="text-4xl font-black text-white/20 uppercase tracking-tighter italic">ZERO_FORENSIC_MATCHES</h3>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
