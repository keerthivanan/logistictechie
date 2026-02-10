"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { motion, AnimatePresence } from "framer-motion";
import { CargoStep } from "./steps/CargoStep";
import { RouteStep } from "./steps/RouteStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ServicesStep } from "./steps/ServicesStep";
import { ResultsStep } from "./steps/ResultsStep";
import { BookingStep } from "./steps/BookingStep";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function QuoteWizard() {
    const { step, formData, setStep } = useQuoteStore();

    // Auto-Advance from Home Search
    if (step === 1 && formData.origin && formData.destination) {
        setStep(2);
    }

    const { t } = useLanguage();

    const steps = [
        { num: 1, label: t('quoteWizard.steps.cargo') },
        { num: 2, label: t('quoteWizard.steps.route') },
        { num: 3, label: t('quoteWizard.steps.details') },
        { num: 4, label: t('quoteWizard.steps.services') },
        { num: 5, label: t('quoteWizard.steps.results') },
        { num: 6, label: t('quoteWizard.steps.booking') }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
                {steps.map((s, idx) => (
                    <div key={s.num} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step > s.num
                                    ? "bg-emerald-500 text-white"
                                    : step === s.num
                                        ? "bg-white text-black"
                                        : "bg-zinc-800 text-zinc-500"
                                    }`}
                            >
                                {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step >= s.num ? "text-white" : "text-zinc-500"
                                }`}>
                                {s.label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`h-0.5 w-16 md:w-24 mx-2 ${step > s.num ? "bg-emerald-500" : "bg-zinc-800"
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 md:p-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
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
        </div>
    );
}
