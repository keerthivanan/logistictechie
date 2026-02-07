"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PricingPage() {
    const { t } = useLanguage();

    const plans = [
        {
            name: t('pricing.plans.starter.name'),
            description: t('pricing.plans.starter.desc'),
            price: t('pricing.plans.starter.price'),
            period: "",
            icon: Zap,
            gradient: "from-white to-gray-400",
            features: [
                t('pricing.features.shipments_5'),
                t('pricing.features.tracking_basic'),
                t('pricing.features.support_email'),
                t('pricing.features.carriers_std'),
            ],
            cta: t('pricing.plans.starter.cta'),
            highlight: false,
        },
        {
            name: t('pricing.plans.professional.name'),
            description: t('pricing.plans.professional.desc'),
            price: t('pricing.plans.professional.price'),
            period: "/month",
            icon: Shield,
            gradient: "from-white to-gray-400",
            features: [
                t('pricing.features.shipments_unlimited'),
                t('pricing.features.tracking_gps'),
                t('pricing.features.support_priority'),
                t('pricing.features.api_carrier'),
                t('pricing.features.invoicing'),
                t('pricing.features.api_access'),
            ],
            cta: t('pricing.plans.professional.cta'),
            highlight: true,
        },
        {
            name: t('pricing.plans.enterprise.name'),
            description: t('pricing.plans.enterprise.desc'),
            price: t('pricing.plans.enterprise.price'),
            period: "",
            icon: Crown,
            gradient: "from-white to-gray-400",
            features: [
                t('pricing.features.pro_features'),
                t('pricing.features.manager'),
                t('pricing.features.integrations'),
                t('pricing.features.sla'),
                t('pricing.features.volume'),
                t('pricing.features.whitelabel'),
            ],
            cta: t('pricing.plans.enterprise.cta'),
            highlight: false,
        },
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 bg-mesh-dark">
            {/* Hero */}
            <section className="relative overflow-hidden mb-20">
                {/* Holographic scanner effect */}
                <motion.div
                    animate={{ y: [0, 600, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 z-10 pointer-events-none"
                />

                <div className="container relative z-10 max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-[0.3em] mb-8 holographic-glow">
                            Value Logic Protocols
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic">
                            {t('pricing.title')}{' '}
                            <span className="text-gray-500 not-italic">
                                {t('pricing.title_gradient')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                            {t('pricing.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container max-w-7xl mx-auto px-6 mb-32">
                <div className="grid md:grid-cols-3 gap-10 items-stretch">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={plan.highlight ? 'md:-mt-8' : ''}
                        >
                            <Card className={`relative overflow-hidden rounded-[40px] p-12 transition-all duration-700 h-full shadow-2xl ultra-card ${plan.highlight
                                ? 'bg-white/[0.04] border-white/40 scale-105 z-10 iridescent-border'
                                : 'bg-white/[0.02] border-white/10'
                                }`}>

                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white text-black mb-10 shadow-2xl`}>
                                    <plan.icon className="h-8 w-8" />
                                </div>

                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">{plan.name}</h3>
                                <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest font-bold">{plan.description}</p>

                                <div className="mb-10">
                                    <span className="text-6xl font-black text-white tracking-tighter italic">{plan.price}</span>
                                    <span className="text-gray-500 uppercase tracking-widest text-xs font-bold ml-2">{plan.period}</span>
                                </div>

                                <ul className="space-y-5 mb-12">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-4 text-white font-bold uppercase tracking-widest text-[10px]">
                                            <div className="h-2 w-2 bg-white rounded-full mt-1 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/quote" className="block mt-auto">
                                    <Button className={`w-full h-16 font-black uppercase tracking-tighter text-lg rounded-2xl transition-all duration-500 shadow-2xl ${plan.highlight
                                        ? 'bg-white text-black hover:bg-gray-100 hover:scale-105'
                                        : 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-black'
                                        }`}>
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FAQ Teaser */}
            <section className="container max-w-4xl mx-auto px-6 mt-20 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">
                        Need an customized Enterprise solution? {' '}
                        <Link href="/company" className="text-white hover:underline transition-all">
                            Executive Advisory →
                        </Link>
                    </p>
                </motion.div>
            </section>
        </main>
    );
}
