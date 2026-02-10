"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Search, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function TestimonialsSection() {
    const { t } = useLanguage();

    const testimonials = [
        {
            quote: t('landing.testimonials.list.0.quote'),
            author: t('landing.testimonials.list.0.author'),
            role: t('landing.testimonials.list.0.role'),
            company: t('landing.testimonials.list.0.company')
        },
        {
            quote: t('landing.testimonials.list.1.quote'),
            author: t('landing.testimonials.list.1.author'),
            role: t('landing.testimonials.list.1.role'),
            company: t('landing.testimonials.list.1.company')
        },
        {
            quote: t('landing.testimonials.list.2.quote'),
            author: t('landing.testimonials.list.2.author'),
            role: t('landing.testimonials.list.2.role'),
            company: t('landing.testimonials.list.2.company')
        }
    ];

    return (
        <section className="relative py-24 bg-zinc-950">
            <div className="container max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">{t('landing.testimonials.badge')}</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {t('landing.testimonials.title')}
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        {t('landing.testimonials.description')}
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all"
                        >
                            <Quote className="h-8 w-8 text-zinc-700 mb-6" />
                            <p className="text-zinc-300 text-lg leading-relaxed mb-8">
                                "{item.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-semibold">
                                    {item.author.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{item.author}</div>
                                    <div className="text-sm text-zinc-500">{item.role}, {item.company}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trusted By Logos */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-20 pt-16 border-t border-zinc-800"
                >
                    <p className="text-center text-zinc-500 text-sm mb-10">{t('landing.testimonials.trusted_by')}</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
                        {['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen'].map((name, i) => (
                            <div
                                key={i}
                                className="text-white text-2xl font-bold tracking-tight hover:opacity-100 transition-opacity cursor-default"
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
