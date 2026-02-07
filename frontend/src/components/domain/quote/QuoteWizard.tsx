"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { motion, AnimatePresence } from "framer-motion";
import { CargoStep } from "./steps/CargoStep";
import { RouteStep } from "./steps/RouteStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ServicesStep } from "./steps/ServicesStep";
import { ResultsStep } from "./steps/ResultsStep";
import { BookingStep } from "./steps/BookingStep";

export function QuoteWizard() {
    // const { t } = useLanguage();
    const { step } = useQuoteStore();

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            {/* Progress Bar (Extracted or Inline specialized) */}
            <div className="mb-12">
                {/* Visual Mapping: 
                    Steps 1-3 = "Search" (Phase 1)
                    Step 4 = "Recommended Services" (Phase 2)
                    Step 5 = "Results" (Phase 3)
                    Step 6 = "Booking" (Phase 4)
                */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div
                        className="h-full bg-white rtl:origin-right"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 6) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Labels Match Screenshot - Responsive optimized */}
                <div className="flex justify-between mt-6 text-sm font-bold text-gray-400 relative">
                    <span className={`flex items-center gap-3 transition-all duration-500 ${step >= 1 ? "text-white" : ""}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-700 ${step >= 1
                            ? "bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)] rotate-[360deg]"
                            : "bg-white/5 border border-white/10"}`}>1</div>
                        <span className="uppercase tracking-[0.2em] text-[10px] hidden sm:block font-black">Search</span>
                    </span>

                    <span className={`flex items-center gap-3 transition-all duration-500 ${step >= 4 ? "text-white" : ""}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-700 ${step >= 4
                            ? "bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)] rotate-[360deg]"
                            : "bg-white/5 border border-white/10"}`}>2</div>
                        <span className="uppercase tracking-[0.2em] text-[10px] hidden sm:block font-black">Solutions</span>
                    </span>

                    <span className={`flex items-center gap-3 transition-all duration-500 ${step >= 5 ? "text-white" : ""}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-700 ${step >= 5
                            ? "bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)] rotate-[360deg]"
                            : "bg-white/5 border border-white/10"}`}>3</div>
                        <span className="uppercase tracking-[0.2em] text-[10px] hidden sm:block font-black">Results</span>
                    </span>

                    <span className={`flex items-center gap-3 transition-all duration-500 ${step >= 6 ? "text-white" : ""}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-700 ${step >= 6
                            ? "bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)] rotate-[360deg]"
                            : "bg-white/5 border border-white/10"}`}>4</div>
                        <span className="uppercase tracking-[0.2em] text-[10px] hidden sm:block font-black">Checkout</span>
                    </span>
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
                    className="min-h-[500px]"
                >
                    {step === 1 && <CargoStep />}
                    {step === 2 && <RouteStep />}
                    {step === 3 && <DetailsStep />}
                    {step === 4 && <ServicesStep />} {/* The New Step */}
                    {step === 5 && <ResultsStep />}
                    {step === 6 && <BookingStep />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
