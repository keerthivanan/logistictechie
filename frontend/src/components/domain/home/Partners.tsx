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
        <section className="relative py-20 bg-black border-t border-zinc-900">
            <div className="container max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8"
                >
                    <div>
                        <h3 className="text-2xl font-semibold text-white mb-2">
                            Our Carrier Network
                        </h3>
                        <p className="text-zinc-500">
                            Direct integrations with the world's leading shipping lines
                        </p>
                    </div>
                    <div className="flex items-center gap-6 text-center md:text-right">
                        <div>
                            <div className="text-3xl font-bold text-white">50+</div>
                            <div className="text-sm text-zinc-500">Carriers</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div>
                            <div className="text-3xl font-bold text-white">200+</div>
                            <div className="text-sm text-zinc-500">Ports</div>
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
