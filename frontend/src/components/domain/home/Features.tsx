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
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: Zap,
            title: t('features.accuracy_title'),
            desc: t('features.accuracy_desc'),
            gradient: "from-amber-500 to-orange-500"
        },
        {
            icon: ShieldCheck,
            title: t('features.insured_title'),
            desc: t('features.insured_desc'),
            gradient: "from-emerald-500 to-teal-500"
        },
        {
            icon: Trophy,
            title: t('features.tech_title'),
            desc: t('features.tech_desc'),
            gradient: "from-purple-500 to-pink-500"
        }
    ];

    return (
        <section className="relative py-32 bg-black overflow-hidden">
            {/* Subtle gradient orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="container relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <p className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-4">Why Choose Us</p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                        Built for the Future of
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                            Global Logistics
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        We combined advanced AI with deep logistics expertise to build the ultimate shipping platform.
                    </p>
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
                            {/* Card */}
                            <div className="relative h-full p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.1] hover:-translate-y-1">
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${f.gradient} mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <f.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>

                                <p className="text-gray-400 leading-relaxed text-sm">
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-b border-white/[0.05]"
                >
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Shipping Lines</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-white mb-2">200+</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Countries</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-white mb-2">&lt;2s</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">Quote Time</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
