"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck, Cpu, Globe, Zap } from "lucide-react";

const CARRIER_LOGS = [
    { text: "Executing Sovereign Corridor Analysis...", icon: Globe },
    { text: "Predicting Geopolitical Risk Matrix...", icon: ShieldCheck },
    { text: "Carbon Compliance Audit: Protocol 2026...", icon: Globe },
    { text: "Carrier Handshake: Deep Maersk-Alpha...", icon: Zap },
    { text: "Carrier Handshake: CMA Core-Net...", icon: Zap },
    { text: "Processing Total Landed Cost Estimate...", icon: Cpu },
    { text: "Finalizing King-Level Logistics Advisory...", icon: ShieldCheck },
];

export function PremiumSearchingState() {
    const [logIndex, setLogIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return p + 0.8;
            });
        }, 80);

        const logInterval = setInterval(() => {
            setLogIndex(i => (i + 1) % CARRIER_LOGS.length);
        }, 1800);

        return () => {
            clearInterval(interval);
            clearInterval(logInterval);
        };
    }, []);

    const CurrentIcon = CARRIER_LOGS[logIndex].icon;

    return (
        <div className="flex flex-col items-center justify-center py-32 ultra-card relative overflow-hidden bg-mesh-dark">
            {/* Holographic scanner effect */}
            <motion.div
                animate={{ y: [0, 400, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.5)] z-20 pointer-events-none"
            />

            <div className="relative mb-16">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{
                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-32 h-32 rounded-3xl border border-white/10 relative flex items-center justify-center bg-white/[0.02] backdrop-blur-2xl"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={logIndex}
                            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                            className="text-white"
                        >
                            <CurrentIcon className="w-12 h-12" />
                        </motion.div>
                    </AnimatePresence>

                    {/* Iridescent Ring */}
                    <div className="absolute inset-0 rounded-3xl iridescent-border opacity-50" />
                </motion.div>

                {/* Satellite orbital dots */}
                {[0, 120, 240].map((angle, i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-30px]"
                    >
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full glow-white"
                            style={{ transform: `rotate(${angle}deg) translate(0, -100%)` }}
                        />
                    </motion.div>
                ))}
            </div>

            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-[-0.05em] text-shadow-glow">
                Synchronizing Protocol
            </h3>

            <div className="h-10 px-8 flex items-center justify-center text-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={logIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                        {CARRIER_LOGS[logIndex].text}
                    </motion.p>
                </AnimatePresence>
            </div>

            <div className="w-80 h-[3px] bg-white/5 rounded-full mt-12 overflow-hidden relative">
                <motion.div
                    className="h-full bg-gradient-to-r from-white/20 via-white to-white/20 shadow-[0_0_20px_white]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <div className="mt-10 flex gap-4 items-center bg-white/[0.03] border border-white/5 rounded-full px-6 py-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    Network Status: ULTRA-STABLE
                </span>
            </div>
        </div>
    );
}
