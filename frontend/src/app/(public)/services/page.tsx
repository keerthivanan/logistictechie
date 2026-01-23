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
            gradient: "from-blue-500 to-cyan-400",
            bgGradient: "from-blue-500/20 to-cyan-500/5"
        },
        {
            icon: Plane,
            title: t('services.air.title'),
            description: t('services.air.desc'),
            features: [t('services.air.f1'), t('services.air.f2'), t('services.air.f3')],
            gradient: "from-purple-500 to-pink-400",
            bgGradient: "from-purple-500/20 to-pink-500/5"
        },
        {
            icon: Truck,
            title: t('services.ground.title'),
            description: t('services.ground.desc'),
            features: [t('services.ground.f1'), t('services.ground.f2'), t('services.ground.f3')],
            gradient: "from-amber-500 to-orange-400",
            bgGradient: "from-amber-500/20 to-orange-500/5"
        },
        {
            icon: Package,
            title: t('services.warehouse.title'),
            description: t('services.warehouse.desc'),
            features: [t('services.warehouse.f1'), t('services.warehouse.f2'), t('services.warehouse.f3')],
            gradient: "from-emerald-500 to-teal-400",
            bgGradient: "from-emerald-500/20 to-teal-500/5"
        },
    ];

    const benefits = [
        { icon: Globe, title: t('services.benefits.global'), description: t('services.benefits.global_desc') },
        { icon: Shield, title: t('services.benefits.insurance'), description: t('services.benefits.insurance_desc') },
        { icon: Clock, title: t('services.benefits.support'), description: t('services.benefits.support_desc') },
        { icon: DollarSign, title: t('services.benefits.rates'), description: t('services.benefits.rates_desc') },
    ];

    return (
        <main className="min-h-screen bg-black pt-24 pb-20">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/15 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                            {t('services.hero_prefix')}{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                {t('services.hero_gradient')}
                            </span>{' '}
                            {t('services.hero_suffix')}
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            {t('services.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container max-w-7xl mx-auto px-6 mb-24">
                <div className="grid md:grid-cols-2 gap-6">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Card className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${service.bgGradient} border border-white/[0.08] p-8 md:p-10 transition-all duration-300 hover:border-white/20 group h-full`}>
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${service.gradient} mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <service.icon className="h-7 w-7 text-white" />
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                                    {service.title}
                                </h2>

                                <p className="text-gray-400 leading-relaxed mb-6">
                                    {service.description}
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {service.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300">
                                            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/quote">
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 group-hover:border-white/40">
                                        {t('common.getStarted')} <ArrowRight className="ml-2 h-4 w-4" />
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
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('services.why_us')}</h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {benefits.map((b, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className="text-center p-6"
                        >
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                                <b.icon className="h-7 w-7" />
                            </div>
                            <h4 className="font-semibold text-white mb-2">{b.title}</h4>
                            <p className="text-sm text-gray-500">{b.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
