"use client";

import { motion } from "framer-motion";
import InfogramChart from "@/components/widgets/InfogramChart";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MarketPage() {
    const { t } = useLanguage(); // Even if we don't have translations yet, we prepare for it

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Market Intelligence
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Real-time benchmarks and analytics powered by Freightos Baltic Index (FBX) and Air Index (FAX).
                    </p>
                </motion.div>

                {/* Global Indices Row */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    <InfogramChart
                        title="Freightos Air Index (FAX) Global"
                        dataId="_/11uV8DUwjiugBxwssg1C"
                        className="min-h-[600px]"
                    />
                    <InfogramChart
                        title="Freightos Baltic Index (FBX) Global"
                        dataId="_/AcDi5xXouXrzQMLqbVpj"
                        className="min-h-[600px]"
                    />
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Regional Container Indices (FBX)</h2>
                </div>

                {/* Regional Indices Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    <InfogramChart
                        title="FBX01: China to NA West Coast"
                        dataId="_/iWaVJnijhUTxyFOJszmw"
                        className="min-h-[500px]"
                    />
                    <InfogramChart
                        title="FBX03: China to NA East Coast"
                        dataId="_/iU90H18RtmIZ82eRtOdF"
                        className="min-h-[500px]"
                    />
                    <InfogramChart
                        title="FBX11: China to North Europe"
                        dataId="_/64yDIIsZPdLEdOaaq4q6"
                        className="min-h-[500px]"
                    />
                    <InfogramChart
                        title="FBX13: China to Mediterranean"
                        dataId="_/yaGUtPV8Th3j5czlzctX"
                        className="min-h-[500px]"
                    />
                </div>
            </div>
        </main>
    );
}
