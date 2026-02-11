"use client";

import { motion } from "framer-motion";
import LogoLoop from "@/components/ui/LogoLoop";

// Premium SVG Logos for top Shipping Carriers
export const CarrierLogos = {
    Maersk: () => (
        <svg viewBox="0 0 120 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">MAERSK</text>
        </svg>
    ),
    MSC: () => (
        <svg viewBox="0 0 80 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="900" fontSize="24" fill="currentColor">MSC</text>
        </svg>
    ),
    CMA: () => (
        <svg viewBox="0 0 140 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">CMA CGM</text>
        </svg>
    ),
    COSCO: () => (
        <svg viewBox="0 0 120 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">COSCO</text>
        </svg>
    ),
    Hapag: () => (
        <svg viewBox="0 0 160 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">Hapag-Lloyd</text>
        </svg>
    ),
    Evergreen: () => (
        <svg viewBox="0 0 160 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">EVERGREEN</text>
        </svg>
    ),
    ONE: () => (
        <svg viewBox="0 0 60 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">ONE</text>
        </svg>
    ),
    HMM: () => (
        <svg viewBox="0 0 80 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">HMM</text>
        </svg>
    ),
    YangMing: () => (
        <svg viewBox="0 0 160 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="currentColor">YANG MING</text>
        </svg>
    ),
    Zim: () => (
        <svg viewBox="0 0 60 40" className="h-8 w-auto" fill="currentColor">
            <text x="0" y="28" fontFamily="Arial" fontWeight="900" fontSize="24" fill="currentColor">ZIM</text>
        </svg>
    ),
};


export function PartnersSection() {
    const logos = [
        { node: <CarrierLogos.Maersk />, title: "Maersk Line" },
        { node: <CarrierLogos.MSC />, title: "MSC" },
        { node: <CarrierLogos.CMA />, title: "CMA CGM" },
        { node: <CarrierLogos.COSCO />, title: "COSCO Shipping" },
        { node: <CarrierLogos.Hapag />, title: "Hapag-Lloyd" },
        { node: <CarrierLogos.Evergreen />, title: "Evergreen Marine" },
        { node: <CarrierLogos.ONE />, title: "Ocean Network Express" },
        { node: <CarrierLogos.HMM />, title: "HMM" },
        { node: <CarrierLogos.YangMing />, title: "Yang Ming" },
        { node: <CarrierLogos.Zim />, title: "ZIM" },
    ];

    return (
        <section className="relative py-32 bg-black">
            <div className="container max-w-7xl mx-auto px-6">

                {/* Section Header - Apple Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8"
                >
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase italic leading-none">
                            Our Network. <span className="text-zinc-800">Global Coverage.</span>
                        </h2>
                        <p className="text-zinc-600 text-lg font-bold uppercase tracking-widest">
                            Direct integrations with 50+ world leading ocean carriers.
                        </p>
                    </div>
                    <div className="flex gap-12">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">Live Nodes</div>
                            <div className="text-4xl font-black text-white tracking-tighter">200+</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">Active Ships</div>
                            <div className="text-4xl font-black text-white tracking-tighter">5,000+</div>
                        </div>
                    </div>
                </motion.div>

                {/* Logo Carousel */}
                <div className="relative h-16 overflow-hidden text-zinc-600 opacity-50 hover:opacity-80 transition-opacity duration-500">
                    <LogoLoop
                        logos={logos}
                        speed={60}
                        direction="left"
                        logoHeight={32}
                        gap={120}
                        hoverSpeed={0}
                        scaleOnHover={false}
                        fadeOut={true}
                        fadeOutColor="#000000"
                        ariaLabel="Partner Carriers"
                    />
                </div>
            </div>
        </section>
    );
}
