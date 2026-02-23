'use client';

import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowLeft, Hourglass, Cpu } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function ServicesComingSoon() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col items-center justify-center p-4">
            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full text-center space-y-8"
            >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 relative">
                    <Hourglass className="w-10 h-10 text-white animate-spin-slow" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter uppercase font-outfit">Operational Hardening</h1>
                    <p className="text-zinc-500 font-medium">
                        This tactical node is currently undergoing <span className="text-white">Sovereign Hardening</span>. High-fidelity integration for this service is slated for the next synchronization cycle.
                    </p>
                </div>

                <div className="p-6 bg-zinc-950 border border-white/5 rounded-[24px] text-left space-y-4">
                    <div className="flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node Status: Building Protocol</span>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                            />
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                            <span>Alpha Core</span>
                            <span>75% Synchronized</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/" className="flex-1 px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Return to Base
                    </Link>
                    <Link href="/contact" className="flex-1 px-8 py-4 bg-transparent border border-white/10 text-white font-black rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                        Inquire Early <Sparkles className="w-4 h-4" />
                    </Link>
                </div>

                <p className="text-[8px] text-zinc-800 font-black uppercase tracking-[0.5em] pt-8">
                    OMEGO SOVEREIGN OS // VER: 1.0.4-LOCKED
                </p>
            </motion.div>
        </div>
    );
}
