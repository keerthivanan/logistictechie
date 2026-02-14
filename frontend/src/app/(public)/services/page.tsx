"use client";

import { Ship, Plane, Package, Truck, Globe, Shield, Clock, DollarSign, ArrowRight, Check, Zap, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function ServicesPage() {
    const { t } = useLanguage();

    const mainServices = [
        {
            id: "01",
            title: t('servicesPage.items.ocean') || "OCEAN_FREIGHT",
            desc: t('servicesPage.tacticalDesc') || "Global supply chain synchronization through high-density maritime intelligence and spot slot allocation.",
            details: "FCL_LCL_SYNC_V4"
        },
        {
            id: "02",
            title: t('servicesPage.items.aerial') || "AERIAL_LOGISTICS",
            desc: t('servicesPage.items.aerialDesc') || "Low-latency air cargo solutions for time-critical global deployment. Priority tarmac access guaranteed.",
            details: "EXPRESS_SYNC_L9"
        },
        {
            id: "03",
            title: t('servicesPage.items.ground') || "TERRESTRIAL_LINK",
            desc: t('servicesPage.items.groundDesc') || "Intelligent road and rail networks across all continental nodes. Seamless multimodal integration.",
            details: "LAST_MILE_PROTOCOL"
        },
        {
            id: "04",
            title: t('servicesPage.items.warehouse') || "STRATEGIC_STORAGE",
            desc: t('servicesPage.items.warehouseDesc') || "Climate-controlled fulfillment nodes with autonomous inventory tracking and real-time visibility.",
            details: "NODE_ZERO_ALPHA"
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48 flex-1">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">CAPABILITY_PORTFOLIO</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                            {t('servicesPage.title')} <br />
                            <span className="text-white/20 select-none">Assets.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('servicesPage.tacticalDesc')}
                        </p>
                    </div>
                </div>

                {/* Service Grid - Numbered Protocol Pattern - Static */}
                <div className="grid md:grid-cols-2 gap-x-24 gap-y-32 border-t-2 border-white/10 pt-32">
                    {mainServices.map((service) => (
                        <div key={service.id} className="group cursor-default relative">
                            <div className="flex items-start gap-12">
                                <span className="text-8xl md:text-[180px] font-black text-white/[0.03] group-hover:text-white/10 transition-all duration-1000 tracking-tighter leading-none italic select-none">
                                    {service.id}
                                </span>
                                <div className="space-y-12 pt-8 md:pt-16">
                                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter transition-all duration-700 group-hover:pl-4 decoration-white/10 underline underline-offset-[16px]">
                                        {service.title}
                                    </h2>
                                    <p className="text-[14px] leading-relaxed text-white/40 font-black uppercase tracking-widest max-w-sm group-hover:text-white/70 transition-colors duration-700 italic">
                                        {service.desc}
                                    </p>
                                    <div className="pt-12 border-t border-white/10">
                                        <div className="flex items-center gap-6 bg-white/5 px-8 py-3 rounded-full border border-white/10 w-fit">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_emerald]" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white">
                                                {service.details}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Technical Advantage Section - Monumental Reconstruction */}
                <div className="mt-64 relative overflow-hidden border-t-2 border-white/10 pt-48 pb-48">
                    <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <div className="grid lg:grid-cols-[1.5fr,1fr] gap-32 items-start relative z-10">
                        <div className="space-y-24">
                            <div>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-12 block">OPERATIONAL_EDGE</span>
                                <h2 className="text-7xl md:text-[140px] font-black text-white uppercase tracking-tighter leading-[0.8] italic group-hover:pl-4 transition-all duration-700">
                                    {t('servicesPage.tacticalAdvantage')}
                                </h2>
                            </div>
                            <p className="text-3xl md:text-5xl font-black text-white/40 uppercase tracking-tighter max-w-2xl leading-[0.9] italic">
                                {t('servicesPage.tacticalDesc')}
                            </p>
                            <Link href="/quote" className="inline-block pt-12">
                                <button className="h-32 px-32 bg-white text-black text-[16px] font-black uppercase tracking-[1em] rounded-full transition-all hover:bg-zinc-200 active:scale-95 shadow-2xl flex items-center gap-12 group/btn">
                                    INITIATE_MISSION <ChevronRight className="w-10 h-10 group-hover/btn:translate-x-3 transition-transform" />
                                </button>
                            </Link>
                        </div>

                        <div className="space-y-16 py-12">
                            {[
                                { title: "NEURAL_ANALYSIS", desc: "Deep understanding of global trade context and localized market intelligence nodes.", id: "L9_INTEL" },
                                { title: "INDUSTRIAL_INTELLIGENCE", desc: "Direct partnership with tier-1 carriers, port authorities, and logistics craftspeople.", id: "TIER_A_SYNC" },
                                { title: "TELEMETRY_INNOVATION", desc: "Next-generation tracking protocols and forward-thinking supply chain solutions.", id: "PROTO_X" }
                            ].map((item, idx) => (
                                <div key={idx} className="pb-16 border-2 border-white/10 group bg-zinc-950/40 p-12 rounded-[64px] hover:border-white/30 transition-all backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-4xl font-black italic select-none">{item.id}</div>
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 italic group-hover:text-zinc-200 transition-all">{item.title}</h3>
                                    <p className="text-white/40 text-[12px] font-black uppercase tracking-widest leading-relaxed max-w-sm group-hover:text-white/60 transition-colors italic">{item.desc}</p>
                                    <div className="mt-8 flex items-center gap-4">
                                        <Activity className="w-5 h-5 text-white/20" />
                                        <div className="h-[2px] w-24 bg-white/10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Detail Overlay - Minimalist High Contrast */}
            <div className="border-t-2 border-white/10 py-24 bg-black">
                <div className="container max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">
                    <span className="flex items-center gap-8">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                        OPERATIONAL_SYNC_STATUS : {t('servicesPage.operations').toUpperCase()}
                    </span>
                    <div className="h-[2px] w-48 bg-white/10 hidden md:block" />
                    <span className="text-white/40">{t('servicesPage.stable') || "STABLE_DEPLOYMENT_ACTIVE"}</span>
                </div>
            </div>
        </main>
    );
}
