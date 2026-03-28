
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import {
    Ship, Plane, Warehouse, Anchor, BarChart,
    ArrowRight, CheckCircle, Clock, Zap, Globe, TrendingUp,
    FileCheck, Truck, Package, Activity
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useT } from '@/lib/i18n/t';

export default function ServicePage() {
    const params = useParams();
    const slug = params.slug as string;
    const t = useT();

    const services: Record<string, any> = {
        'ocean-freight': {
            title: t('service.ocean.title'),
            subtitle: t('service.ocean.subtitle'),
            icon: Ship,
            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop',
            desc: t('service.ocean.desc'),
            stats: [
                { label: t('service.ocean.stat1'), value: '50+' },
                { label: t('service.ocean.stat2'), value: '12k' },
                { label: t('service.ocean.stat3'), value: '98%' }
            ],
            features: [
                { title: t('service.ocean.feat1.title'), desc: t('service.ocean.feat1.desc'), icon: Globe },
                { title: t('service.ocean.feat2.title'), desc: t('service.ocean.feat2.desc'), icon: CheckCircle },
                { title: t('service.ocean.feat3.title'), desc: t('service.ocean.feat3.desc'), icon: FileCheck }
            ],
            workflow: [t('service.ocean.step1'), t('service.ocean.step2'), t('service.ocean.step3'), t('service.ocean.step4'), t('service.ocean.step5')],
            cta: t('service.ocean.cta'),
            ctaLink: '/search?mode=FCL'
        },
        'air-freight': {
            title: t('service.air.title'),
            subtitle: t('service.air.subtitle'),
            icon: Plane,
            image: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?q=80&w=3870&auto=format&fit=crop',
            desc: t('service.air.desc'),
            stats: [
                { label: t('service.air.stat1'), value: '250+' },
                { label: t('service.air.stat2'), value: '<24h' },
                { label: t('service.air.stat3'), value: '99.9%' }
            ],
            features: [
                { title: t('service.air.feat1.title'), desc: t('service.air.feat1.desc'), icon: Zap },
                { title: t('service.air.feat2.title'), desc: t('service.air.feat2.desc'), icon: Activity },
                { title: t('service.air.feat3.title'), desc: t('service.air.feat3.desc'), icon: Truck }
            ],
            workflow: [t('service.air.step1'), t('service.air.step2'), t('service.air.step3'), t('service.air.step4'), t('service.air.step5')],
            cta: t('service.air.cta'),
            ctaLink: '/search?mode=AIR'
        },
        'customs-compliance': {
            title: t('service.customs.title'),
            subtitle: t('service.customs.subtitle'),
            icon: CheckCircle,
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=3870&auto=format&fit=crop',
            desc: t('service.customs.desc'),
            stats: [
                { label: t('service.customs.stat1'), value: '<2h' },
                { label: t('service.customs.stat2'), value: '$15M+' },
                { label: t('service.customs.stat3'), value: '180+' }
            ],
            features: [
                { title: t('service.customs.feat1.title'), desc: t('service.customs.feat1.desc'), icon: FileCheck },
                { title: t('service.customs.feat2.title'), desc: t('service.customs.feat2.desc'), icon: TrendingUp },
                { title: t('service.customs.feat3.title'), desc: t('service.customs.feat3.desc'), icon: CheckCircle }
            ],
            workflow: [t('service.customs.step1'), t('service.customs.step2'), t('service.customs.step3'), t('service.customs.step4'), t('service.customs.step5')],
            cta: t('service.customs.cta'),
            ctaLink: '/tools/hs-codes'
        },
        'smart-warehousing': {
            title: t('service.warehouse.title'),
            subtitle: t('service.warehouse.subtitle'),
            icon: Warehouse,
            image: 'https://images.unsplash.com/photo-1589792923962-537704632910?q=80&w=3870&auto=format&fit=crop',
            desc: t('service.warehouse.desc'),
            stats: [
                { label: t('service.warehouse.stat1'), value: '500+' },
                { label: t('service.warehouse.stat2'), value: '2s' },
                { label: t('service.warehouse.stat3'), value: '99.99%' }
            ],
            features: [
                { title: t('service.warehouse.feat1.title'), desc: t('service.warehouse.feat1.desc'), icon: Zap },
                { title: t('service.warehouse.feat2.title'), desc: t('service.warehouse.feat2.desc'), icon: TrendingUp },
                { title: t('service.warehouse.feat3.title'), desc: t('service.warehouse.feat3.desc'), icon: Truck }
            ],
            workflow: [t('service.warehouse.step1'), t('service.warehouse.step2'), t('service.warehouse.step3'), t('service.warehouse.step4'), t('service.warehouse.step5')],
            cta: t('service.warehouse.cta'),
            ctaLink: '/signup'
        },
        'road-freight': {
            title: t('service.road.title'),
            subtitle: t('service.road.subtitle'),
            icon: Truck,
            image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=3870&auto=format&fit=crop',
            desc: t('service.road.desc'),
            stats: [
                { label: t('service.road.stat1'), value: '10k+' },
                { label: t('service.road.stat2'), value: '25k' },
                { label: t('service.road.stat3'), value: '97.5%' }
            ],
            features: [
                { title: t('service.road.feat1.title'), desc: t('service.road.feat1.desc'), icon: Zap },
                { title: t('service.road.feat2.title'), desc: t('service.road.feat2.desc'), icon: Package },
                { title: t('service.road.feat3.title'), desc: t('service.road.feat3.desc'), icon: Activity }
            ],
            workflow: [t('service.road.step1'), t('service.road.step2'), t('service.road.step3'), t('service.road.step4'), t('service.road.step5')],
            cta: t('service.road.cta'),
            ctaLink: '/search?mode=FTL'
        },
        'port-drayage': {
            title: t('service.port.title'),
            subtitle: t('service.port.subtitle'),
            icon: Anchor,
            image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=3870&auto=format&fit=crop',
            desc: t('service.port.desc'),
            stats: [
                { label: t('service.port.stat1'), value: '10k+' },
                { label: t('service.port.stat2'), value: '$40M' },
                { label: t('service.port.stat3'), value: '97%' }
            ],
            features: [
                { title: t('service.port.feat1.title'), desc: t('service.port.feat1.desc'), icon: Truck },
                { title: t('service.port.feat2.title'), desc: t('service.port.feat2.desc'), icon: Clock },
                { title: t('service.port.feat3.title'), desc: t('service.port.feat3.desc'), icon: Globe }
            ],
            workflow: [t('service.port.step1'), t('service.port.step2'), t('service.port.step3'), t('service.port.step4'), t('service.port.step5')],
            cta: t('service.port.cta'),
            ctaLink: '/tracking'
        },
        'supply-chain-tower': {
            title: t('service.tower.title'),
            subtitle: t('service.tower.subtitle'),
            icon: BarChart,
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3870&auto=format&fit=crop',
            desc: t('service.tower.desc'),
            stats: [
                { label: t('service.tower.stat1'), value: '1B+' },
                { label: t('service.tower.stat2'), value: '50+' },
                { label: t('service.tower.stat3'), value: '10x' }
            ],
            features: [
                { title: t('service.tower.feat1.title'), desc: t('service.tower.feat1.desc'), icon: Activity },
                { title: t('service.tower.feat2.title'), desc: t('service.tower.feat2.desc'), icon: TrendingUp },
                { title: t('service.tower.feat3.title'), desc: t('service.tower.feat3.desc'), icon: CheckCircle }
            ],
            workflow: [t('service.tower.step1'), t('service.tower.step2'), t('service.tower.step3'), t('service.tower.step4'), t('service.tower.step5')],
            cta: t('service.tower.cta'),
            ctaLink: '/dashboard'
        }
    };

    const service = services[slug];

    if (!service) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">{t('service.not.found')}</h1>
                    <Link href="/" className="text-blue-500 hover:underline">{t('service.return.home')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative bg-black min-h-screen flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white max-w-4xl mb-12 leading-[1.1] tracking-tighter mx-auto">
                        {service.subtitle}
                    </h1>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-12">
                        {service.stats.map((stat: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="text-3xl md:text-4xl font-bold text-white tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <Link href={service.ctaLink} className="inline-flex items-center px-7 py-3.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-colors text-sm">
                        {service.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* --- MAIN CONTENT & FEATURES --- */}
            <section className="py-24 relative bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">

                    <div className="grid md:grid-cols-2 gap-20 mb-32 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t('service.why.switch')}</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
                                {service.desc}
                            </p>
                        </div>
                        <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                            <NextImage src={service.image} fill className="object-cover" alt="Feature Visual" />
                        </div>
                    </div>

                    {/* --- FEATURE CARDS GRID --- */}
                    <div className={slug === 'ocean-freight' ? '' : 'mb-32'}>
                        {slug === 'ocean-freight' && (
                            <div className="mb-12 text-center">
                                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 mb-8">{t('service.intel.protocol')}</h2>
                            </div>
                        )}
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            {service.features.map((feature: any, i: number) => (
                                <div key={i} className="group space-y-4">
                                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                    <p className="text-zinc-500 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- WORKFLOW STEPS --- */}
                    <div className="border-t border-white/5 pt-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">{t('service.the.protocol')}</h2>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-6">
                            {service.workflow.map((step: string, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="px-8 py-4 rounded-full bg-black border border-white/10 text-white font-bold text-xs uppercase tracking-widest">
                                        <span className="text-blue-500 mr-2">{i + 1}.</span> {step}
                                    </div>
                                    {i < service.workflow.length - 1 && (
                                        <ArrowRight className="w-4 h-4 text-zinc-800" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">{t('service.upgrade.title')}</h2>
                    <p className="text-xl text-gray-400 mb-10">
                        {t('service.upgrade.sub')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all">
                            {t('service.upgrade.cta1')}
                        </Link>
                        <Link href="/contact" className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                            {t('service.upgrade.cta2')}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
