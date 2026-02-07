"use client";

import { motion } from "framer-motion";
import InfogramChart from "@/components/widgets/InfogramChart";


export default function MarketPage() {
    // const { t } = useLanguage(); // Even if we don't have translations yet, we prepare for it

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-[0.3em] mb-6">
                        Real-time Intelligence
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter">
                        Market Indices
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Industry-standard benchmarks and predictive analytics powered by <span className="text-white font-bold">FBX</span> and <span className="text-white font-bold">FAX</span> Global Data.
                    </p>
                </motion.div>

                {/* Global Indices Row */}
                <div className="grid lg:grid-cols-2 gap-10 mb-20">
                    <div className="p-1 bg-white/5 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                        <InfogramChart
                            title="Freightos Air Index (FAX) Global"
                            dataId="_/11uV8DUwjiugBxwssg1C"
                            className="min-h-[600px]"
                        />
                    </div>
                    <div className="p-1 bg-white/5 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                        <InfogramChart
                            title="Freightos Baltic Index (FBX) Global"
                            dataId="_/AcDi5xXouXrzQMLqbVpj"
                            className="min-h-[600px]"
                        />
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Regional Container Corridors</h2>
                    <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Spot Rate Volatility Index</p>
                </div>

                {/* Regional Indices Grid */}
                <div className="grid md:grid-cols-2 gap-10">
                    {[
                        { title: "FBX01: China to NA West Coast", id: "_/iWaVJnijhUTxyFOJszmw" },
                        { title: "FBX03: China to NA East Coast", id: "_/iU90H18RtmIZ82eRtOdF" },
                        { title: "FBX11: China to North Europe", id: "_/64yDIIsZPdLEdOaaq4q6" },
                        { title: "FBX13: China to Mediterranean", id: "_/yaGUtPV8Th3j5czlzctX" }
                    ].map((idx) => (
                        <div key={idx.id} className="p-1 bg-white/5 rounded-[32px] border border-white/10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                            <InfogramChart
                                title={idx.title}
                                dataId={idx.id}
                                className="min-h-[500px]"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
