"use client";

import { motion } from "framer-motion";
import { QuoteWizard } from "@/components/domain/quote/QuoteWizard";
import { Sparkles } from "lucide-react";

export default function QuotePage() {
    return (
        <main className="min-h-screen bg-black pt-24 pb-20">
            {/* Hero */}
            <section className="relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/15 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-6">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <span>AI-Powered Logistics Engine</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
                                Smart Logistics Engine
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Instant rates from 50+ global carriers. Zero hidden fees.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Quote Wizard */}
            <section className="container max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <QuoteWizard />
                </motion.div>
            </section>
        </main>
    );
}
