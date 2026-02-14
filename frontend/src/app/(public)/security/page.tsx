"use client";

import { motion } from "framer-motion";
import { Lock, Key, FileCheck, CheckCircle2, Eye, Shield, Zap } from "lucide-react";
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
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-64 group"
                >
                    <div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">SECURITY_DOMAIN_PROTOCOL</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            {t('securityPage.title') || "Security"} <br /><span className="text-white/20 italic">Shield.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl md:text-3xl font-bold text-white/40 leading-tight max-w-xl md:text-right md:ml-auto uppercase tracking-tighter opacity-80">
                            Enterprise-grade protection for the world&apos;s most critical <strong className="text-white">logistics data</strong>.
                        </p>
                    </div>
                </motion.div>

                {/* Security Pillars Grid */}
                <div className="grid md:grid-cols-2 gap-0 border-y border-white/5 bg-zinc-950/20 backdrop-blur-3xl">
                    {pillars.map((pillar, idx) => (
                        <motion.div
                            key={pillar.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="p-10 md:p-20 border-r last:border-r-0 border-b last:border-b-0 border-white/5 group hover:bg-white/[0.02] transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.01] group-hover:opacity-10 transition-all">
                                <pillar.icon className="w-48 h-48 text-white" />
                            </div>
                            <div className="space-y-12 relative z-10">
                                <div className="flex justify-between items-start">
                                    <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors tracking-tighter tabular-nums leading-none">{pillar.id}</span>
                                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500">
                                        <pillar.icon className="h-6 w-6 transition-transform group-hover:rotate-12" />
                                    </div>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter group-hover:pl-6 group-hover:italic transition-all duration-700 leading-none">{pillar.title}</h3>
                                <p className="text-white/30 text-[13px] font-bold uppercase tracking-widest leading-loose max-w-sm group-hover:text-white/60 transition-colors">{pillar.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Compliance Benchmarks - Tactical Matrix */}
                <div className="mt-64 grid lg:grid-cols-[1fr,3fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />
                    <div className="space-y-16">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">CERTIFICATIONS</span>
                        <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.8] uppercase tracking-tighter group-hover:italic transition-all duration-700">Compliance Benchmarks</h2>
                    </div>
                    <div className="p-12 md:p-20 bg-zinc-950/40 rounded-[64px] border border-white/5 backdrop-blur-3xl shadow-2xl group-hover:border-white/10 transition-all duration-700">
                        <div className="flex items-center gap-6 mb-16 pb-8 border-b border-white/5">
                            <FileCheck className="h-8 w-8 text-white/20" />
                            <h3 className="text-[10px] font-black tracking-[0.6em] uppercase text-white/60">SYSTEM_COMPLIANCE_MATRIX_v2.1</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-12">
                            {benchmarks.map((benchmark, idx) => (
                                <div key={idx} className="flex items-center gap-8 py-6 border-b border-white/5 group/line hover:bg-white/5 px-8 rounded-3xl transition-all">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[12px] font-black tracking-[0.4em] text-white/40 group-hover/line:text-white transition-colors">{benchmark}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-12 block">ENCRYPTION_ACTIVE</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-12 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">Zero Trust.</h2>
                </div>
            </div>
        </main>
    );
}
