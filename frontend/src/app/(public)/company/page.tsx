"use client";

import { motion } from "framer-motion";
import { Target, Users, Award, Globe, MapPin, Mail, Linkedin, CheckCircle, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function CompanyPage() {
    const stats = [
        { label: "FOUNDED", value: "2015" },
        { label: "PROJECTS", value: "200+" },
        { label: "NODES", value: "48+" },
        { label: "OPERATIVES", value: "1.2K" }
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
                        <span className="arch-label mb-12 block">ABOUT</span>
                        <h1 className="arch-heading mb-24">Design <br />Philosophy</h1>
                    </div>
                </motion.div>

                {/* Narrative Section - Split Layout */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="grid lg:grid-cols-[1.5fr,1fr] gap-32 border-t border-white/5 pt-32"
                >
                    <div className="space-y-24">
                        <p className="text-3xl font-light text-zinc-400 leading-relaxed max-w-3xl">
                            We believe <strong className="text-white">logistics</strong> should enhance human experience while respecting the natural environment. Our practice focuses on creating spaces that are both <strong className="text-white">functional and poetic</strong>.
                        </p>
                        <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl">
                            Founded in 2015, our studio has completed over 200 projects across maritime, aerial, and terrestrial sectors. Each project begins with careful listening and ends with thoughtful execution, ensuring military-grade precision in every transit node.
                        </p>
                    </div>

                    <div className="space-y-16">
                        <span className="arch-label block">SYSTEMS</span>
                        {[
                            { title: "Network Architecture", desc: "Crafting supply chains that reflect modern velocity while maintaining operational integrity." },
                            { title: "Dynamic Synchronization", desc: "Designing functional transit flows that enhance global trade environments." }
                        ].map((item, idx) => (
                            <div key={idx} className="arch-detail-line">
                                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-zinc-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Monumental Stats */}
                <div className="mt-96 grid grid-cols-2 md:grid-cols-4 gap-16 border-t border-white/5 pt-32">
                    {stats.map((stat, idx) => (
                        <div key={idx}>
                            <span className="arch-label mb-8 block">{stat.label}</span>
                            <div className="text-6xl font-light text-white tracking-tighter">
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Context */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">NEXT_PHASE</span>
                    <h2 className="arch-heading mb-16 italic">Ready to Migrate?</h2>
                    <Link href="/contact">
                        <button className="h-24 px-16 border border-white text-[11px] font-bold uppercase tracking-[1em] transition-all hover:bg-white hover:text-black">
                            CONTACT_ARCHITECTURE
                        </button>
                    </Link>
                </div>
            </div>

            {/* Minimal Sub-footer */}
            <div className="border-t border-white/5 py-32">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-800 uppercase">
                    <span>© 2026 PHOENIX_OS</span>
                    <span>STRUCTURAL_INTEGRITY_VERIFIED</span>
                </div>
            </div>
        </main>
    );
}
