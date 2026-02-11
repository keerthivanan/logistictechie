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

                {/* Section Header - Apple "The latest" Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase italic">
                        The Core. <span className="text-zinc-800">Operational Excellence.</span>
                    </h2>
                    <p className="text-zinc-600 text-lg font-bold uppercase tracking-widest">
                        High-frequency logistics data at your fingertips.
                    </p>
                </motion.div>

                {/* Apple Style Horizontal Shelf */}
                <div className="relative -mx-6 px-6 overflow-x-auto no-scrollbar pb-12">
                    <div className="flex gap-8 w-max">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="w-[350px] md:w-[450px] aspect-[4/5] bg-zinc-950 border border-white/5 rounded-[2rem] p-12 hover:border-white/20 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <feature.icon className="h-32 w-32" />
                                </div>
                                <div className="h-16 w-16 bg-white flex items-center justify-center mb-10 rounded-none group-hover:rotate-12 transition-transform duration-500 shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                                    <feature.icon className="h-8 w-8 text-black" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-6 uppercase italic leading-none">{feature.title}</h3>
                                <p className="text-zinc-500 text-lg font-bold uppercase tracking-tight leading-relaxed">{feature.description}</p>

                                <div className="absolute bottom-12 left-12">
                                    <div className="h-2 w-24 bg-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full bg-white w-0 group-hover:w-full transition-all duration-700" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
