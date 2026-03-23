'use client';

import { Factory, Cog, ShoppingBag, Stethoscope, Car, Plane } from 'lucide-react';
import { useT } from '@/lib/i18n/t';

export default function TrustedIndustries() {
    const t = useT();

    const industries = [
        { name: t('industry.automotive'), icon: Car },
        { name: t('industry.pharma'), icon: Stethoscope },
        { name: t('industry.retail'), icon: ShoppingBag },
        { name: t('industry.manufacturing'), icon: Factory },
        { name: t('industry.aerospace'), icon: Plane },
        { name: t('industry.industrial'), icon: Cog },
    ];

    return (
        <section className="py-16 bg-black overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            {/* Label */}
            <p className="text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.25em] font-inter mb-10">
                {t('industries.label')}
            </p>

            {/* Marquee */}
            <div className="flex animate-infinite-scroll">
                {[...industries, ...industries, ...industries].map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2.5 text-zinc-500 hover:text-white transition-colors cursor-pointer whitespace-nowrap mx-10 group"
                    >
                        <item.icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold font-inter tracking-wide">{item.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
