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
        <section className="relative py-32 bg-black border-t border-white/5">
            <div className="container max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase italic leading-none">
                        The Verdict. <span className="text-zinc-800">Industry Standard.</span>
                    </h2>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {testimonials.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative group pt-10"
                        >
                            <Quote className="absolute top-0 left-0 h-10 w-10 text-zinc-900 -z-10" />
                            <p className="text-zinc-400 text-2xl font-bold uppercase italic leading-tight mb-8 tracking-tighter">
                                "{item.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-0.5 w-8 bg-emerald-500" />
                                <div>
                                    <div className="font-black text-white uppercase text-[10px] tracking-widest">{item.author}</div>
                                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{item.role}, {item.company}</div>
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
