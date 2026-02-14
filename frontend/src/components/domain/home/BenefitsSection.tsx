"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2 } from "lucide-react";

export function BenefitsSection() {
    const { t } = useLanguage();

    const benefits = [
        {
            title: t('home.benefits_grid.all_in_one.title'),
            desc: t('home.benefits_grid.all_in_one.desc'),
            image: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=800",
            size: "large"
        },
        {
            title: t('home.benefits_grid.loyalty.title'),
            desc: t('home.benefits_grid.loyalty.desc'),
            image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
            size: "small"
        },
        {
            title: t('home.benefits_grid.easy_booking.title'),
            desc: t('home.benefits_grid.easy_booking.desc'),
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
            size: "medium"
        },
        {
            title: t('home.benefits_grid.support.title'),
            desc: t('home.benefits_grid.support.desc'),
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
            size: "medium"
        }
    ];

    return (
        <section className="py-48 bg-black relative">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="text-center mb-32 group">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">OPERATIONAL_EDGE</span>
                    <h2 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter group-hover:italic transition-all duration-700">
                        Global_Impact.
                    </h2>
                    <div className="w-24 h-px bg-white/20 mx-auto group-hover:w-48 transition-all duration-700" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* All in One - Large Left */}
                    <div className="lg:col-span-2 h-[600px]">
                        <BenefitCard benefit={benefits[0]} />
                    </div>
                    {/* Loyalty - Side */}
                    <div className="h-[600px]">
                        <BenefitCard benefit={benefits[1]} />
                    </div>
                    {/* Easy Booking & Support - Bottom Row */}
                    <div className="lg:col-span-1 h-[600px]">
                        <BenefitCard benefit={benefits[2]} />
                    </div>
                    <div className="lg:col-span-2 h-[600px]">
                        <BenefitCard benefit={benefits[3]} />
                    </div>
                </div>
            </div>
        </section>
    );
}

function BenefitCard({ benefit }: { benefit: any }) {
    return (
        <div className="relative rounded-[48px] overflow-hidden group h-full border border-white/5 hover:border-white/20 transition-all duration-700">
            <img
                src={benefit.image}
                alt={benefit.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute inset-0 p-12 flex flex-col justify-end">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 w-fit px-6 py-2 rounded-full mb-8">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">ENTERPRISE_NODE</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-none uppercase tracking-tighter">{benefit.title}</h3>
                <p className="text-[12px] font-bold text-white/40 leading-relaxed uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 max-w-xl">
                    {benefit.desc}
                </p>
            </div>

            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')] opacity-10 pointer-events-none" />
        </div>
    );
}
