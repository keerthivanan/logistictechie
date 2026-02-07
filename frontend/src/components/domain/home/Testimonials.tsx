"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function TestimonialsSection() {
    const { t } = useLanguage();

    const valueProps = [
        {
            title: t('testimonials.card1_title'),
            desc: t('testimonials.card1_desc'),
            icon: Search
        },
        {
            title: t('testimonials.card2_title'),
            desc: t('testimonials.card2_desc'),
            icon: Shield
        },
        {
            title: t('testimonials.card3_title'),
            desc: t('testimonials.card3_desc'),
            icon: Zap
        }
    ];

    return (
        <section className="relative py-32 bg-black border-t border-white/5">
            <div className="container relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">The Logic of Logistics</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 uppercase">
                        {t('testimonials.title')}
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                        {t('testimonials.subtitle')}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {valueProps.map((prop, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group"
                        >
                            <div className="h-full p-10 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/[0.04]">
                                <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center mb-8 shadow-xl shadow-white/5">
                                    <prop.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{prop.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light text-lg">
                                    {prop.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-32 text-center"
                >
                    <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-10 font-bold">Standard Carrier Connectivity</p>
                    <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                        <div className="text-white text-3xl font-black tracking-tighter">DHL</div>
                        <div className="text-white text-3xl font-black tracking-tighter">FEDEX</div>
                        <div className="text-white text-3xl font-black tracking-tighter">MAERSK</div>
                        <div className="text-white text-3xl font-black tracking-tighter">MSC</div>
                        <div className="text-white text-3xl font-black tracking-tighter">CMA CGM</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
