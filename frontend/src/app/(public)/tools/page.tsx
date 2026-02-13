"use client";

import { motion } from "framer-motion";
import { OfficeFinder } from "@/components/tools/OfficeFinder";
import { Calculator, Zap, Ruler, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ToolsPage() {
    const { t } = useLanguage();
    const tools = [
        {
            id: "01",
            title: "Volume Calculator",
            type: "VolumeCalculator" as const,
            icon: Ruler,
            desc: "Quantify transit dimensions."
        },
        {
            id: "02",
            title: "Chargeable Weight",
            type: "ChargeableWeightCalculator" as const,
            icon: Zap,
            desc: "Volumetric vs actual mass sync."
        },
        {
            id: "03",
            title: "Freight Class",
            type: "FreightClassCalculator" as const,
            icon: Calculator,
            desc: "NMFC classification lookup."
        },
        {
            id: "04",
            title: "CO₂ Intelligence",
            type: "CO2" as const,
            icon: Leaf,
            desc: "Environmental impact metrics."
        }
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
                        <span className="arch-label mb-12 block">{t('toolsPage.instruments')}</span>
                        <h1 className="arch-heading">{t('toolsPage.title')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl">
                            {t('toolsPage.planning')}
                        </p>
                    </div>
                </motion.div>

                {/* Office Finder Node */}
                <div className="mb-64 border-t border-white/5 pt-32">
                    <span className="arch-label mb-16 block">{t('toolsPage.globalLocator')}</span>
                    <OfficeFinder />
                </div>

                {/* Structured Calculators Grid */}
                <div className="grid md:grid-cols-2 gap-32 border-t border-white/5 pt-32">
                    {tools.map((tool, i) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="arch-detail-line group"
                        >
                            <div className="flex items-center gap-8 mb-12">
                                <span className="arch-number group-hover:text-white transition-all">{tool.id}</span>
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-light text-white uppercase italic tracking-tighter">{tool.title}</h3>
                                    <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase">{tool.desc}</p>
                                </div>
                            </div>

                            <div className="p-12 bg-zinc-950/20 border border-white/5 min-h-[120px] flex items-center justify-center">
                                <tool.icon className="w-12 h-12 text-zinc-900 group-hover:text-white transition-all duration-700" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">{t('toolsPage.active')}</span>
                    <h2 className="arch-heading italic mb-16">{t('toolsPage.designPlanMove')}</h2>
                </div>
            </div>
        </main>
    );
}
