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
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">LEGAL_CORE</span>
                        <h1 className="arch-heading">{t('audit.termsEngage').split(' ')[0]} <br />{t('audit.termsEngage').split(' ').slice(1).join(' ')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            {t('legal.terms.intro')}
                        </p>
                    </div>
                </motion.div>

                {/* Structured Sections */}
                <div className="space-y-32">
                    {sections.map((section) => (
                        <div key={section.id} className="grid lg:grid-cols-[1fr,3fr] gap-32 border-t border-white/5 pt-32">
                            <div className="flex items-start gap-8">
                                <span className="arch-number">0{section.id}</span>
                                <h3 className="arch-label mt-4">{section.title}</h3>
                            </div>
                            <p className="text-3xl font-light text-zinc-500 leading-relaxed max-w-4xl italic">
                                "{section.content}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">PROTOCOL_V4.1.0</span>
                    <h2 className="arch-heading italic mb-16">{t('company.integrityVerified')}</h2>
                </div>
            </div>
        </main>
    );
}
