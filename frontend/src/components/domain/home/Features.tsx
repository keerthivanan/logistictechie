"use client";

import { motion } from "framer-motion";
import { Ship, Shield, Clock, TrendingUp } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

export function FeaturesSection() {
    const { t } = useLanguage();

    const features = [
        {
            icon: Ship,
            title: t('landing.features.list.0.title'),
            description: t('landing.features.list.0.description')
        },
        {
            icon: Shield,
            title: t('landing.features.list.1.title'),
            description: t('landing.features.list.1.description')
        },
        {
            icon: Clock,
            title: t('landing.features.list.2.title'),
            description: t('landing.features.list.2.description')
        },
        {
            icon: TrendingUp,
            title: t('landing.features.list.3.title'),
            description: t('landing.features.list.3.description')
        }
    ];

    return (
        <section className="relative py-24 bg-black">
            <div className="container max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">{t('landing.features.badge')}</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {t('landing.features.title')}
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        {t('landing.features.description')}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-zinc-800 pt-16"
                >
                    {[
                        { value: "50+", label: t('landing.features.stats.carriers') },
                        { value: "200+", label: t('landing.features.stats.ports') },
                        { value: "99.9%", label: t('landing.features.stats.uptime') },
                        { value: "<1min", label: t('landing.features.stats.quote') }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-zinc-500 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
