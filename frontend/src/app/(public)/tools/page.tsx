"use client";

import { motion } from "framer-motion";
import FreightosWidget from "@/components/widgets/FreightosWidget";
import { OfficeFinder } from "@/components/tools/OfficeFinder";
import { Calculator, Zap, Ruler, Leaf } from "lucide-react";

export default function ToolsPage() {

    const tools = [
        {
            title: "Volume Calculator",
            type: "VolumeCalculator" as const,
            icon: Ruler,
            desc: "Calculate CBM for your cargo dimensions"
        },
        {
            title: "Chargeable Weight",
            type: "ChargeableWeightCalculator" as const,
            icon: Zap,
            desc: "Compare actual vs volumetric weight"
        },
        {
            title: "Freight Class",
            type: "FreightClassCalculator" as const,
            icon: Calculator,
            desc: "Determine NMFC freight classification"
        },
        {
            title: "CO₂ Emissions",
            type: "CO2" as const,
            icon: Leaf,
            desc: "Estimate your shipment's carbon footprint"
        }
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">Logistics Tools</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Shipping Calculators
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Professional tools to help you plan shipments, calculate costs,
                        and optimize your logistics operations.
                    </p>
                </motion.div>

                {/* Office Finder */}
                <div className="mb-16">
                    <OfficeFinder />
                </div>

                {/* Calculators Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-20">
                    {tools.map((tool, i) => (
                        <motion.div
                            key={tool.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
                        >
                            <div className="flex items-center gap-4 p-6 border-b border-zinc-800">
                                <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                    <tool.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
                                    <span className="text-zinc-500 text-sm">{tool.desc}</span>
                                </div>
                            </div>

                            <div className="p-4">
                                <FreightosWidget
                                    title={tool.title}
                                    widgetType={tool.type}
                                    config={{
                                        title: tool.title,
                                        background: { color: '#000000' },
                                        appId: ''
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Rate Estimator Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="border-t border-zinc-900 pt-20"
                >
                    <div className="text-center mb-12">
                        <span className="text-sm font-medium text-emerald-500 mb-4 block">Rate Intelligence</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Market Rate Estimator
                        </h2>
                        <p className="text-zinc-400 max-w-xl mx-auto">
                            Get real-time freight rate estimates for ocean, air, and express shipments worldwide.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <FreightosWidget
                            title="Freight Rate Estimator"
                            widgetType="FreightEstimator"
                            config={{
                                enabledModes: ['OCEAN', 'AIR', 'EXPRESS'],
                                enabledResults: ['TRANSIT_TIMES', 'PRICE'],
                                calcType: 'FreightEstimator',
                                title: 'Rate Estimator',
                                forceFail: false,
                                noResults: {
                                    subtitle: 'No rates available for this route',
                                    CTA: 'Try a different route'
                                },
                                calculatingScreen: {
                                    title: 'Calculating rates...',
                                    subtitle: 'Checking carrier availability'
                                },
                            }}
                        />
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <p className="text-zinc-600 text-sm">
                        Powered by Freightos Intelligence • Real-time market data
                    </p>
                </div>
            </div>
        </main>
    );
}
