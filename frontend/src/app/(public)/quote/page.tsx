"use client";

import { motion } from "framer-motion";
import { QuoteWizard } from "@/components/domain/quote/QuoteWizard";

import { useLanguage } from "@/contexts/LanguageContext";

export default function QuotePage() {
    const { t } = useLanguage();
    return (
        <main className="min-h-screen bg-black pt-32 pb-20">
            <section className="container max-w-7xl mx-auto px-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">{t('quote.subtitle')}</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {t('quote.title')}
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        {t('quote.description')}
                    </p>
                </motion.div>
            </section>

            {/* Quote Wizard Section */}
            <section className="container max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <QuoteWizard />
                </motion.div>
            </section>
        </main>
    );
}
