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
        <div className="flex flex-col items-center justify-center py-40 bg-black relative overflow-hidden">

            <div className="relative mb-20">
                <div className="w-40 h-40 rounded-none border border-white/10 relative flex items-center justify-center bg-white/[0.01]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={logIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-white"
                        >
                            <CurrentIcon className="w-16 h-16" />
                        </motion.div>
                    </AnimatePresence>

                    {/* Industrial corners - Static */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/20" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/20" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/20" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20" />
                </div>
            </div>

            <h3 className="text-5xl md:text-6xl font-bold text-white mb-8 uppercase tracking-tight">
                Syncing <span className="text-white/20">Protocol.</span>
            </h3>

            <div className="h-12 px-10 flex items-center justify-center text-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={logIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="titan-label text-gray-500"
                    >
                        {CARRIER_LOGS[logIndex].text}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Sharp Progress Bar */}
            <div className="w-96 h-[2px] bg-white/5 mt-16 overflow-hidden relative">
                <motion.div
                    className="h-full bg-white shadow-[0_0_30px_white]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <div className="mt-12 flex gap-5 items-center bg-white/[0.01] border border-white/5 px-8 py-3 rounded-none">
                <div className="flex h-2 w-2 bg-white animate-pulse shadow-[0_0_15px_white]" />
                <span className="titan-label text-gray-400">
                    NETWORK_STATUS: <span className="text-white">ENCRYPTED</span>
                </span>
            </div>
        </div>
    );
}

