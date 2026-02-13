"use client";

import { motion } from "framer-motion";
import { Target, Users, Award, Globe, MapPin, Mail, Linkedin, CheckCircle, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CompanyPage() {
    const { t } = useLanguage();
    const stats = [
        { label: t('companyPage.founded'), value: "2015" },
        { label: t('companyPage.projects'), value: "200+" },
        { label: t('companyPage.nodes'), value: "48+" },
        { label: t('companyPage.operatives'), value: "1.2K" }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-24">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 mb-48"
                >
                    <div>
                        <span className="arch-label">{t('companyPage.label')}</span>
                        <h1 className="arch-heading">{t('companyPage.title')}</h1>
                    </div>
                </motion.div>

                {/* Narrative Section - Split Layout */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="grid lg:grid-cols-[1.5fr,1fr] gap-16 border-t border-white/5 pt-16"
                >
                    <div className="space-y-12">
                        <p className="text-2xl font-light text-zinc-400 leading-relaxed max-w-3xl">
                            {t('companyPage.philosophy')}
                        </p>
                        <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl">
                            {t('companyPage.narrative')}
                        </p>
                    </div>

                    <div className="space-y-8">
                        <span className="arch-label block">{t('companyPage.systems')}</span>
                        {[
                            { title: t('companyPage.networkTitle'), desc: t('companyPage.networkDesc') },
                            { title: t('companyPage.syncTitle'), desc: t('companyPage.syncDesc') }
                        ].map((item, idx) => (
                            <div key={idx} className="arch-detail-line">
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-zinc-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {stats.length > 0 && (
                    <div className="mt-64 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-16">
                        {stats.map((stat, idx) => (stat && (
                            <div key={idx}>
                                <span className="arch-label mb-4 block">{stat.label}</span>
                                <div className="text-5xl font-light text-white tracking-tighter">
                                    {stat.value}
                                </div>
                            </div>
                        )))}
                    </div>
                )}

                {/* CTA Context */}
                <div className="mt-64 text-center border-t border-white/5 pt-32 pb-16">
                    <span className="arch-label">{t('companyPage.nextPhase')}</span>
                    <h2 className="arch-heading italic mb-12">{t('companyPage.migrate')}</h2>
                    <Link href="/contact">
                        <button className="h-20 px-12 border border-white text-[10px] font-bold uppercase tracking-[0.8em] transition-all hover:bg-white hover:text-black">
                            {t('companyPage.contactArch')}
                        </button>
                    </Link>
                </div>
            </div>

            {/* Minimal Sub-footer */}
            <div className="border-t border-white/5 py-24">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[9px] font-bold tracking-[0.6em] text-zinc-800 uppercase">
                    <span>{t('companyPage.os')}</span>
                    <span>{t('companyPage.integrityVerified')}</span>
                </div>
            </div>
        </main >
    );
}
