"use client";

import { motion, Variants } from "framer-motion";
import { Ship, Plane, Package, Truck, Globe, Shield, Clock, DollarSign, ArrowRight, Check, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServicesPage() {
    const { t } = useLanguage();

    const mainServices = [
        {
            id: "01",
            title: t('servicesPage.items.ocean'),
            desc: t('servicesPage.tacticalDesc'),
            details: t('servicesPage.items.oceanDetails')
        },
        {
            id: "02",
            title: t('servicesPage.items.aerial'),
            desc: t('servicesPage.items.aerialDesc'),
            details: t('servicesPage.items.aerialDetails')
        },
        {
            id: "03",
            title: t('servicesPage.items.ground'),
            desc: t('servicesPage.items.groundDesc'),
            details: t('servicesPage.items.groundDetails')
        },
        {
            id: "04",
            title: t('servicesPage.items.warehouse'),
            desc: t('servicesPage.items.warehouseDesc'),
            details: t('servicesPage.items.warehouseDetails')
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-24">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-32"
                >
                    <span className="arch-label">{t('servicesPage.label')}</span>
                    <h1 className="arch-heading">{t('servicesPage.title')}</h1>
                </motion.div>

                {/* Service Grid - Numbered Pattern */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 gap-x-16 gap-y-24 border-t border-white/5 pt-16"
                >
                    {mainServices.map((service) => (
                        <motion.div key={service.id} variants={itemVariants} className="group cursor-default">
                            <div className="flex items-start gap-6">
                                <span className="arch-number">{service.id}</span>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-light text-white uppercase tracking-tight group-hover:pl-4 transition-all duration-700">
                                        {service.title}
                                    </h2>
                                    <p className="text-lg leading-relaxed text-zinc-500 max-w-md group-hover:text-zinc-300 transition-colors duration-700">
                                        {service.desc}
                                    </p>
                                    <div className="arch-detail-line">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                                            {service.details}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Technical Advantage Section */}
                <div className="mt-64">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2 }}
                        className="grid lg:grid-cols-2 gap-16 items-start"
                    >
                        <div>
                            <span className="arch-label">{t('servicesPage.approach')}</span>
                            <h2 className="text-5xl font-light text-white mb-12 leading-tight">{t('servicesPage.tacticalAdvantage')}</h2>
                            <p className="text-lg text-zinc-500 max-w-lg mb-12 leading-relaxed">
                                {t('servicesPage.tacticalDesc')}
                            </p>
                            <Link href="/quote">
                                <button className="h-20 px-12 border border-white text-[10px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-white hover:text-black">
                                    {t('servicesPage.initMission')}
                                </button>
                            </Link>
                        </div>

                        <div className="space-y-12 py-8">
                            {[
                                { title: "Research", desc: "Deep understanding of context, culture, and climate." },
                                { title: "Collaboration", desc: "Close partnership with clients, engineers, and craftspeople." },
                                { title: "Innovation", desc: "Sustainable materials and forward-thinking design solutions." }
                            ].map((item, idx) => (
                                <div key={idx} className="arch-detail-line">
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-zinc-500 text-sm max-w-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Minimal Sub-footer */}
            <div className="border-t border-white/5 py-24">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[9px] font-bold tracking-[0.6em] text-zinc-800 uppercase">
                    <span>{t('servicesPage.operations')}</span>
                    <span>{t('servicesPage.stable')}</span>
                </div>
            </div>
        </main >
    );
}
