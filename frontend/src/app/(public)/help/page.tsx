"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { HelpCircle, MessageSquare, Phone, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
    const { t } = useLanguage();

    const supportChannels = [
        { id: "01", title: t('audit.support.knowledgeBase'), desc: t('help.channels.kb_desc'), link: "READ_DOCS" },
        { id: "02", title: t('audit.support.tacticalChat'), desc: t('help.channels.chat_desc'), link: "OPEN_LINK" },
        { id: "03", title: t('audit.support.voiceCall'), desc: t('help.channels.phone_desc'), link: "CALL_NOW" }
    ];

    const faqs = [0, 1, 2, 3];

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
                        <span className="arch-label mb-12 block">{t('audit.support.assistance')}</span>
                        <h1 className="arch-heading">{t('audit.supportInfrastructure').split(' ')[0]} <br />{t('audit.supportInfrastructure').split(' ').slice(1).join(' ')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            {t('help.hero.subtitle_part1')} <strong className="text-white">{t('help.hero.subtitle_highlight')}</strong> {t('help.hero.subtitle_part2')}
                        </p>
                    </div>
                </motion.div>

                {/* Structured Support Channels */}
                <div className="grid lg:grid-cols-3 gap-0 border-y border-white/5">
                    {supportChannels.map((channel, idx) => (
                        <div key={channel.id} className="p-16 border-r last:border-r-0 border-white/5 group hover:bg-zinc-950/20 transition-all duration-700">
                            <span className="arch-number text-zinc-900 group-hover:text-white transition-all block mb-12">{channel.id}</span>
                            <div className="space-y-8">
                                <h3 className="text-3xl font-light text-white uppercase italic tracking-tighter">{channel.title}</h3>
                                <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase leading-loose">{channel.desc}</p>
                                <div className="pt-8">
                                    <button className="h-16 px-8 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white hover:text-black">
                                        {channel.link}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Matrix */}
                <div className="mt-96 grid lg:grid-cols-[1fr,2fr] gap-32 border-t border-white/5 pt-32">
                    <div>
                        <span className="arch-label mb-12 block">QUERIES</span>
                        <h2 className="text-5xl font-light text-white leading-tight">{t('audit.support.frequentOps').split(' ')[0]} <br />{t('audit.support.frequentOps').split(' ').slice(1).join(' ')}</h2>
                        <div className="arch-detail-line h-48 opacity-20 hidden lg:block" />
                    </div>
                    <div className="space-y-4">
                        {faqs.map((i) => (
                            <div key={i} className="arch-detail-line group flex items-center justify-between cursor-pointer hover:pl-12 transition-all duration-700 py-8">
                                <div className="space-y-2">
                                    <span className="arch-label text-zinc-800">QUESTION_0{i + 1}</span>
                                    <h4 className="text-2xl font-light text-white italic group-hover:text-white">{t('help.faq.default_q')}</h4>
                                </div>
                                <ArrowRight className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">GLOBAL_SUPPORT</span>
                    <h2 className="arch-heading italic mb-16">{t('help.footer.always_integrated')}</h2>
                </div>
            </div>
        </main>
    );
}
