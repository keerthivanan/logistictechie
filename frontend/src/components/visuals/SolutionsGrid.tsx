'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { Ship, Plane, Box, Warehouse, Anchor, Globe, BarChart, FileCheck, ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n/t';

export default function SolutionsGrid() {
    const t = useT()

    const solutions = [
        {
            icon: Ship,
            title: t('sol.ocean.title'),
            desc: t('sol.ocean.desc'),
            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop',
            href: '/services/ocean-freight'
        },
        {
            icon: Plane,
            title: t('sol.air.title'),
            desc: t('sol.air.desc'),
            image: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?q=80&w=3870&auto=format&fit=crop',
            href: '/services/air-freight'
        },
        {
            icon: FileCheck,
            title: t('sol.customs.title'),
            desc: t('sol.customs.desc'),
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=3870&auto=format&fit=crop',
            href: '/services/customs-compliance'
        },
        {
            icon: Warehouse,
            title: t('sol.warehouse.title'),
            desc: t('sol.warehouse.desc'),
            image: 'https://images.unsplash.com/photo-1589792923962-537704632910?q=80&w=3870&auto=format&fit=crop',
            href: '/services/smart-warehousing'
        },
        {
            icon: Anchor,
            title: t('sol.drayage.title'),
            desc: t('sol.drayage.desc'),
            image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=3870&auto=format&fit=crop',
            href: '/services/port-drayage'
        },
        {
            icon: BarChart,
            title: t('sol.supply.title'),
            desc: t('sol.supply.desc'),
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3870&auto=format&fit=crop',
            href: '/services/supply-chain-tower'
        }
    ]

    return (
        <section className="py-32 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight font-outfit">{t('sol.title')}</h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-sm font-inter">
                        {t('sol.sub')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {solutions.map((item, i) => (
                        <Link href={item.href} key={i} className="group h-[400px] relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 block">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <NextImage
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-50"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            </div>

                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                    <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-white/80 transition-colors tracking-tight font-outfit">{item.title}</h3>
                                    <p className="text-zinc-400 leading-relaxed text-sm opacity-80 group-hover:opacity-100 transition-all duration-300">
                                        {item.desc}
                                    </p>

                                    <div className="mt-8 flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        {t('sol.learn')} <ArrowRight className="ml-2 w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
