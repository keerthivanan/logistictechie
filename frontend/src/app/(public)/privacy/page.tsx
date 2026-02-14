"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
    const { t } = useLanguage();

    const protocols = [
        { id: "01", title: t('audit.privacy.p1_title'), content: t('audit.privacy.p1_desc') },
        { id: "02", title: t('audit.privacy.p2_title'), content: t('audit.privacy.p2_desc') },
        { id: "03", title: t('audit.privacy.p3_title'), content: t('audit.privacy.p3_desc') },
        { id: "04", title: t('audit.privacy.p4_title'), content: t('audit.privacy.p4_desc') },
        { id: "05", title: t('audit.privacy.p5_title'), content: t('audit.privacy.p5_desc') }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-64 group"
                >
                    <div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">SECURE_DATA_GOVERNANCE_PROTOCOL</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            {t('audit.privacyProtocols').split(' ')[0]} <br /><span className="text-white/20 italic">{t('audit.privacyProtocols').split(' ').slice(1).join(' ')}.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl md:text-4xl font-bold text-white/40 leading-tight max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('legal.privacy.subtitle')}
                        </p>
                    </div>
                </motion.div>

                {/* Structured Protocols - Tactical Grid */}
                <div className="space-y-16">
                    {protocols.map((section) => (
                        <div key={section.id} className="grid lg:grid-cols-[1fr,2fr] gap-16 md:gap-32 border-t border-white/5 pt-16 group/node hover:bg-white/[0.01] transition-all duration-700 p-8 rounded-[48px]">
                            <div className="flex items-start gap-12">
                                <span className="text-7xl font-black text-white/[0.03] group-hover/node:text-white/10 transition-colors tracking-tighter tabular-nums leading-none">{section.id}</span>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter group-hover/node:pl-4 group-hover/node:italic transition-all duration-700 leading-none mt-4">{section.title}</h3>
                            </div>
                            <p className="text-2xl md:text-4xl font-bold text-white/40 leading-[1.1] max-w-4xl italic group-hover/node:text-white transition-all duration-700">
                                "{section.content}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">PRIVACY_SHIELD_ENFORCED</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">{t('legal.privacy.title')}</h2>
                </div>
            </div>

            {/* Sub-footer Metric Array */}
            <div className="border-t border-white/5 py-32 bg-black">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-black tracking-[1.2em] text-white/5 uppercase">
                    <span>GOVERNANCE_SYNC_V4.1.0_CORE</span>
                    <span>© 2026 PHOENIX_GOVERNANCE_OS</span>
                </div>
            </div>
        </main>
    );
}
