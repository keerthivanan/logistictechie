"use client";

import { motion } from "framer-motion";
import FreightosWidget from "@/components/widgets/FreightosWidget";
import { Calculator, Zap, Ruler, ShieldAlert } from "lucide-react";

export default function ToolsPage() {

    const tools = [
        {
            title: "Volume (CBM) Calculator",
            type: "VolumeCalculator" as const,
            icon: Ruler,
            desc: "Calculate cubic meters for sea and air freight."
        },
        {
            title: "Chargeable Weight",
            type: "ChargeableWeightCalculator" as const,
            icon: Zap,
            desc: "Determine actual vs volumetric weight ratios."
        },
        {
            title: "Freight Class",
            type: "FreightClassCalculator" as const,
            icon: Calculator,
            desc: "Identify standard NMFC freight classes."
        },
        {
            title: "CO₂ Emissions",
            type: "CO2" as const,
            icon: ShieldAlert,
            desc: "Environmental impact analysis per shipment."
        }
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-20 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-[0.3em] mb-6">
                        <Zap className="w-3 h-3 text-white" /> Logistics Intelligence
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter">
                        Shipment Utilities
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Professional-grade calculators for precise supply chain planning and cost estimation.
                    </p>
                </motion.div>

                {/* Grid of Tools */}
                <div className="grid lg:grid-cols-2 gap-10">
                    {tools.map((tool, i) => (
                        <motion.div
                            key={tool.type}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-white text-black rounded-lg">
                                    <tool.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{tool.title}</h3>
                                    <p className="text-sm text-gray-500">{tool.desc}</p>
                                </div>
                            </div>

                            <FreightosWidget
                                title={tool.title}
                                widgetType={tool.type}
                                config={{
                                    title: tool.title,
                                    background: { color: '#000000' }, // Force dark inside widget if possible
                                    appId: ''
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Main Rate Estimator Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-24 pt-24 border-t border-white/10"
                >
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Market Rate Estimator</h2>
                        <p className="text-gray-400">Benchmark your current logistics costs against global market averages.</p>
                    </div>

                    <div className="relative p-1 bg-white/5 rounded-2xl border border-white/10">
                        <FreightosWidget
                            title="Freight Rate Estimator"
                            widgetType="FreightEstimator"
                            config={{
                                enabledModes: ['OCEAN', 'AIR', 'EXPRESS'],
                                enabledResults: ['TRANSIT_TIMES', 'PRICE'],
                                calcType: 'FreightEstimator',
                                title: 'Market Benchmark',
                                forceFail: false,
                                noResults: {
                                    subtitle: 'Real-time estimates are currently being updated.',
                                    CTA: 'Refresh page'
                                },
                                calculatingScreen: {
                                    title: 'Syncing Global Data...',
                                    subtitle: 'Aggregating live rates from across the logistics network.'
                                },
                            }}
                        />
                    </div>
                </motion.div>

                {/* Footer Attribution */}
                <div className="mt-20 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.5em] font-bold">
                        Powered by Freightos Intelligence Architecture
                    </p>
                </div>
            </div>
        </main>
    );
}
