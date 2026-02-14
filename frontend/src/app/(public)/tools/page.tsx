"use client";

import { OfficeFinder } from "@/components/tools/OfficeFinder";
import { Calculator, Zap, Ruler, Leaf, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function ToolsPage() {
    const { t } = useLanguage();

    const tools = [
        {
            id: "01",
            title: t('toolsPage.volumeCalc') || "Volume_Calculator",
            type: "VolumeCalculator" as const,
            icon: Ruler,
            desc: "Quantify transit dimensions with mission-critical precision for global logistics corridors."
        },
        {
            id: "02",
            title: t('toolsPage.chargeableWeight') || "Chargeable_Weight",
            type: "ChargeableWeightCalculator" as const,
            icon: Zap,
            desc: "Volumetric vs actual mass synchronization protocol. Essential for optimized slot allocation."
        },
        {
            id: "03",
            title: t('toolsPage.freightClass') || "Freight_Class",
            type: "FreightClassCalculator" as const,
            icon: Calculator,
            desc: "Automated NMFC classification lookup matrix. Synchronized with US logistics standards."
        },
        {
            id: "04",
            title: t('toolsPage.co2Intel') || "CO₂_Intelligence",
            type: "CO2" as const,
            icon: Leaf,
            desc: "Environmental impact metrics and ESG telemetry. Maersk ECO_STABLE certified."
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 md:mb-64 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">SYSTEM_INSTRUMENTATION</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic transition-all duration-700">
                            {t('toolsPage.title')} <br />
                            <span className="text-white/20 select-none">Nexus.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('toolsPage.planning')}
                        </p>
                    </div>
                </div>

                {/* Global Locator System - Monumental Node */}
                <div className="mb-32 md:mb-64 border-t-2 border-white/10 pt-32 relative group">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1em] mb-12 block">GLOBAL_LOCATOR_SYSTEM</span>
                    <div className="bg-zinc-950/40 rounded-[80px] border-2 border-white/10 p-4 md:p-12 shadow-2xl backdrop-blur-3xl overflow-hidden hover:border-white/20 transition-all duration-700">
                        <OfficeFinder />
                    </div>
                </div>

                {/* Structured Calculators Matrix - Monumental Grid */}
                <div className="grid md:grid-cols-2 gap-16 md:gap-24 border-t-2 border-white/10 pt-32">
                    {tools.map((tool, i) => (
                        <div
                            key={tool.id}
                            className="bg-zinc-950/40 rounded-[80px] border-2 border-white/10 p-16 hover:border-white/30 transition-all duration-700 group relative overflow-hidden backdrop-blur-3xl shadow-2xl"
                        >
                            <div className="absolute -top-12 -right-12 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-1000 rotate-12 group-hover:rotate-0 pointer-events-none">
                                <tool.icon className="w-96 h-96 text-white" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-12 mb-20 pb-12 border-b-2 border-white/5">
                                    <div className="w-24 h-24 rounded-[32px] bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                        <tool.icon className="w-12 h-12" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.8em] mb-2">MODULE_0{tool.id}_ACTIVE</span>
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_emerald]" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ENFORCED_PRECISION</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none transition-all duration-500 underline decoration-white/10 underline-offset-[16px]">
                                        {tool.title}
                                    </h3>
                                    <p className="text-[14px] font-black tracking-widest text-white/40 uppercase leading-relaxed max-w-lg group-hover:text-white/60 transition-colors pt-12 italic">
                                        {tool.desc}
                                    </p>
                                </div>

                                <div className="mt-24">
                                    <button className="h-28 px-20 bg-white text-black font-black uppercase tracking-[1em] text-[14px] rounded-full transition-all hover:bg-zinc-200 active:scale-95 shadow-2xl flex items-center gap-8 group/btn">
                                        INITIALIZE_MODULE <ChevronRight className="w-8 h-8 group-hover/btn:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monumental Sub-footer - Static */}
                <div className="mt-64 text-center border-t border-white/10 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block relative z-10">INSTRUMENTATION_SYNC</span>
                    <h2 className="text-7xl md:text-[180px] font-black text-white/5 uppercase tracking-tighter leading-[0.8] select-none italic transition-all duration-1000 group-hover:text-white/10">
                        {t('toolsPage.designPlanMove')}
                    </h2>
                </div>
            </div>

            {/* Tactical Feed Overlay - Minimalist High Contrast */}
            <div className="border-t border-white/10 py-24 bg-black">
                <div className="container max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black tracking-[1em] text-white/20 uppercase italic">
                    <div className="flex items-center gap-8">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                        TELEMETRY_SYNC : NODE_GAMMA_ACTIVE
                    </div>
                    <div className="h-[2px] w-48 bg-white/10 hidden md:block" />
                    <span>ENGINE_CERTIFIED : HIGH_FIDELITY_L4</span>
                </div>
            </div>
        </main>
    );
}
