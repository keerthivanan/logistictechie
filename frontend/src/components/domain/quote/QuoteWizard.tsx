"use client";

import { useEffect } from "react";
import { useQuoteStore } from "@/hooks/use-quote";
import { CargoStep } from "./steps/CargoStep";
import { RouteStep } from "./steps/RouteStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ServicesStep } from "./steps/ServicesStep";
import { ResultsStep } from "./steps/ResultsStep";
import { BookingStep } from "./steps/BookingStep";
import { Check, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function QuoteWizard() {
    const { step, formData, setStep } = useQuoteStore();

    useEffect(() => {
        if (step === 1 && formData.origin && formData.destination) {
            setStep(2);
        }
    }, [step, formData.origin, formData.destination, setStep]);

    const { t } = useLanguage();

    const steps = [
        { num: 1, label: t('quote.wizard.steps.cargo') },
        { num: 2, label: t('quote.wizard.steps.route') },
        { num: 3, label: t('quote.wizard.steps.details') },
        { num: 4, label: t('quote.wizard.steps.services') },
        { num: 5, label: t('quote.wizard.steps.results') },
        { num: 6, label: t('quote.wizard.steps.booking') }
    ];

    return (
        <div className="space-y-24">

            {/* Monumental Progress Indices - Static & High Contrast */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-12 border-b-2 border-white/10 pb-16">
                {steps.map((s) => {
                    const isActive = step === s.num;
                    const isCompleted = step > s.num;

                    return (
                        <div
                            key={s.num}
                            onClick={() => isCompleted && setStep(s.num)}
                            className={cn(
                                "cursor-pointer group relative",
                                isActive ? "opacity-100" : isCompleted ? "opacity-60 hover:opacity-100" : "opacity-20"
                            )}
                        >
                            <div className="flex items-center gap-6 mb-4">
                                <span className={cn(
                                    "text-6xl md:text-8xl font-black tabular-nums tracking-tighter transition-all",
                                    isActive ? "text-white" : "text-white/20"
                                )}>
                                    0{s.num}
                                </span>
                                {isCompleted && <Check className="w-8 h-8 text-white" />}
                            </div>
                            <span className={cn(
                                "text-[12px] font-black uppercase tracking-[0.4em] block transition-colors",
                                isActive ? "text-white italic underline underline-offset-8 decoration-white/20" : "text-white/20"
                            )}>
                                {s.label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-[18px] left-0 w-full h-1.5 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.5)]" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tactical Content Block - Static */}
            <div className="relative">
                {/* Protocol ID */}
                <div className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-6">
                        <div className="h-3 w-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                        <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.8em]">{t('quote.wizard.protocolSync')}: {step}/06</span>
                    </div>
                    <div className="flex items-center gap-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl shadow-2xl">
                        <Shield className="w-5 h-5 text-white" />
                        <span className="text-[10px] font-black text-white tracking-[0.6em] uppercase leading-none italic">SECURE_SYNC_ENFORCED</span>
                    </div>
                </div>

                <div className="min-h-[600px]">
                    {step === 1 && <CargoStep />}
                    {step === 2 && <RouteStep />}
                    {step === 3 && <DetailsStep />}
                    {step === 4 && <ServicesStep />}
                    {step === 5 && <ResultsStep />}
                    {step === 6 && <BookingStep />}
                </div>
            </div>

            {/* Sub-context Log */}
            <div className="h-[2px] bg-white/10 w-full" />
        </div>
    );
}
