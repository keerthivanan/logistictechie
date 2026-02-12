"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
    const { t } = useLanguage();

    const transmissionDetails = [
        { key: "strategicHub", desc: t('contact.strategicHubDesc'), link: t('contact.viewMap') },
        { key: "secureTransmission", desc: t('contact.secureTransmissionDesc'), link: t('contact.sendMail') },
        { key: "voiceLink", desc: t('contact.voiceLinkDesc'), link: t('contact.callNow') }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-48"
                >
                    <span className="arch-label mb-12 block">{t('contact.label')}</span>
                    <h1 className="arch-heading">{t('contact.title')}</h1>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-32 border-t border-white/5 pt-32">

                    {/* Left Side - Transmission Details */}
                    <div className="space-y-32">
                        <div className="space-y-12">
                            <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl">
                                {t('contact.missionCritical')}
                            </p>
                        </div>

                        <div className="space-y-16">
                            {transmissionDetails.map((item, idx) => (
                                <div key={idx} className="arch-detail-line group flex items-start justify-between cursor-pointer">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{t(`contact.${item.key}`)}</h3>
                                        <p className="text-zinc-500 max-w-sm">{item.desc}</p>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-800 group-hover:text-white transition-colors">{item.link}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Transmission Form */}
                    <div className="p-16 bg-zinc-950/20 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none italic text-4xl">SECURE_LINK</div>
                        <h2 className="text-4xl font-light text-white mb-16 uppercase tracking-tight">{t('contact.form.title')}</h2>
                        <form className="space-y-10">
                            <div className="space-y-4">
                                <label className="arch-label">{t('contact.form.name')}</label>
                                <Input
                                    placeholder={t('contact.form.placeholderName')}
                                    className="h-20 bg-transparent border-b border-white/5 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-xl font-light italic"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="arch-label">{t('contact.form.email')}</label>
                                <Input
                                    placeholder={t('contact.form.placeholderEmail')}
                                    className="h-20 bg-transparent border-b border-white/5 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-xl font-light italic"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="arch-label">{t('contact.form.message')}</label>
                                <Textarea
                                    placeholder={t('contact.form.placeholderMsg')}
                                    className="min-h-[200px] bg-transparent border-b border-white/5 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-xl font-light italic resize-none"
                                />
                            </div>
                            <button className="w-full h-24 bg-white text-black font-bold uppercase tracking-[0.8em] text-[12px] transition-all hover:bg-zinc-200">
                                {t('contact.form.submit')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* FAQ / Secondary Matrix */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">{t('contact.globalSync')}</span>
                    <h2 className="arch-heading mb-16 italic">{t('contact.globalBase')}</h2>
                    <div className="grid md:grid-cols-3 gap-16 text-left max-w-4xl mx-auto mt-24">
                        {[
                            { id: "01", title: "London Hub", city: "United Kingdom" },
                            { id: "02", title: "Dubai Node", city: "UAE" },
                            { id: "03", title: "Singapore Unit", city: "Singapore" }
                        ].map((hub) => (
                            <div key={hub.id} className="arch-detail-line">
                                <span className="arch-number block mb-4">{hub.id}</span>
                                <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{hub.title}</h4>
                                <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-800 uppercase">{hub.city}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sub-footer Section */}
            <div className="border-t border-white/5 py-32">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-900 uppercase">
                    <span>{t('contact.encryptionActive')}</span>
                    <span>© 2026 PHOENIX_OS</span>
                </div>
            </div>
        </main>
    );
}
