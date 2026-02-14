"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
    const { t } = useLanguage();

    const sections = [
        { id: "01", title: t('audit.terms.s1_title'), content: t('audit.terms.s1_desc') },
        { id: "02", title: t('audit.terms.s2_title'), content: t('audit.terms.s2_desc') },
        { id: "03", title: t('audit.terms.s3_title'), content: t('audit.terms.s3_desc') },
        { id: "04", title: t('audit.terms.s4_title'), content: t('audit.terms.s4_desc') },
        { id: "05", title: t('audit.terms.s5_title'), content: t('audit.terms.s5_desc') }
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
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">LEGAL_FRAMEWORK_CORE_INFRASTRUCTURE</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            {t('audit.termsEngage').split(' ')[0]} <br /><span className="text-white/20 italic">{t('audit.termsEngage').split(' ').slice(1).join(' ')}.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl md:text-4xl font-bold text-white/40 leading-tight max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('legal.terms.intro')}
                        </p>
                    </div>
                </motion.div>

                {/* Structured Sections - Tactical Protocol Matrix */}
                <div className="space-y-16">
                    {sections.map((section) => (
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
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">PROTOCOL_V4.1.0_CERTIFIED</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">{t('company.integrityVerified')}</h2>
                </div>
            </div>

            {/* Sub-footer Metric Array */}
            <div className="border-t border-white/5 py-32 bg-black">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-black tracking-[1.2em] text-white/5 uppercase">
                    <span>LEGAL_SYNC_P7_STABLE</span>
                    <span>© 2026 PHOENIX_LEGAL_OS</span>
                </div>
            </div>
        </main>
    );
}
