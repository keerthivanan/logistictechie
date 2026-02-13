"use client";

import { motion } from "framer-motion";
import { Package, Globe, ShieldCheck, Zap, Cpu, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
    {
        title: "home.bento.schedules.title",
        description: "home.bento.schedules.desc",
        icon: Globe,
        color: "zinc-900",
        size: "md:col-span-2 md:row-span-2",
        href: "/schedules"
    },
    {
        title: "home.bento.analytics.title",
        description: "home.bento.analytics.desc",
        icon: BarChart3,
        color: "zinc-900",
        size: "md:col-span-1 md:row-span-1",
        href: "/market"
    },
    {
        title: "home.bento.docs.title",
        description: "home.bento.docs.desc",
        icon: ShieldCheck,
        color: "zinc-950",
        size: "md:col-span-1 md:row-span-1",
        href: "/services"
    },
    {
        title: "home.bento.priority.title",
        description: "home.bento.priority.desc",
        icon: Zap,
        color: "white",
        textColor: "black",
        size: "md:col-span-2 md:row-span-1",
        href: "/quote"
    }
];

export function BentoServices() {
    const { t } = useLanguage();
    return (
        <section className="py-24 bg-black">
            <div className="container max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase italic">
                        {t('home.bento.title')} <span className="text-zinc-800">{t('home.bento.subtitle')}</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`min-h-[300px] ${cat.size} ${cat.color === 'white' ? 'bg-white text-black' : 'bg-zinc-950 border border-white/5 holographic-glow'} p-8 md:p-12 group relative overflow-hidden flex flex-col justify-end rounded-none hover:border-white/20 transition-all`}
                        >
                            <div className={`absolute top-12 left-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12`}>
                                <cat.icon className={`h-12 w-12 ${cat.color === 'white' ? 'text-black' : 'text-emerald-500'}`} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-black uppercase italic mb-3 tracking-tighter leading-none">{t(cat.title)}</h3>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${cat.color === 'white' ? 'text-zinc-500' : 'text-zinc-700'}`}>{t(cat.description)}</p>
                            </div>

                            <Link href={cat.href} className="absolute inset-0 z-10" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
