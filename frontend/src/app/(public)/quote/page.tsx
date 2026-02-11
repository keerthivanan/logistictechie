"use client";

import { motion } from "framer-motion";
import { QuoteWizard } from "@/components/domain/quote/QuoteWizard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Zap, Shield, Globe } from "lucide-react";

export default function QuotePage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 pt-48 pb-48 relative z-10">
                {/* Cinematic Header */}
                <div className="flex flex-col mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-[1px] bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">DEPLOYMENT_INITIALIZATION</span>
                        </div>
                        <h1 className="titan-text mb-8">
                            Initialize. <br />
                            <span className="text-zinc-900 group">Ascension.</span>
                        </h1>
                        <p className="max-w-2xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] leading-relaxed">
                            Configure your logistical parameters. <br />
                            <span className="text-zinc-800">Automated Routing. Millisecond Accuracy.</span>
                        </p>
                    </motion.div>
                </div>

                {/* Tactical Status Indicators */}
                <div className="flex flex-wrap items-center gap-12 mb-32 border-b border-white/5 pb-16">
                    {[
                        { icon: Globe, label: "GLOBAL_NODES: ONLINE" },
                        { icon: Shield, label: "ENCRYPTION: ACTIVE" },
                        { icon: Zap, label: "ROUTING: OPTIMIZED" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-default">
                            <item.icon className="w-4 h-4 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-[9px] font-black text-zinc-800 tracking-[0.2em] group-hover:text-zinc-400 transition-colors">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Secondary Deployment Log Section - Hidden visual texture */}
                <div className="absolute top-[600px] right-0 p-12 opacity-5 italic font-black text-9xl text-white select-none pointer-events-none uppercase">
                    DEPLOY
                </div>

                {/* Quote Wizard Protocol */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-20"
                >
                    <QuoteWizard />
                </motion.div>
            </div>

            {/* Ambient Background Elements */}
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
        </main>
    );
}
