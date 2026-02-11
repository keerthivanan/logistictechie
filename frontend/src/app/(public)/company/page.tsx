"use client";

import { motion } from "framer-motion";
import { Users, Target, Award, Globe, MapPin, Mail, Linkedin, CheckCircle, ArrowRight, Zap, Shield } from "lucide-react";

export default function CompanyPage() {

    const values = [
        {
            icon: Target,
            title: "PRECISION_ENGINEERING",
            description: "Every tactical detail is monitored. We deliver millisecond accuracy in global telemetry."
        },
        {
            icon: Shield,
            title: "ABSOLUTE_TRANSPARENCY",
            description: "No hidden latent fees. Complete operational visibility into the global trade ledger."
        },
        {
            icon: Zap,
            title: "OPERATIONAL_VELOCITY",
            description: "We define the standard for digital freight forwarding through high-bandwidth intelligence."
        },
        {
            icon: Globe,
            title: "GLOBAL_AUTONOMY",
            description: "Network coverage spanning 200+ sovereign nodes with direct carrier synchronization."
        },
    ];

    const stats = [
        { value: "50+", label: "CARRIER_NODES" },
        { value: "200+", label: "GLOBAL_REGIONS" },
        { value: "10K+", label: "DAILY_MANIFESTS" },
        { value: "99.9%", label: "SYSTEM_UPTIME" },
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
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">ORIGIN_&_OBJECTIVE</span>
                        </div>
                        <h1 className="titan-text mb-8">
                            Operational. <br />
                            <span className="text-zinc-900 group">Evolution.</span>
                        </h1>
                        <p className="max-w-3xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] leading-relaxed">
                            A global engineering collective dedicated to neutralizing the fundamental complexity of international trade. <br />
                            <span className="text-zinc-800">Architecting the future of velocity.</span>
                        </p>
                    </motion.div>
                </div>

                {/* Tactical Stats Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-white/5 mb-48">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="p-12 border-l border-b border-white/5 relative group hover:bg-zinc-950/40 transition-colors cursor-default"
                        >
                            <div className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 group-hover:text-emerald-500 transition-colors uppercase tabular-nums">
                                {stat.value}
                            </div>
                            <span className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] group-hover:text-zinc-500 transition-colors">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Mission Architecture */}
                <div className="grid lg:grid-cols-12 gap-32 mb-48 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-8 h-[1px] bg-emerald-500" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500">SYSTEM_RATIONALE</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-12">
                            The Complexity. <br />
                            <span className="text-zinc-900 group-hover:text-white transition-all duration-1000">Neutralized.</span>
                        </h2>
                        <div className="space-y-10 text-zinc-600 text-[11px] font-black uppercase tracking-[0.4em] leading-loose max-w-2xl">
                            <p>
                                The global trade layer has remained fragmented, opaque, and archaic for decades.
                                We are the architectural response to that inefficiency.
                            </p>
                            <p>
                                By integrating deep carrier APIs with orbital telemetry and neural documentation logic,
                                we have engineered a singular interface for world commerce.
                            </p>
                            <p className="text-zinc-800">
                                No static spreadsheets. No legacy communication voids. Just pure, real-time
                                operational intelligence at scale.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="lg:col-span-5 elite-card p-16 relative group"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 italic font-black text-7xl text-white select-none pointer-events-none uppercase">
                            Stack_01
                        </div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.6em] mb-12">SYSTEM_CAPABILITIES</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Carrier_Direct_API_Sync", status: "Active" },
                                { label: "Orbital_Telemetry_V4", status: "Active" },
                                { label: "AI_Manifest_Extraction", status: "Active" },
                                { label: "Quantum_Security_Layer", status: "Beta" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-6 border-b border-white/5 last:border-0 group/item">
                                    <span className="text-zinc-700 font-black uppercase tracking-[0.2em] text-[10px] group-hover/item:text-white transition-colors">{item.label}</span>
                                    <div className="flex items-center gap-4 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 group-hover/item:animate-ping" />
                                        {item.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Core Strategic Values */}
                <div className="mb-48">
                    <div className="flex items-end justify-between mb-24">
                        <div>
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                                The Values.
                            </h2>
                            <div className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.8em]">NON_NEGOTIABLE_INFRASTRUCTURE</div>
                        </div>
                        <div className="w-24 h-[1px] bg-white/5 mb-8" />
                    </div>

                    <div className="grid md:grid-cols-4 gap-0 border border-white/5">
                        {values.map((v, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-zinc-950/20 p-12 text-left hover:bg-white transition-all duration-700 group cursor-default border-r border-white/5 last:border-r-0"
                            >
                                <div className="h-14 w-14 bg-zinc-900 text-zinc-600 flex items-center justify-center mb-12 transition-all duration-700 group-hover:rotate-12 group-hover:bg-black group-hover:text-white">
                                    <v.icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-6 text-white group-hover:text-black transition-colors">{v.title}</h4>
                                <p className="text-zinc-700 font-black uppercase tracking-widest text-[9px] leading-loose group-hover:text-zinc-500 transition-colors">{v.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Operations Bridge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-20 bg-zinc-950/40 border border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="grid md:grid-cols-3 gap-16 relative z-10">
                        {[
                            { icon: MapPin, title: "Operations Hub", sub: "Global Multi-Node Presence" },
                            { icon: Mail, title: "Satellite Comm", sub: "ops@phoenix.io" },
                            { icon: Linkedin, title: "Network Access", sub: "Enterprise Portal" },
                        ].map((c, i) => (
                            <div key={i} className="text-center group/item cursor-pointer">
                                <div className="h-20 w-20 bg-black border border-white/5 flex items-center justify-center mx-auto mb-8 group-hover/item:border-emerald-500/50 transition-all duration-700 group-hover/item:scale-110">
                                    <c.icon className="h-6 w-6 text-zinc-800 group-hover/item:text-white transition-colors" />
                                </div>
                                <div className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] mb-2 group-hover/item:text-white transition-colors">{c.title}</div>
                                <div className="text-zinc-900 font-black uppercase tracking-widest text-[9px] group-hover/item:text-emerald-500 transition-colors">{c.sub}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
