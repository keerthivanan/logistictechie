"use client";

import { motion } from "framer-motion";
import { QuoteWizard } from "@/components/domain/quote/QuoteWizard";
import { Sparkles } from "lucide-react";

export default function QuotePage() {
    return (
        <main className="min-h-screen bg-black pt-24 pb-20 bg-mesh-dark">
            {/* Hero */}
            <section className="relative overflow-hidden mb-12">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8 holographic-glow">
                            Logistic Intelligence Engine
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic">
                            Smart <span className="text-gray-500 not-italic">Logistics</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed tracking-tight">
                            Instant bandwidth synchronization with 50+ global carriers. Zero latency procurement.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Quote Wizard */}
            <section className="container max-w-6xl mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative"
                >
                    {/* Decorative element */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/[0.02] rounded-full blur-[80px] pointer-events-none" />

                    <QuoteWizard />
                </motion.div>
            </section>
        </main>
    );
}
