"use client";

import { motion } from "framer-motion";
import { QuoteWizard } from "@/components/domain/quote/QuoteWizard";
import { Zap, Shield, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function QuotePage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">{t('quotePage.initialization')}</span>
                        <h1 className="arch-heading">{t('quotePage.title')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            {t('quotePage.configure')}
                        </p>
                    </div>
                </motion.div>

                {/* Structured Protocol Interface */}
                <div className="grid lg:grid-cols-[1fr,2.5fr] gap-32 border-t border-white/5 pt-32">

                    {/* Left: Tactical Sensors */}
                    <div className="space-y-32 hidden lg:block">
                        <div className="space-y-16">
                            {[
                                { id: "01", label: "GLOBAL_NODES", status: "ONLINE", icon: Globe },
                                { id: "02", label: "ENCRYPTION", status: "ACTIVE", icon: Shield },
                                { id: "03", label: "ROUTING", status: "OPTIMIZED", icon: Zap }
                            ].map((item) => (
                                <div key={item.id} className="arch-detail-line group">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="arch-number text-zinc-900 group-hover:text-white transition-all">{item.id}</span>
                                        <item.icon className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors" />
                                    </div>
                                    <p className="text-[10px] font-bold tracking-[0.4em] text-white uppercase">{item.label}</p>
                                    <p className="text-emerald-500 text-[9px] uppercase tracking-widest mt-1 font-bold">{item.status}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Quote Wizard Protocol */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        <QuoteWizard />
                    </motion.div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">{t('quotePage.protocolReady')}</span>
                    <h2 className="arch-heading italic mb-16">{t('quotePage.forgeLinkMove')}</h2>
                </div>
            </div>
        </main>
    );
}
