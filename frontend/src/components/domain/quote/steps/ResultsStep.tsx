"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { CarrierCard } from "../CarrierCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { logisticsClient } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";

export function ResultsStep() {
    const { t } = useLanguage();
    const { formData } = useQuoteStore();
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar Filters (Like Screenshot) */}
            <div className="w-full lg:w-64 space-y-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">{t('quote.wizard.results.services')}</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2"><Checkbox id="p1" checked /><Label>{t('quote.wizard.results.pol')}</Label></div>
                        <div className="flex items-center gap-2"><Checkbox id="p2" checked /><Label>{t('quote.wizard.results.ocean')}</Label></div>
                        <div className="flex items-center gap-2"><Checkbox id="p3" checked /><Label>{t('quote.wizard.results.pod')}</Label></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">{t('quote.wizard.results.price_range')}</h3>
                    <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>$1000</span>
                        <span>$8000</span>
                    </div>
                </div>
            </div>

            {/* Main Results Feed */}
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg mb-4">
                    <span className="text-sm font-bold text-blue-700">🔔 {t('quote.wizard.results.stay_updated')}</span>
                    <span className="text-sm text-gray-500">{t('quote.wizard.results.sort')}</span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    quotes.map((q, i) => (
                        <CarrierCard
                            key={i}
                            quote={q}
                            origin={formData.origin}
                            destination={formData.destination}
                            onBook={() => {
                                // @ts-ignore - store expects any for now
                                useQuoteStore.getState().selectQuote(q);
                                useQuoteStore.getState().nextStep();
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
