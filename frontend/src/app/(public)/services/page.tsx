"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Ship, Plane, Package, Truck, Globe, Shield, Clock, DollarSign, ArrowRight, Check, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServicesPage() {
    const { t } = useLanguage();

    const services = [
        {
            icon: Ship,
            title: "OCEAN_FREIGHT_V2",
            description: "Full container (FCL) and segmented (LCL) high-velocity shipping protocols with direct carrier sync.",
            features: ["CARRIER_DIRECT_API", "REAL_TIME_TELEMETRY", "QUANTUM_TRACKING"],
        },
        {
            icon: Plane,
            title: "AIR_INTELLIGENCE",
            description: "Express orbital cargo services for time-critical manifests. Mission-critical deployment to all nodes.",
            features: ["EXPRESS_ORBITAL", "CHARTER_PROTOCOL", "THERMAL_CONTROL"],
        },
        {
            icon: Truck,
            title: "GROUND_LOGISTICS",
            description: "Tactical land-based unit maneuvers for first/last-mile synchronization across continental grids.",
            features: ["FTL_LTL_PRECISION", "CROSS_GRID_LOGIC", "MULTIMODAL_SYNC"],
        },
        {
            icon: Package,
            title: "BASE_OPERATIONS",
            description: "Strategic fulfillment nodes with neural inventory management and autonomous distribution logic.",
            features: ["NEURAL_INVENTORY", "PICK_PACK_SYNC", "GLOBAL_HUB_SYNC"],
        },
    ];

    const benefits = [
        {
            icon: Globe,
            title: "GLOBAL_NETWORK",
            description: "Direct access to 200+ sovereign port nodes and terminal intelligence layers."
        },
        {
            icon: Shield,
            title: "ASSET_PROTECTION",
            description: "End-to-end indemnity protocols securing every unit against maritime contingency."
        },
        {
            icon: Clock,
            title: "24/7_OPS_LINK",
            description: "Constant operational surveillance and high-bandwidth support for every manifest."
        },
        {
            icon: Zap,
            title: "MAX_VELOCITY",
            description: "Optimized trajectory calculations ensuring mission completion at peak efficiency."
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 pt-48 pb-48 relative z-10">
                {/* Cinematic Header */}
                <div className="flex flex-col mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-[1px] bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">CAPABILITIES_&_INFRASTRUCTURE</span>
                        </div>
                        <h1 className="titan-text mb-8">
                            Global. <br />
                            <span className="text-zinc-900 group">Deployment.</span>
                        </h1>
                        <p className="max-w-3xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] leading-relaxed">
                            A unified operating system for global trade. From deep-sea freight intelligence <br />
                            <span className="text-zinc-800">to autonomous last-mile maneuvers.</span>
                        </p>
                    </motion.div>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 gap-0 border-t border-white/5 mb-48">
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="p-16 border-l border-b border-white/5 relative group hover:bg-zinc-950/40 transition-all duration-700 flex flex-col h-full"
                        >
                            <div className="h-20 w-20 bg-zinc-950 border border-white/5 flex items-center justify-center mb-16 transition-all duration-700 group-hover:bg-white group-hover:text-black group-hover:rotate-12">
                                <service.icon className="h-8 w-8" />
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8 leading-tight transition-all duration-700 group-hover:translate-x-4">
                                {service.title}
                            </h2>
                            <p className="text-zinc-700 text-[11px] font-black uppercase tracking-[0.4em] mb-12 leading-loose max-w-md group-hover:text-zinc-400 transition-colors">
                                {service.description}
                            </p>

                            <ul className="space-y-6 mb-20 flex-1">
                                {service.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-6 group/item cursor-default">
                                        <div className="h-1.5 w-1.5 bg-emerald-500 group-hover/item:scale-150 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-800 group-hover/item:text-white transition-colors">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/quote" className="w-full">
                                <Button className="w-full h-20 bg-zinc-950 border border-white/5 text-zinc-600 group-hover:bg-white group-hover:text-black group-hover:border-transparent transition-all duration-700 rounded-none font-black text-[11px] uppercase tracking-[0.6em] flex items-center justify-center gap-6">
                                    INITIALIZE_PROTOCOL <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>

                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] italic font-black text-9xl text-white select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                                0{idx + 1}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tactical Advantage Matrix */}
                <div className="mb-24 pt-32 border-t border-white/5">
                    <div className="flex items-end justify-between mb-24">
                        <div>
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                                The Edge.
                            </h2>
                            <div className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.8em]">STRATEGIC_OPERATIONAL_DOMINANCE</div>
                        </div>
                        <div className="w-24 h-[1px] bg-white/5 mb-8" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-white/5">
                        {benefits.map((b, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className="p-12 border-r border-white/5 last:border-r-0 group hover:bg-zinc-950/40 transition-all duration-700 cursor-default"
                            >
                                <div className="h-14 w-14 bg-zinc-950 border border-white/5 flex items-center justify-center mb-10 transition-all duration-700 group-hover:rotate-12 group-hover:border-emerald-500/50">
                                    <b.icon className="h-6 w-6 text-zinc-800 group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6 group-hover:text-emerald-500 transition-colors">{b.title}</h4>
                                <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest leading-loose group-hover:text-zinc-500 transition-colors">{b.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
