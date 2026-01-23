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
        <section className="relative py-20 bg-black">
            {/* Top gradient for seamless blend with Hero */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none" />

            <div className="container max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mb-3">Trusted Partners</p>
                    <h3 className="text-lg md:text-xl text-gray-400">
                        Connected with <span className="text-white font-semibold">50+ Major Shipping Lines</span>
                    </h3>
                </motion.div>

                <div className="relative h-12 overflow-hidden text-gray-500">
                    <LogoLoop
                        logos={logos}
                        speed={40}
                        direction="left"
                        logoHeight={32}
                        gap={80}
                        hoverSpeed={0}
                        scaleOnHover={false}
                        fadeOut={true}
                        fadeOutColor="#000000"
                        ariaLabel="Shipping Partners"
                    />
                </div>
            </div>
        </section>
    );
}
