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
            gradient: "from-gray-500 to-gray-400",
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
            gradient: "from-blue-500 to-cyan-400",
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
            gradient: "from-purple-500 to-pink-400",
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <span>Simple, transparent pricing</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                            {t('pricing.title')}{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                {t('pricing.title_gradient')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            {t('pricing.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-6 items-start">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={plan.highlight ? 'md:-mt-4' : ''}
                        >
                            <Card className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-300 h-full ${plan.highlight
                                    ? 'bg-gradient-to-b from-blue-600/20 to-black border-blue-500/50 shadow-2xl shadow-blue-500/10'
                                    : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
                                }`}>
                                {/* Popular Badge */}
                                {plan.highlight && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
                                )}

                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${plan.gradient} mb-6`}>
                                    <plan.icon className="h-6 w-6 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                                <div className="mb-8">
                                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                                    <span className="text-gray-500">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-300">
                                            <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-blue-400' : 'text-emerald-500'}`} />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/quote" className="block">
                                    <Button className={`w-full h-12 font-medium ${plan.highlight
                                            ? 'bg-white text-black hover:bg-gray-100'
                                            : 'bg-white/10 text-white hover:bg-white/20'
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
            <section className="container max-w-4xl mx-auto px-6 mt-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <p className="text-gray-500">
                        Have questions? {' '}
                        <Link href="/company" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Contact our team
                        </Link>
                    </p>
                </motion.div>
            </section>
        </main>
    );
}
