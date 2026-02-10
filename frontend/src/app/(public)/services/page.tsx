"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Ship, Plane, Package, Truck, Globe, Shield, Clock, DollarSign, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServicesPage() {
    const { t } = useLanguage();

    const services = [
        {
            icon: Ship,
            title: "Ocean Freight",
            description: "Full container and LCL shipping solutions with competitive rates from leading carriers worldwide.",
            features: ["FCL & LCL Options", "Door-to-Door Service", "Real-Time Tracking"],
        },
        {
            icon: Plane,
            title: "Air Freight",
            description: "Express and standard air cargo services for time-sensitive shipments to any destination.",
            features: ["Express Delivery", "Charter Services", "Temperature Control"],
        },
        {
            icon: Truck,
            title: "Ground Transport",
            description: "Reliable trucking and rail solutions for first and last mile delivery across continents.",
            features: ["FTL & LTL Options", "Cross-Border", "Multi-Modal"],
        },
        {
            icon: Package,
            title: "Warehousing",
            description: "Strategic warehouse locations with inventory management and distribution services.",
            features: ["Inventory Management", "Pick & Pack", "Distribution"],
        },
    ];

    const benefits = [
        {
            icon: Globe,
            title: "Global Network",
            description: "Access to 200+ ports and airports worldwide with local expertise in every market."
        },
        {
            icon: Shield,
            title: "Cargo Insurance",
            description: "Comprehensive coverage options to protect your shipments from origin to destination."
        },
        {
            icon: Clock,
            title: "24/7 Support",
            description: "Dedicated team available around the clock to assist with your logistics needs."
        },
        {
            icon: DollarSign,
            title: "Best Rates",
            description: "Competitive pricing through our volume agreements with major carriers."
        },
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            {/* Hero Section */}
            <section className="container max-w-5xl mx-auto px-6 text-center mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">Our Services</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        End-to-End Logistics Solutions
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        From ocean freight to last-mile delivery, we provide comprehensive shipping
                        services tailored to your business needs.
                    </p>
                </motion.div>
            </section>

            {/* Services Grid */}
            <section className="container max-w-7xl mx-auto px-6 mb-24">
                <div className="grid md:grid-cols-2 gap-6">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all group"
                        >
                            <div className="h-14 w-14 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                                <service.icon className="h-7 w-7" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-4">{service.title}</h2>
                            <p className="text-zinc-400 mb-6 leading-relaxed">{service.description}</p>

                            <ul className="space-y-3 mb-8">
                                {service.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/quote">
                                <Button className="bg-white text-black hover:bg-zinc-100 rounded-lg h-12 px-6 font-semibold transition-all">
                                    Get Quote <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="container max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">Why Choose Us</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        The Phoenix Advantage
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {benefits.map((b, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="text-center"
                        >
                            <div className="h-14 w-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <b.icon className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-white mb-2">{b.title}</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">{b.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
