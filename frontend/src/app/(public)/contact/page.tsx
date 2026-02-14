"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Send, Mail, Phone, MapPin, Activity, ShieldCheck, Globe, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactPage() {
    const { t } = useLanguage();

    const transmissionDetails = [
        { key: "strategicHub", desc: t('contact.strategicHubDesc'), link: t('contact.viewMap'), icon: MapPin },
        { key: "secureTransmission", desc: t('contact.secureTransmissionDesc'), link: t('contact.sendMail'), icon: Mail },
        { key: "voiceLink", desc: t('contact.voiceLinkDesc'), link: t('contact.callNow'), icon: Phone }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48 flex-1">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">COMMUNICATIONS_INTERFACE</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                            {t('contact.title')} <br />
                            <span className="text-white/20 select-none">Node.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white/40 leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('contact.missionCritical')}
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr,1.2fr] gap-24 md:gap-48 border-t-2 border-white/10 pt-32 relative">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

                    {/* Left Side - Transmission Details - Tactical Grid */}
                    <div className="space-y-32 relative z-10">
                        <div className="space-y-12">
                            <div className="flex items-center gap-8 mb-8">
                                <div className="w-16 h-[2px] bg-white/40" />
                                <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.8em] italic">DIRECT_LINK_CHANNELS</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] uppercase tracking-tighter group hover:italic transition-all duration-700 underline decoration-white/10 underline-offset-[16px]">
                                Establish connection with the Strategic Infrastructure Node.
                            </h2>
                        </div>

                        <div className="space-y-16">
                            {transmissionDetails.map((item, idx) => (
                                <div key={idx} className="pb-16 border-2 border-white/10 group bg-zinc-950/40 p-12 rounded-[64px] hover:border-white/30 transition-all cursor-pointer backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-all rotate-12">
                                        <item.icon className="w-48 h-48 text-white" />
                                    </div>
                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter group-hover:italic transition-all">{t(`contact.${item.key}`)}</h3>
                                        <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                                            <span className="text-[10px] font-black tracking-[0.6em] text-white/60 group-hover:text-white transition-all uppercase italic">{item.link}</span>
                                        </div>
                                    </div>
                                    <p className="text-[14px] font-black text-white/40 uppercase tracking-widest leading-relaxed max-w-sm group-hover:text-white/70 transition-colors italic relative z-10">{item.desc}</p>
                                    <div className="mt-8 flex items-center gap-4">
                                        <Activity className="w-5 h-5 text-white/20" />
                                        <div className="h-[2px] w-24 bg-white/10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Transmission Form - Monumental Node */}
                    <div className="p-12 md:p-24 bg-zinc-950/40 rounded-[80px] border-2 border-white/10 relative overflow-hidden group backdrop-blur-3xl shadow-2xl z-10">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none italic text-7xl font-black tracking-tighter text-white select-none">SECURE_LINK_V8</div>
                        <div className="flex items-center gap-8 mb-16">
                            <ShieldCheck className="w-12 h-12 text-emerald-500 animate-pulse" />
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">{t('contact.form.title')}</h2>
                        </div>
                        <form className="space-y-16" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-16">
                                <div className="space-y-8">
                                    <label className="text-[12px] font-black text-white/40 uppercase tracking-[1em] block italic">{t('contact.form.name')}</label>
                                    <Input
                                        placeholder={t('contact.form.placeholderName')}
                                        className="h-28 bg-transparent border-b-2 border-white/10 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-4xl font-black uppercase tracking-tighter italic placeholder:text-white/5"
                                    />
                                </div>
                                <div className="space-y-8">
                                    <label className="text-[12px] font-black text-white/40 uppercase tracking-[1em] block italic">{t('contact.form.email')}</label>
                                    <Input
                                        placeholder={t('contact.form.placeholderEmail')}
                                        className="h-28 bg-transparent border-b-2 border-white/10 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-4xl font-black uppercase tracking-tighter italic placeholder:text-white/5"
                                    />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <label className="text-[12px] font-black text-white/40 uppercase tracking-[1em] block italic">{t('contact.form.message')}</label>
                                <Textarea
                                    placeholder={t('contact.form.placeholderMsg')}
                                    className="min-h-[350px] bg-transparent border-b-2 border-white/10 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-4xl font-black uppercase tracking-tighter italic placeholder:text-white/5 resize-none leading-tight"
                                />
                            </div>
                            <button className="w-full h-32 bg-white text-black font-black uppercase tracking-[1.5em] text-[18px] transition-all hover:bg-zinc-200 rounded-full active:scale-95 shadow-2xl flex items-center justify-center gap-12 group/submit">
                                {t('contact.form.submit').toUpperCase()} <Send className="w-12 h-12 group-hover/submit:translate-x-4 group-hover/submit:-translate-y-2 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* FAQ / Secondary Matrix - Global Base Node */}
                <div className="mt-96 text-center border-t-2 border-white/10 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block relative z-10">{t('contact.globalSync')}</span>
                    <h2 className="text-7xl md:text-[180px] font-black text-white/5 uppercase tracking-tighter leading-none group-hover:text-white transition-all duration-1000 italic select-none mb-32">{t('contact.globalBase')}</h2>
                    <div className="grid md:grid-cols-3 gap-16 text-left max-w-7xl mx-auto mt-32 relative z-10">
                        {[
                            { id: "01", title: "LONDON_HUB", city: "UNITED_KINGDOM", icon: Globe },
                            { id: "02", title: "DUBAI_NODE", city: "UAE", icon: Activity },
                            { id: "03", title: "SINGAPORE_UNIT", city: "SINGAPORE", icon: Target }
                        ].map((hub) => (
                            <div key={hub.id} className="pb-16 border-2 border-white/10 group hover:border-white/40 transition-all p-12 bg-zinc-950/40 rounded-[64px] backdrop-blur-3xl shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-6xl font-black italic select-none">{hub.id}</div>
                                <span className="text-7xl md:text-9xl font-black text-white/[0.03] group-hover:text-white/10 transition-all duration-1000 block mb-6 tabular-nums italic">{hub.id}</span>
                                <h4 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter group-hover:italic transition-all decoration-white/10 underline underline-offset-8">{hub.title}</h4>
                                <p className="text-[12px] font-black tracking-[1em] text-white/20 uppercase group-hover:text-white/60 transition-colors italic">{hub.city}</p>
                                <div className="mt-8 flex items-center gap-6">
                                    <hub.icon className="w-8 h-8 text-white/10" />
                                    <div className="h-[1px] w-24 bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tactical Feed Overlay - Minimalist High Contrast */}
            <div className="border-t-2 border-white/10 py-24 bg-black">
                <div className="container max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">
                    <span className="flex items-center gap-8">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                        ENCRYPTION_SYNC : {t('contact.encryptionActive').toUpperCase()}
                    </span>
                    <div className="h-[2px] w-48 bg-white/10 hidden md:block" />
                    <span className="text-white/40 italic">© 2026 LOGISTIC_TECHIE : SECURE_PROTOCOL_L5</span>
                </div>
            </div>
        </main>
    );
}
