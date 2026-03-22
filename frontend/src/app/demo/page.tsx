'use client';

import { motion } from 'framer-motion';
import { Shield, Activity, Globe, Zap, Cpu, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Prism from '@/components/visuals/Prism';

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden">
            <Navbar />

            {/* Simulation Background */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <Prism />
            </div>

            <div className="relative z-10 pt-32 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    >
                        <Activity className="w-3 h-3 animate-pulse" />
                        Live Demo
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter max-w-4xl">
                        SEE HOW <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">CARGOLINK WORKS.</span>
                    </h1>

                    <p className="text-xl text-zinc-500 max-w-2xl font-medium">
                        Explore the CargoLink platform — from submitting a freight request to receiving competitive quotes from verified forwarders.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
                        {[
                            { icon: Globe, label: "Global Coverage", value: "195+", desc: "Countries supported." },
                            { icon: Zap, label: "Quote Speed", value: "< 24h", desc: "Average time to first quote." },
                            { icon: Cpu, label: "AI Matching", value: "Active", desc: "Smart forwarder recommendations." }
                        ].map((stat, i) => (stat &&
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="bg-zinc-950 border border-white/5 p-6 rounded-[24px] text-left hover:border-white/20 transition-all group"
                            >
                                <stat.icon className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-1">{stat.label}</div>
                                <div className="text-2xl font-semibold text-white mb-2">{stat.value}</div>
                                <div className="text-xs text-zinc-500">{stat.desc}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-12">
                        <Link href="/dashboard" className="px-12 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                            Open Dashboard <Shield className="w-4 h-4" />
                        </Link>
                        <Link href="/" className="px-12 py-4 bg-transparent border border-white/10 text-white font-semibold rounded-full hover:bg-white/5 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
