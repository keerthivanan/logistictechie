"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ChevronRight, Globe, Shield, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompanyPage() {
    const { t } = useLanguage();
    const stats = [
        { label: t('companyPage.founded'), value: "2015" },
        { label: t('companyPage.projects'), value: "200+" },
        { label: t('companyPage.nodes'), value: "48+" },
        { label: t('companyPage.operatives'), value: "1.2K" }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48 flex-1">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">INSTITUTIONAL_PROFILE</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                            {t('companyPage.title')} <br />
                            <span className="text-white/20 select-none">Legacy.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic shadow-2xl">
                            {t('companyPage.philosophy')}
                        </p>
                    </div>
                </div>

                {/* Narrative Section - Tactical Layout - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-24 md:gap-48 border-t-2 border-white/10 pt-32 relative">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <div className="space-y-24 relative z-10">
                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-16 h-[2px] bg-white/40" />
                            <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.8em] italic">MISSION_DIRECTIVE</span>
                        </div>
                        <p className="text-4xl md:text-6xl font-black text-white leading-[0.9] uppercase tracking-tighter group hover:italic transition-all duration-700 underline decoration-white/10 underline-offset-[20px]">
                            {t('companyPage.narrative')}
                        </p>
                        <p className="text-lg md:text-xl font-black text-white/40 leading-relaxed uppercase tracking-widest max-w-4xl italic pt-12">
                            Established in 2015, Logistic Techie was built on a single premise: Universal Connectivity. We don't just move cargo; we manage the global knowledge pulse of trade.
                        </p>
                    </div>

                    <div className="space-y-16 relative z-10">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] block mb-12 italic">{t('companyPage.systems')}</span>
                        {[
                            { title: t('companyPage.networkTitle'), desc: t('companyPage.networkDesc'), icon: Globe, id: "NET_V8" },
                            { title: t('companyPage.syncTitle'), desc: t('companyPage.syncDesc'), icon: Target, id: "SYNC_PROTO" }
                        ].map((item, idx) => (
                            <div key={idx} className="pb-16 border-2 border-white/10 group bg-zinc-950/40 p-12 rounded-[64px] hover:border-white/30 transition-all backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-4xl font-black italic select-none">{item.id}</div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-6 italic group-hover:text-zinc-200 transition-all">{item.title}</h3>
                                <p className="text-white/40 text-[12px] font-black uppercase tracking-widest leading-relaxed max-w-sm group-hover:text-white/60 transition-colors italic">{item.desc}</p>
                                <div className="mt-8 flex items-center gap-6">
                                    <item.icon className="w-6 h-6 text-white/20" />
                                    <div className="h-[2px] w-24 bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metrics Matrix - Monumental Grid */}
                {stats.length > 0 && (
                    <div className="mt-64 grid grid-cols-2 md:grid-cols-4 gap-16 border-t-2 border-white/10 pt-48 mb-64 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10" />
                        {stats.map((stat, idx) => (stat && (
                            <div key={idx} className="space-y-12 group relative z-10">
                                <span className="text-[12px] font-black text-white/40 uppercase tracking-[1em] block group-hover:text-white transition-colors italic">{stat.label}</span>
                                <div className="text-7xl md:text-[140px] font-black text-white tracking-tighter group-hover:italic transition-all duration-1000 tabular-nums leading-none underline decoration-white/10 underline-offset-[24px]">
                                    {stat.value}
                                </div>
                            </div>
                        )))}
                    </div>
                )}

                {/* Monumental Sub-footer - Static */}
                <div className="mt-64 text-center border-t border-white/10 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block relative z-10">{t('companyPage.nextPhase')}</span>
                    <h2 className="text-7xl md:text-[200px] font-black text-white/5 uppercase tracking-tighter leading-none group-hover:text-white/10 transition-all duration-1000 italic select-none mb-32">{t('companyPage.migrate')}</h2>
                    <Link href="/contact" className="inline-block relative z-10">
                        <button className="h-32 px-32 bg-white text-black text-[16px] font-black uppercase tracking-[1.2em] rounded-full transition-all hover:bg-zinc-200 active:scale-95 shadow-2xl flex items-center gap-12 group/btn">
                            {t('companyPage.contactArch')} <ChevronRight className="w-10 h-10 group-hover/btn:translate-x-4 transition-transform" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Tactical Feed Overlay - Minimalist High Contrast */}
            <div className="border-t-2 border-white/10 py-24 bg-black">
                <div className="container max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">
                    <span className="flex items-center gap-8">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                        INSTITUTIONAL_INTEGRITY : {t('companyPage.integrityVerified').toUpperCase()}
                    </span>
                    <div className="h-[2px] w-48 bg-white/10 hidden md:block" />
                    <span className="text-white/40">SYSTEM_AUTH : {t('companyPage.os')}</span>
                </div>
            </div>
        </main >
    );
}
