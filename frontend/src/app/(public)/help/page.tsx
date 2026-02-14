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
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-64 group"
                >
                    <div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">{t('audit.support.assistance')}</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            Support <br /><span className="text-white/20 italic">Infrastructure.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl md:text-3xl font-bold text-white/40 leading-tight max-w-xl md:text-right md:ml-auto uppercase tracking-tighter opacity-80">
                            {t('help.hero.subtitle_part1')} <strong className="text-white">{t('help.hero.subtitle_highlight')}</strong> {t('help.hero.subtitle_part2')}
                        </p>
                    </div>
                </motion.div>

                {/* Structured Support Channels - High Density Tactical Grid */}
                <div className="grid lg:grid-cols-3 gap-0 border-y border-white/5 bg-zinc-950/20 backdrop-blur-3xl">
                    {supportChannels.map((channel, idx) => (
                        <div key={channel.id} className="p-10 md:p-20 border-r last:border-r-0 border-white/5 group hover:bg-white/[0.02] transition-all duration-700 relative overflow-hidden">
                            <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-all block mb-12 tabular-nums leading-none">0{channel.id}</span>
                            <div className="space-y-8 relative z-10">
                                <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">{channel.title}</h3>
                                <p className="text-[12px] font-bold tracking-[0.4em] text-white/30 uppercase leading-relaxed max-w-sm group-hover:text-white/60 transition-colors">{channel.desc}</p>
                                <div className="pt-12">
                                    <button className="h-16 px-12 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.6em] transition-all hover:bg-white hover:text-black rounded-full active:scale-95 shadow-2xl">
                                        {channel.link}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Matrix - Tactical Node Area */}
                <div className="mt-64 grid lg:grid-cols-[1fr,3fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <div className="space-y-16">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">FREQUENT_QUERIES</span>
                        <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.8] uppercase tracking-tighter group-hover:italic transition-all duration-700">Operational FAQ</h2>
                    </div>
                    <div className="space-y-8">
                        {faqs.map((i) => (
                            <div key={i} className="bg-zinc-950/20 rounded-[48px] border border-white/5 p-10 flex items-center justify-between group/line hover:bg-white/5 hover:border-white/20 transition-all duration-700 cursor-pointer backdrop-blur-3xl">
                                <div className="flex items-center gap-12">
                                    <span className="text-5xl font-black text-white/5 group-hover/line:text-white/10 transition-all tabular-nums leading-none">0{i + 1}</span>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.8em]">{t('audit.support.frequentOps')}</span>
                                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter group-hover/line:italic transition-all duration-500 leading-none">{t('help.faq.default_q')}</h4>
                                    </div>
                                </div>
                                <ArrowRight className="w-10 h-10 text-white/10 group-hover/line:text-white transition-all transform group-hover/line:translate-x-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">GLOBAL_SUPPORT_LAYER</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">{t('help.footer.always_integrated')}</h2>
                </div>
            </div>
        </main>
    );
}
