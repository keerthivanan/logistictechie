"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, Plane, Package, Truck, Globe, Shield, Clock, DollarSign, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServicesPage() {
    const { t } = useLanguage();

    const services = [
        {
            icon: Ship,
            title: t('services.ocean.title'),
            description: t('services.ocean.desc'),
            features: [t('services.ocean.f1'), t('services.ocean.f2'), t('services.ocean.f3')],
            gradient: "from-white to-gray-400",
            bgGradient: "from-white/5 to-transparent"
        },
        {
            icon: Plane,
            title: t('services.air.title'),
            description: t('services.air.desc'),
            features: [t('services.air.f1'), t('services.air.f2'), t('services.air.f3')],
            gradient: "from-white to-gray-400",
            bgGradient: "from-white/5 to-transparent"
        },
        {
            icon: Truck,
            title: t('services.ground.title'),
            description: t('services.ground.desc'),
            features: [t('services.ground.f1'), t('services.ground.f2'), t('services.ground.f3')],
            gradient: "from-white to-gray-400",
            bgGradient: "from-white/5 to-transparent"
        },
        {
            icon: Package,
            title: t('services.warehouse.title'),
            description: t('services.warehouse.desc'),
            features: [t('services.warehouse.f1'), t('services.warehouse.f2'), t('services.warehouse.f3')],
            gradient: "from-white to-gray-400",
            bgGradient: "from-white/5 to-transparent"
        },
    ];

    const benefits = [
        { icon: Globe, title: t('services.benefits.global'), description: t('services.benefits.global_desc') },
        { icon: Shield, title: t('services.benefits.insurance'), description: t('services.benefits.insurance_desc') },
        { icon: Clock, title: t('services.benefits.support'), description: t('services.benefits.support_desc') },
        { icon: DollarSign, title: t('services.benefits.rates'), description: t('services.benefits.rates_desc') },
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            {/* Hero */}
            <section className="relative overflow-hidden mb-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-[0.3em] mb-8">
                            Global Operations
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase">
                            {t('services.hero_prefix')}{' '}
                            <span className="text-gray-500">
                                {t('services.hero_gradient')}
                            </span>{' '}
                            {t('services.hero_suffix')}
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                            {t('services.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container max-w-7xl mx-auto px-6 mb-32">
                <div className="grid md:grid-cols-2 gap-10">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Card className={`relative overflow-hidden rounded-[32px] bg-white/[0.02] border border-white/10 p-10 md:p-12 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 group h-full shadow-2xl`}>
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white text-black mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                                    <service.icon className="h-8 w-8" />
                                </div>

                                <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">
                                    {service.title}
                                </h2>

                                <p className="text-gray-500 leading-relaxed mb-8 text-lg font-light">
                                    {service.description}
                                </p>

                                <ul className="space-y-4 mb-10">
                                    {service.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-white font-bold uppercase tracking-widest text-[10px]">
                                            <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/quote">
                                    <Button className="bg-white text-black hover:bg-gray-200 h-14 px-8 rounded-xl font-black uppercase tracking-tighter text-base shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white">
                                        {t('common.getStarted')} <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Benefits */}
            <section className="container max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">{t('services.why_us')}</h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {benefits.map((b, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className="text-center group"
                        >
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-white mb-6 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-xl">
                                <b.icon className="h-8 w-8" />
                            </div>
                            <h4 className="font-black text-white mb-2 uppercase tracking-tighter text-lg italic">{b.title}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{b.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
