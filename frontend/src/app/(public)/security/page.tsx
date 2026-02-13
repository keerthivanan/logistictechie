"use client";

import { motion } from "framer-motion";
import { Lock, Key, FileCheck, CheckCircle2, Eye, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SecurityPage() {
    const { t } = useLanguage();

    const pillars = [
        {
            id: "01",
            title: "DATA_FABRIC_ENCRYPTION",
            desc: "All data in transit and at rest is secured using AES-256-GCM. Our sovereign database architecture ensures that sensitive shipment records are atomically isolated.",
            icon: Lock
        },
        {
            id: "02",
            title: "LOGISTICS_AUTH_CORE",
            desc: "Multi-factor authentication via NextAuth.js protocols. Session integrity is maintained through cryptographic JSON Web Tokens with rotating secrets.",
            icon: Key
        },
        {
            id: "03",
            title: "ZERO_TRUST_FRAMEWORK",
            desc: "Every request is verified regardless of origin. Network segmentation, micro-perimeters, and continuous validation ensure no implicit trust exists within the system.",
            icon: Shield
        },
        {
            id: "04",
            title: "THREAT_SURVEILLANCE",
            desc: "24/7 automated threat monitoring across all global nodes. Anomaly detection powered by AI identifies and neutralizes suspicious patterns in real-time.",
            icon: Eye
        }
    ];

    const benchmarks = [
        "ISO_27001_COMPLIANT",
        "SOC2_TYPE_II_AUDITED",
        "GDPR_SOVEREIGN_HANDLING",
        "AES_256_GCM_ENFORCED",
        "ZERO_TRUST_VERIFIED",
        "QUANTUM_READY_2026"
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">SECURITY_DOMAIN // 2026</span>
                        <h1 className="arch-heading">Security Architecture</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            Enterprise-grade protection for the world&apos;s most critical <strong className="text-white">logistics data</strong>.
                        </p>
                    </div>
                </motion.div>

                {/* Security Pillars */}
                <div className="grid md:grid-cols-2 gap-0 border-y border-white/5">
                    {pillars.map((pillar, idx) => (
                        <motion.div
                            key={pillar.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="p-16 border-r last:border-r-0 border-b last:border-b-0 border-white/5 group hover:bg-zinc-950/20 transition-all duration-700"
                        >
                            <div className="space-y-12">
                                <div className="flex justify-between items-start">
                                    <span className="arch-number text-zinc-900 group-hover:text-white transition-all">{pillar.id}</span>
                                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-all">
                                        <pillar.icon className="h-5 w-5 text-zinc-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-light text-white uppercase italic tracking-tighter group-hover:pl-4 transition-all duration-700">{pillar.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">{pillar.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Compliance Benchmarks */}
                <div className="mt-96 grid lg:grid-cols-[1fr,2fr] gap-32 border-t border-white/5 pt-32">
                    <div className="space-y-12">
                        <span className="arch-label mb-12 block">CERTIFICATIONS</span>
                        <h2 className="text-5xl font-light text-white leading-tight">Compliance Benchmarks</h2>
                        <div className="arch-detail-line h-48 opacity-20 hidden lg:block" />
                    </div>
                    <div className="p-16 bg-zinc-950/20 border border-white/5">
                        <h3 className="text-xl font-bold tracking-widest uppercase mb-12 flex items-center gap-4 text-white">
                            <FileCheck className="h-5 w-5" />
                            COMPLIANCE_BENCHMARKS
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
                            {benchmarks.map((benchmark, idx) => (
                                <div key={idx} className="flex items-center gap-4 py-4 border-b border-white/5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-400">{benchmark}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">ENCRYPTION_ACTIVE</span>
                    <h2 className="arch-heading italic mb-16">Zero Trust.</h2>
                </div>
            </div>
        </main>
    );
}
