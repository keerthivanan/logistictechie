"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Target, Award, Globe, MapPin, Mail, Github, Rocket, CheckCircle2 } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

export default function CompanyPage() {
    const { t } = useLanguage();

    const values = [
        { icon: Target, title: t('company.values.precision'), description: t('company.values.precision_desc'), gradient: "bg-white text-black" },
        { icon: Users, title: t('company.values.transparency'), description: t('company.values.transparency_desc'), gradient: "bg-white text-black" },
        { icon: Award, title: t('company.values.excellence'), description: t('company.values.excellence_desc'), gradient: "bg-white text-black" },
        { icon: Globe, title: t('company.values.global'), description: t('company.values.global_desc'), gradient: "bg-white text-black" },
    ];

    const stats = [
        { value: "50+", label: "Shipping Lines" },
        { value: "200+", label: "Countries" },
        { value: "10K+", label: "Daily Quotes" },
        { value: "99.9%", label: "Uptime" },
    ];

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 bg-mesh-dark">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-[0.3em] mb-8 holographic-glow">
                            System Identity
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic">
                            {t('company.title')}{' '}
                            <span className="text-gray-500 not-italic">
                                {t('company.title_gradient')}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed mb-10">
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
                        <div key={idx} className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/10 ultra-card transition-all hover:scale-105">
                            <div className="text-5xl font-black text-white mb-2 tracking-tighter italic">{stat.value}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">{stat.label}</div>
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
                        <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">{t('company.mission_title')}</h2>
                        <div className="space-y-6 text-gray-500 font-medium leading-relaxed">
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
                        <Card className="p-10 bg-white/[0.03] border border-white/10 rounded-[40px] ultra-card relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.05] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center gap-6 mb-10">
                                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
                                    <Rocket className="h-8 w-8 text-black" />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{t('company.platform_status')}</h3>
                            </div>

                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: t('company.status_items.searates') || "Multi-Carrier API", status: t('company.status_items.integrated') },
                                    { label: t('company.status_items.gmaps'), status: t('company.status_items.integrated') },
                                    { label: t('company.status_items.tracking'), status: t('company.status_items.ready') },
                                    { label: t('company.status_items.wizard'), status: t('company.status_items.complete') },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:pl-2 transition-all group">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs group-hover:text-white transition-colors">{item.label}</span>
                                        <span className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.05] px-4 py-2 rounded-full border border-white/10">
                                            <CheckCircle2 className="h-3 w-3" />
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
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{t('company.values.title')}</h2>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-8">
                    {values.map((v, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                            <Card className="p-10 bg-white/[0.02] border border-white/10 text-center h-full hover:bg-white/[0.05] transition-all group ultra-card rounded-[32px]">
                                <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl ${v.gradient} mb-8 group-hover:rotate-[360deg] transition-all duration-700 shadow-2xl`}>
                                    <v.icon className="h-8 w-8" />
                                </div>
                                <h4 className="font-black text-white mb-4 uppercase tracking-tighter text-xl">{v.title}</h4>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">{v.description}</p>
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
