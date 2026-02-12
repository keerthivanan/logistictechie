"use client";

import { motion, Variants } from "framer-motion";
import { Ship, Plane, Package, Truck, Globe, Shield, Clock, DollarSign, ArrowRight, Check, Zap } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
    const mainServices = [
        {
            id: "01",
            title: "OCEAN_STRATEGY",
            desc: "Architecting global maritime corridors with zero-latency coordination and autonomous vessel integration.",
            details: "Full Container Load (FCL), Less than Container Load (LCL), Specialized Equipment Deployment."
        },
        {
            id: "02",
            title: "AERIAL_LOGISTICS",
            desc: "High-velocity atmospheric transit for time-critical mission assets and high-value payloads.",
            details: "Express Cargo, Charter Operations, Temperature Controlled Atmospheric Transit."
        },
        {
            id: "03",
            title: "GROUND_DEVICES",
            desc: "Precision terrestrial routing across continental networks using tactical fleet synchronization.",
            details: "Last-mile autonomous delivery, Heavy-haul logistics, Multi-modal rail integration."
        },
        {
            id: "04",
            title: "WAREHOUSE_NODES",
            desc: "Strategic asset positioning within climate-controlled, high-security regional storage frameworks.",
            details: "Automated fulfillment nodes, Cold-chain integrity, Secure perimeter storage."
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-48"
                >
                    <span className="arch-label mb-12 block">SERVICES</span>
                    <h1 className="arch-heading">What We Do</h1>
                </motion.div>

                {/* Service Grid - Numbered Pattern */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 gap-x-32 gap-y-48 border-t border-white/5 pt-24"
                >
                    {mainServices.map((service) => (
                        <motion.div key={service.id} variants={itemVariants} className="group cursor-default">
                            <div className="flex items-start gap-8">
                                <span className="arch-number">{service.id}</span>
                                <div className="space-y-8">
                                    <h2 className="text-4xl font-light text-white uppercase tracking-tight group-hover:pl-4 transition-all duration-700">
                                        {service.title}
                                    </h2>
                                    <p className="text-xl leading-relaxed text-zinc-500 max-w-md group-hover:text-zinc-300 transition-colors duration-700">
                                        {service.desc}
                                    </p>
                                    <div className="arch-detail-line">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-700">
                                            {service.details}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Technical Advantage Section */}
                <div className="mt-96">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2 }}
                        className="grid lg:grid-cols-2 gap-32 items-start"
                    >
                        <div>
                            <span className="arch-label mb-12 block">APPROACH</span>
                            <h2 className="text-6xl font-light text-white mb-16 leading-tight">Tactical <br />Advantage</h2>
                            <p className="text-xl text-zinc-500 max-w-lg mb-16 leading-relaxed">
                                Our practice focus on creating logistic pipelines that are both functional and poetic, respecting the natural volatility of global trade while ensuring absolute delivery integrity.
                            </p>
                            <Link href="/quote">
                                <button className="h-20 px-16 border border-white text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-white hover:text-black">
                                    INITIALIZE_MISSION
                                </button>
                            </Link>
                        </div>

                        <div className="space-y-16 py-12">
                            {[
                                { title: "Research", desc: "Deep understanding of context, culture, and climate." },
                                { title: "Collaboration", desc: "Close partnership with clients, engineers, and craftspeople." },
                                { title: "Innovation", desc: "Sustainable materials and forward-thinking design solutions." }
                            ].map((item, idx) => (
                                <div key={idx} className="arch-detail-line">
                                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-zinc-500 max-w-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Minimal Sub-footer */}
            <div className="border-t border-white/5 py-32">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-800 uppercase">
                    <span>PHOENIX_OS_OPERATIONS</span>
                    <span>V4.1.0_STABLE</span>
                </div>
            </div>
        </main>
    );
}
