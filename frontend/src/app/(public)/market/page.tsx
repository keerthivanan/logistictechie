"use client";

import { motion } from "framer-motion";
import InfogramChart from "@/components/widgets/InfogramChart";


export default function MarketPage() {
    return (
        <main className="min-h-screen bg-black pt-32 pb-32">
            <div className="container mx-auto px-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-24"
                >
                    <span className="titan-label mb-8 inline-block py-2 px-6 border border-white/10 uppercase tracking-widest">QUARTZ_MARKET_INDEX</span>
                    <h1 className="text-6xl md:text-9xl font-bold text-white mb-10 uppercase tracking-tight leading-none">
                        Industry <span className="text-white/20">Alpha.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-3xl font-light leading-relaxed uppercase">
                        Real-time macroeconomic benchmarks and high-velocity predictive telemetry via <span className="text-white font-bold">FBX</span> and <span className="text-white font-bold">FAX</span> Sovereign Networks.
                    </p>
                </motion.div>

                {/* Global Indices Row */}
                <div className="grid lg:grid-cols-2 gap-10 mb-32">
                    <div className="p-[1px] bg-white/5 border border-white/10 rounded-none overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 z-10" />
                        <div className="bg-black/80 backdrop-blur-3xl">
                            <InfogramChart
                                title="Freightos Air Index (FAX) Global"
                                dataId="_/11uV8DUwjiugBxwssg1C"
                                className="min-h-[600px] grayscale contrast-125"
                            />
                        </div>
                    </div>
                    <div className="p-[1px] bg-white/5 border border-white/10 rounded-none overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 z-10" />
                        <div className="bg-black/80 backdrop-blur-3xl">
                            <InfogramChart
                                title="Freightos Baltic Index (FBX) Global"
                                dataId="_/AcDi5xXouXrzQMLqbVpj"
                                className="min-h-[600px] grayscale contrast-125"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-16 border-l-2 border-white/10 pl-10">
                    <span className="titan-label text-gray-400 block mb-2">Regional_Node_Telemetry</span>
                    <h2 className="text-5xl font-bold text-white uppercase tracking-tight leading-none">Global Corridor <span className="text-white/10">Matrix.</span></h2>
                </div>

                {/* Regional Indices Grid */}
                <div className="grid md:grid-cols-2 gap-10">
                    {[
                        { title: "FBX01: China to NA West Coast", id: "_/iWaVJnijhUTxyFOJszmw" },
                        { title: "FBX03: China to NA East Coast", id: "_/iU90H18RtmIZ82eRtOdF" },
                        { title: "FBX11: China to North Europe", id: "_/64yDIIsZPdLEdOaaq4q6" },
                        { title: "FBX13: China to Mediterranean", id: "_/yaGUtPV8Th3j5czlzctX" }
                    ].map((idx) => (
                        <div key={idx.id} className="p-[1px] bg-white/5 border border-white/5 rounded-none overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 relative">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 group-hover:bg-white/20 transition-all" />
                            <div className="bg-black/60">
                                <InfogramChart
                                    title={idx.title}
                                    dataId={idx.id}
                                    className="min-h-[500px]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

