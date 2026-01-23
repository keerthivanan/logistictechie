"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { motion, AnimatePresence } from "framer-motion";
import { CargoStep } from "./steps/CargoStep";
import { RouteStep } from "./steps/RouteStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ResultsStep } from "./steps/ResultsStep";
import { BookingStep } from "./steps/BookingStep";
import { useLanguage } from "@/contexts/LanguageContext";

export function QuoteWizard() {
    const { t } = useLanguage();
    const { step } = useQuoteStore();

    return (
        <div className="w-full max-w-5xl mx-auto p-6">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600 rtl:origin-right"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between mt-3 text-sm font-medium text-muted-foreground uppercase tracking-widest rtl:flex-row-reverse">
                    <span className={step >= 1 ? "text-blue-500" : ""}>{t('quote.wizard.steps.cargo')}</span>
                    <span className={step >= 2 ? "text-blue-500" : ""}>{t('quote.wizard.steps.route')}</span>
                    <span className={step >= 3 ? "text-blue-500" : ""}>{t('quote.wizard.steps.details')}</span>
                    <span className={step >= 4 ? "text-blue-500" : ""}>{t('quote.wizard.steps.results')}</span>
                </div>
            </div>

            {/* Step Content with Transitions */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px]"
                >
                    {step === 1 && <CargoStep />}
                    {step === 2 && <RouteStep />}
                    {step === 3 && <DetailsStep />}
                    {step === 4 && <ResultsStep />}
                    {step === 5 && <BookingStep />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
