"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const plans = [
        {
            name: "Starter",
            description: "Perfect for small businesses getting started with freight",
            price: "Free",
            period: "",
            icon: Zap,
            features: [
                "Up to 5 shipments per month",
                "Basic container tracking",
                "Email support",
                "Standard carrier rates",
            ],
            cta: "Get Started",
            highlight: false,
        },
        {
            name: "Professional",
            description: "For growing businesses with regular shipping needs",
            price: "$199",
            period: "/month",
            icon: Shield,
            features: [
                "Unlimited shipments",
                "Real-time GPS tracking",
                "Priority support (24/7)",
                "Multi-carrier rate comparison",
                "Automated invoicing",
                "API access",
            ],
            cta: "Start Free Trial",
            highlight: true,
        },
        {
            name: "Enterprise",
            description: "Custom solutions for large-scale operations",
            price: "Custom",
            period: "",
            icon: Crown,
            features: [
                "Everything in Professional",
                "Dedicated account manager",
                "Custom integrations",
                "99.9% SLA guarantee",
                "Volume discounts",
                "White-label options",
            ],
            cta: "Contact Sales",
            highlight: false,
        },
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            {/* Header */}
            <section className="container max-w-5xl mx-auto px-6 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">Pricing</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Choose the plan that fits your business. No hidden fees, cancel anytime.
                    </p>
                </motion.div>
            </section>

            {/* Pricing Cards */}
            <section className="container max-w-6xl mx-auto px-6 mb-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`relative rounded-xl p-8 flex flex-col ${plan.highlight
                                ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-white'
                                : 'bg-zinc-900/50 border border-zinc-800'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-semibold rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${plan.highlight ? 'bg-white text-black' : 'bg-zinc-800'
                                    }`}>
                                    <plan.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-zinc-500 text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                            </div>

                            <div className="flex-1 mb-8">
                                <div className="text-sm font-medium text-zinc-400 mb-4">What&apos;s included:</div>
                                <ul className="space-y-3">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm">
                                            <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link href="/quote">
                                <Button className={`w-full h-12 rounded-lg font-semibold transition-all ${plan.highlight
                                    ? 'bg-white text-black hover:bg-zinc-100'
                                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                    }`}>
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Enterprise CTA */}
            <section className="container max-w-3xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center"
                >
                    <h3 className="text-xl font-semibold text-white mb-2">Need a custom solution?</h3>
                    <p className="text-zinc-400 mb-6">
                        Contact our sales team to discuss enterprise pricing and custom integrations.
                    </p>
                    <Link href="/company">
                        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg h-10 px-6">
                            Contact Sales Team
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </main>
    );
}
