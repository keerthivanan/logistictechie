"use client";

import { ShieldCheck, Zap, Ship, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function FeaturesSection() {
    const { t } = useLanguage();

    const features = [
        {
            icon: Ship,
            title: t('features.api_title'),
            desc: t('features.api_desc'),
        },
        {
            icon: Zap,
            title: t('features.accuracy_title'),
            desc: t('features.accuracy_desc'),
        },
        {
            icon: ShieldCheck,
            title: t('features.insured_title'),
            desc: t('features.insured_desc'),
        },
        {
            icon: Trophy,
            title: t('features.tech_title'),
            desc: t('features.tech_desc'),
        }
    ];

    return (
        <section className="relative py-32 bg-background border-t border-white/5">
            <div className="container relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Why Choose Us</p>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                            Built for the Future of Logistics.
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                            Reliability meets speed. We stripped away the noise to give you the tool you requested.
                        </p>
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group relative"
                        >
                            {/* Card - Classic Minimalist */}
                            <div className="relative h-full p-8 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
                                {/* Icon */}
                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-white text-black mb-6">
                                    <f.icon className="h-6 w-6" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>

                                <p className="text-gray-400 leading-relaxed text-sm">
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Row - High Contrast */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-b border-white/10"
                >
                    <div className="text-center">
                        <div className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">50+</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Shipping Lines</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">200+</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Countries</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">99.9%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">&lt;2s</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Quote Time</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
