"use client";

import { motion } from "framer-motion";
import FreightosWidget from "@/components/widgets/FreightosWidget";

// Config ID provided by user snippet is generic / based on script src parameters
// Since the calculators don't seem to require complex app IDs in the user snippets mostly
// we map them carefully.

export default function ToolsPage() {

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                        Logistics Tools
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Essential calculators for planning your shipments efficiently.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Volume (CBM) Calculator */}
                    <FreightosWidget
                        title="Volume (CBM) Calculator"
                        widgetType="VolumeCalculator"
                        config={{
                            title: 'Volume Calculator',
                            background: { image: 'https://storage.googleapis.com/festatic.freightos.com/images/co2_background.svg' }
                        }}
                    />

                    {/* Chargeable Weight Calculator */}
                    <FreightosWidget
                        title="Chargeable Weight Calculator"
                        widgetType="ChargeableWeightCalculator"
                        config={{
                            title: 'Chargeable Weight Calculator',
                            background: { image: 'https://storage.googleapis.com/festatic.freightos.com/images/co2_background.svg' }
                        }}
                    />

                    {/* Freight Class Calculator */}
                    <FreightosWidget
                        title="Freight Class Calculator"
                        widgetType="FreightClassCalculator"
                        config={{
                            title: 'Freight Class Calculator',
                            background: { image: 'https://storage.googleapis.com/festatic.freightos.com/images/co2_background.svg' }
                        }}
                    />

                    {/* CO2 Emissions Calculator */}
                    <FreightosWidget
                        title="CO₂ Emissions Calculator"
                        widgetType="CO2"
                        // CO2 script has different config structure in user snippet
                        config={{
                            appId: '', // User snippet had empty appID
                            enabledModes: ['OCEAN', 'AIR'],
                            calcType: "CO2",
                            background: { image: 'https://storage.googleapis.com/festatic.freightos.com/images/co2_background.svg' },
                            warehousesEnabled: ['AMZ', 'UPS', 'shipbob']
                        }}
                    />
                </div>

                <div className="mt-12">
                    <FreightosWidget
                        title="Freight Rate Estimator"
                        widgetType="FreightEstimator"
                        config={{
                            enabledModes: ['OCEAN', 'AIR', 'EXPRESS'],
                            enabledResults: ['TRANSIT_TIMES', 'PRICE'],
                            calcType: 'FreightEstimator',
                            title: 'Freightos Marketplace Estimator',
                            forceFail: false,
                            noResults: {
                                subtitle: 'Sorry, no general estimates available at this time.',
                                CTA: 'Sign up for exact results'
                            },
                            calculatingScreen: {
                                title: 'Searching for estimates...',
                                subtitle: 'Compare free online quotes from multiple freight forwarders, and book live rates for shipping by air, ocean or trucking.'
                            },
                        }}
                    />
                </div>
            </div>
        </main>
    );
}
