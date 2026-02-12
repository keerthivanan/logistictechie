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

    useEffect(() => {
        if (step === 1 && formData.origin && formData.destination) {
            setStep(2);
        }
    }, [step, formData.origin, formData.destination, setStep]);

    const { t } = useLanguage();

    const steps = [
        { num: 1, label: "CARGO" },
        { num: 2, label: "ROUTE" },
        { num: 3, label: "DETAILS" },
        { num: 4, label: "SERVICES" },
        { num: 5, label: "RESULTS" },
        { num: 6, label: "BOOKING" }
    ];

    return (
        <div className="space-y-24">

            {/* Monumental Progress Indices */}
            <div className="grid grid-cols-6 gap-8 border-b border-white/5 pb-16">
                {steps.map((s) => {
                    const isActive = step === s.num;
                    const isCompleted = step > s.num;

                    return (
                        <div
                            key={s.num}
                            onClick={() => isCompleted && setStep(s.num)}
                            className={cn(
                                "cursor-pointer group transition-all duration-700",
                                isActive ? "opacity-100" : isCompleted ? "opacity-40 hover:opacity-100" : "opacity-10"
                            )}
                        >
                            <span className={cn(
                                "text-6xl font-light tabular-nums tracking-tighter block mb-2 transition-all",
                                isActive ? "text-white scale-110" : "text-zinc-600"
                            )}>
                                0{s.num}
                            </span>
                            <span className="arch-label text-[8px]">{s.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Tactical Content Block */}
            <div className="p-12 bg-zinc-950/20 border border-white/5 relative overflow-hidden group">
                {/* Protocol ID */}
                <div className="flex justify-between items-center mb-16 opacity-50">
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-white animate-pulse" />
                        <span className="arch-label">PROTOCOL_SYNC: {step}/06</span>
                    </div>
                    <Shield className="w-4 h-4 text-zinc-900" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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

            {/* Sub-context Log */}
            <div className="arch-detail-line h-4 opacity-5" />
        </div>
    );
}
