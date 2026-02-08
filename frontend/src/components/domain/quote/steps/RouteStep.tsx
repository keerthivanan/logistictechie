"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, Map } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { GooglePlacesInput } from "@/components/ui/GooglePlacesInput";

export function RouteStep() {
    const { t } = useLanguage();
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Form Side */}
            <div className="space-y-10">
                <div className="space-y-4">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Step 02 — Corridor Selection</p>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">{t('quote.wizard.route.title')}</h2>
                    <p className="text-gray-500 font-light text-lg">Define the global transit points for your cargo.</p>
                </div>

                <div className="space-y-8 bg-white/[0.02] p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('quote.wizard.route.origin')}</Label>
                            <GooglePlacesInput
                                value={formData.origin}
                                onChange={(val: string) => updateForm({ origin: val })}
                                placeholder={t('quote.wizard.route.origin_placeholder')}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('quote.wizard.route.destination')}</Label>
                            <GooglePlacesInput
                                value={formData.destination}
                                onChange={(val: string) => updateForm({ destination: val })}
                                placeholder={t('quote.wizard.route.dest_placeholder')}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" size="lg" onClick={prevStep} className="w-1/3 h-14 rounded-xl border-white/10 text-gray-400 hover:bg-white hover:text-black transition-all uppercase font-black tracking-tighter">
                        {t('quote.wizard.route.back')}
                    </Button>
                    <Button size="lg" onClick={nextStep} className="w-2/3 h-14 rounded-xl bg-white text-black hover:bg-gray-200 group uppercase font-black tracking-tighter text-lg shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white">
                        {t('quote.wizard.route.next')} <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* Map Side - Premium Card */}
            <div className="aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative bg-black group transition-all duration-700 hover:border-white/20">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
                <div className="absolute top-8 left-8 z-20 flex items-center gap-3 px-4 py-2 rounded-lg bg-black/80 backdrop-blur-md border border-white/10">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <Map className="w-3 h-3" /> Satellite Corridor Active
                    </span>
                </div>
                <RouteMap origin={formData.origin} destination={formData.destination} />
            </div>
        </div>
    );
}
