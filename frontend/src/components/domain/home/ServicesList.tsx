"use client";

import { motion } from "framer-motion";
import { Ship, Globe, ShoppingBag, Laptop, Headset } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ServicesList() {
    const { t } = useLanguage();

    const services = [
        {
            icon: <Ship className="w-8 h-8" />,
            title: t('home.services_grid.shipping.title'),
            desc: t('home.services_grid.shipping.desc'),
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: t('home.services_grid.track.title'),
            desc: t('home.services_grid.track.desc'),
        },
        {
            icon: <ShoppingBag className="w-8 h-8" />,
            title: t('home.services_grid.marketplace.title'),
            desc: t('home.services_grid.marketplace.desc'),
        },
        {
            icon: <Laptop className="w-8 h-8" />,
            title: t('home.services_grid.tech.title'),
            desc: t('home.services_grid.tech.desc'),
        },
        {
            icon: <Headset className="w-8 h-8" />,
            title: t('home.services_grid.support.title'),
            desc: t('home.services_grid.support.desc'),
        }
    ];

    return (
        <section className="py-48 bg-black relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-32 relative group">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">GLOBAL_CAPABILITIES</span>
                    <h2 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter group-hover:italic transition-all duration-700">
                        Strategic_Assets.
                    </h2>
                    <div className="w-24 h-px bg-white/20 group-hover:w-48 transition-all duration-700" />
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {services.slice(0, 3).map((service, idx) => (
                        <ServiceCard key={idx} {...service} />
                    ))}
                </div>
                <div className="grid md:grid-cols-2 gap-12 mt-12 max-w-5xl mx-auto">
                    {services.slice(3).map((service, idx) => (
                        <ServiceCard key={idx} {...service} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ServiceCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-zinc-950/40 rounded-[48px] border border-white/5 p-12 hover:border-white/20 transition-all duration-700 group backdrop-blur-3xl">
            <div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500 mb-10">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">{title}</h3>
            <p className="text-sm text-white/40 leading-relaxed font-bold uppercase tracking-tight group-hover:text-white/60 transition-colors">
                {desc}
            </p>
        </div>
    );
}
