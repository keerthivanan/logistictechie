"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Target, Award, Globe, MapPin, Mail, Github, Rocket, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CompanyPage() {
    const { t } = useLanguage();

    const values = [
        { icon: Target, title: t('company.values.precision'), description: t('company.values.precision_desc'), gradient: "from-blue-500 to-cyan-400" },
        { icon: Users, title: t('company.values.transparency'), description: t('company.values.transparency_desc'), gradient: "from-purple-500 to-pink-400" },
        { icon: Award, title: t('company.values.excellence'), description: t('company.values.excellence_desc'), gradient: "from-amber-500 to-orange-400" },
        { icon: Globe, title: t('company.values.global'), description: t('company.values.global_desc'), gradient: "from-emerald-500 to-teal-400" },
    ];

    const stats = [
        { value: "50+", label: "Shipping Lines" },
        { value: "200+", label: "Countries" },
        { value: "10K+", label: "Daily Quotes" },
        { value: "99.9%", label: "Uptime" },
    ];

    return (
        <main className="min-h-screen bg-black pt-24 pb-20">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/15 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                            {t('company.title')}{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                {t('company.title_gradient')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            {t('company.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="container max-w-5xl mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {stats.map((stat, idx) => (
                        <div key={idx} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Mission Section */}
            <section className="container max-w-6xl mx-auto px-6 mb-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('company.mission_title')}</h2>
                        <div className="space-y-4 text-gray-400 leading-relaxed">
                            <p>{t('company.mission_text1')}</p>
                            <p>{t('company.mission_text2')}</p>
                            <p>{t('company.mission_text3')}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-blue-500/20 rounded-3xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <Rocket className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{t('company.platform_status')}</h3>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: t('company.status_items.searates') || "Freightos API", status: t('company.status_items.integrated') },
                                    { label: t('company.status_items.gmaps'), status: t('company.status_items.integrated') },
                                    { label: t('company.status_items.tracking'), status: t('company.status_items.ready') },
                                    { label: t('company.status_items.wizard'), status: t('company.status_items.complete') },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                        <span className="text-gray-300">{item.label}</span>
                                        <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                            <CheckCircle2 className="h-4 w-4" />
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="container max-w-6xl mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{t('company.values.title')}</h2>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-6">
                    {values.map((v, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                            <Card className="p-6 bg-white/[0.02] border-white/[0.05] text-center h-full hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group">
                                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${v.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                                    <v.icon className="h-6 w-6 text-white" />
                                </div>
                                <h4 className="font-semibold text-white mb-2">{v.title}</h4>
                                <p className="text-sm text-gray-500">{v.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact */}
            <section className="container max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Card className="p-10 bg-white/[0.02] border-white/[0.05] rounded-3xl">
                        <h2 className="text-2xl font-bold text-white text-center mb-10">{t('company.contact.title')}</h2>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                                    <MapPin className="h-7 w-7" />
                                </div>
                                <div className="font-semibold text-white mb-1">{t('company.contact.location')}</div>
                                <div className="text-sm text-gray-500">{t('company.contact.remote')}</div>
                            </div>
                            <div>
                                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                                    <Mail className="h-7 w-7" />
                                </div>
                                <div className="font-semibold text-white mb-1">{t('company.contact.email')}</div>
                                <div className="text-sm text-gray-500">contact@logitech.io</div>
                            </div>
                            <div>
                                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                                    <Github className="h-7 w-7" />
                                </div>
                                <div className="font-semibold text-white mb-1">{t('company.contact.opensource')}</div>
                                <div className="text-sm text-gray-500">{t('company.contact.view_github')}</div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </section>
        </main>
    );
}
