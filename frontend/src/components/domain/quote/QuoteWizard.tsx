"use client";

import { useEffect } from "react";
import { useQuoteStore } from "@/hooks/use-quote";
import { motion, AnimatePresence } from "framer-motion";
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

    // Auto-Advance Protocol
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
        <div className="w-full">
            {/* Sovereign Progress Architecture */}
            <div className="flex items-center justify-between mb-24 relative px-4">
                <div className="absolute top-5 left-12 right-12 h-[1px] bg-white/5 z-0" />

                {steps.map((s, idx) => {
                    const isActive = step === s.num;
                    const isCompleted = step > s.num;

                    return (
                        <div key={s.num} className="flex flex-col items-center relative z-10 bg-black px-6 group cursor-pointer" onClick={() => isCompleted && setStep(s.num)}>
                            <div
                                className={cn(
                                    "h-10 w-10 border flex items-center justify-center text-[11px] font-black transition-all duration-700",
                                    isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                        : isActive
                                            ? "bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110"
                                            : "bg-black border-zinc-900 text-zinc-700 group-hover:border-zinc-500 group-hover:text-zinc-500"
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num.toString().padStart(2, '0')}
                            </div>
                            <div className="absolute -bottom-10 whitespace-nowrap overflow-hidden">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-700",
                                    isActive ? "text-white opacity-100" : isCompleted ? "text-emerald-500 opacity-80" : "text-zinc-800 opacity-50"
                                )}>
                                    {s.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tactical Content Interface */}
            <div className="elite-card relative overflow-hidden">
                <div className="p-8 md:p-20 relative z-10">
                    {/* Security Badge */}
                    <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">ENCRYPTED_SESSION: {step}/06</span>
                        </div>
                        <Shield className="w-4 h-4 text-zinc-900" />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="min-h-[500px]"
                        >
                            {step === 1 && <CargoStep />}
                            {step === 2 && <RouteStep />}
                            {step === 3 && <DetailsStep />}
                            {step === 4 && <ServicesStep />}
                            {step === 5 && <ResultsStep />}
                            {step === 6 && <BookingStep />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Decorative Interface Elements */}
                <div className="absolute top-0 right-0 p-8 flex gap-4 opacity-10 pointer-events-none">
                    <div className="w-8 h-[1px] bg-white" />
                    <div className="w-2 h-[1px] bg-white" />
                </div>
                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-1 opacity-5 pointer-events-none">
                    <div className="w-[1px] h-8 bg-white" />
                    <div className="w-[1px] h-2 bg-white" />
                </div>
            </div>
        </div>
    );
}
