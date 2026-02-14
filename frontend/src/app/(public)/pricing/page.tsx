"use client";

import { Check, Zap, Shield, Crown, ArrowUpRight, ArrowRight, ChevronRight, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PricingPage() {
    const { t } = useLanguage();
    const plans = [
        {
            id: "01",
            name: "Nomad_Node",
            description: "BASIC_OPERATIONAL_ACCESS",
            price: "$0",
            period: "FREE",
            features: [
                "5 Automated_Quotes / Week",
                "Standard_Telemetry_Sync",
                "Public_API_L1_Access",
                "Community_Knowledge_Oracle"
            ]
        },
        {
            id: "02",
            name: "Sovereign_OS",
            description: "PREMIUM_LOGISTICS_INFRA",
            price: "$299",
            period: "/MO",
            features: [
                "Unlimited_Global_Quotes",
                "Real-time_GPS_Orbital_Tracking",
                "Priority_AI_Router_v8",
                "Digital_Manifest_L3_Sync",
                "Neural_Route_Optimization"
            ]
        },
        {
            id: "03",
            name: "Titan_Ledger",
            description: "BESPOKE_GLOBAL_NETWORK",
            price: "CUSTOM",
            period: "POA",
            features: [
                "Dedicated_Sovereign_Strategist",
                "Custom_LLM_Training_Node",
                "99.999%_Uptime_SLA_Enforced",
                "Quantum_Encryption_Shield",
                "Direct_Carrier_Port_Access"
            ]
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48 flex-1">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">REVENUE_CONFIGURATION</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                            {t('pricingPage.title')} <br />
                            <span className="text-white/20 select-none">Matrix.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('pricingPage.unfiltered')}
                        </p>
                    </div>
                </div>

                {/* Structured Pricing Matrix - Monumental Grid */}
                <div className="grid lg:grid-cols-3 border-2 border-white/10 bg-zinc-950/40 backdrop-blur-3xl rounded-[80px] overflow-hidden shadow-2xl">
                    {plans.map((plan, idx) => (
                        <div
                            key={plan.id}
                            className="p-12 md:p-20 border-r-2 last:border-r-0 border-white/10 group relative transition-all duration-700 hover:bg-white/[0.03]"
                        >
                            <div className="space-y-16 relative z-10">
                                <div className="flex justify-between items-start">
                                    <span className="text-8xl font-black text-white/[0.03] group-hover:text-white/10 transition-all duration-1000 tracking-tighter leading-none italic select-none">{plan.id}</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] font-black text-white/40 uppercase tracking-widest border-2 border-white/10 px-6 py-2 rounded-full group-hover:text-white group-hover:border-white/30 transition-all italic">{plan.description}</span>
                                        <div className="mt-4 flex items-center gap-4 group-hover:opacity-100 opacity-20 transition-opacity">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_emerald]" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">NODE_ALPHA_ACTIVE</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter transition-all group-hover:pl-4 group-hover:italic leading-none underline decoration-white/10 underline-offset-[16px]">{plan.name}</h3>
                                    <div className="flex items-baseline gap-6 pt-12">
                                        <div className="text-8xl md:text-9xl font-black text-white tabular-nums tracking-tighter leading-none italic">{plan.price}</div>
                                        <div className="text-[12px] font-black text-white/20 uppercase tracking-[0.6em] mb-4">{plan.period}</div>
                                    </div>
                                </div>
                                <div className="space-y-8 py-16 border-t-2 border-white/5">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-8 group/feat">
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10 group-hover/feat:bg-white transition-all shadow-2xl group-hover/feat:scale-125 duration-500" />
                                            <span className="text-[13px] font-black text-white/30 group-hover/feat:text-white transition-colors uppercase tracking-[0.25em] italic">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/quote" className="block pt-12">
                                    <button className="w-full h-28 bg-white text-black text-[16px] font-black uppercase tracking-[0.8em] transition-all hover:bg-zinc-200 rounded-full active:scale-95 shadow-2xl flex items-center justify-center gap-6 group/btn">
                                        INITIALIZE_PROTOCOL <ChevronRight className="w-8 h-8 group-hover/btn:translate-x-3 transition-transform" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monumental Bespoke Deployment Section */}
                <div className="mt-64 grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 border-t-2 border-white/10 pt-48 relative overflow-hidden group pb-48">
                    <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <div className="space-y-20 relative z-10">
                        <span className="text-[12px] font-black text-white/40 uppercase tracking-[1em] mb-8 block italic">{t('pricingPage.bespoke')}</span>
                        <h2 className="text-7xl md:text-[140px] font-black text-white leading-[0.8] uppercase tracking-tighter group-hover:italic transition-all duration-700 group-hover:pl-4">{t('pricingPage.complexDeployment')}</h2>
                        <p className="text-3xl md:text-5xl font-black text-white/40 leading-[0.9] max-w-2xl uppercase tracking-tighter italic">
                            {t('pricingPage.strategist')}
                        </p>
                    </div>
                    <div className="flex flex-col justify-end items-end pb-12 relative z-10">
                        <Link href="/contact" className="w-full">
                            <button className="h-40 w-full px-16 bg-white/5 border-2 border-white/10 text-white font-black uppercase tracking-[1.2em] text-[16px] transition-all hover:bg-white hover:text-black rounded-full flex items-center justify-center gap-12 active:scale-95 shadow-2xl group/btn2">
                                FORGE_ALLIANCE <ArrowRight className="w-12 h-12 group-hover/btn2:translate-x-4 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Monumental Sub-footer - Static */}
                <div className="mt-64 text-center border-t border-white/10 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block relative z-10">{t('pricingPage.priceHierarchy')}</span>
                    <h2 className="text-7xl md:text-[180px] font-black text-white/5 uppercase tracking-tighter leading-none group-hover:text-white/10 transition-all duration-1000 italic select-none">{t('pricingPage.pureUnfiltered')}</h2>
                </div>
            </div>

            {/* Tactical Feed Overlay - Minimalist High Contrast */}
            <div className="border-t-2 border-white/10 py-24 bg-black">
                <div className="container max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">
                    <span className="flex items-center gap-8">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                        COMMERCIAL_REVENUE_SYNC : NODE_ZETA_ACTIVE
                    </span>
                    <div className="h-[2px] w-48 bg-white/10 hidden md:block" />
                    <span className="text-white/40">BILLING_MODE : ABSOLUTE_TRANSPARENCY_L9</span>
                </div>
            </div>
        </main>
    );
}
