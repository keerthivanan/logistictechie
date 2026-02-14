"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Cpu, Globe, Zap, Ship } from "lucide-react";

const CARRIER_LOGS = [
    { text: "Executing Sovereign Corridor Audit v5.0...", icon: Globe },
    { text: "Predicting Geopolitical Risk (Suez/Malacca Nodes)...", icon: ShieldCheck },
    { text: "Syncing Regional Tax Node (VAT/GST/Sovereign)...", icon: Cpu },
    { text: "Maersk-Alpha Node Calibration: Protocol 2026...", icon: Zap },
    { text: "Carrier Matrix Expansion: 12-Tier Audit...", icon: Ship },
    { text: "Finalizing Forensic Pricing Mathematics...", icon: ShieldCheck },
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
        <div className="flex flex-col items-center justify-center py-48 bg-black relative overflow-hidden">

            <div className="relative mb-24">
                <div className="w-48 h-48 rounded-[48px] border border-white/10 relative flex items-center justify-center bg-white/[0.02] backdrop-blur-3xl">
                    <div className="text-white">
                        <CurrentIcon className="w-20 h-20" />
                    </div>

                    {/* Industrial corners - Static */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/20" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/20" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/20" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/20" />
                </div>
            </div>

            <h3 className="text-5xl md:text-8xl font-black text-white/20 mb-12 uppercase tracking-tighter italic text-center">
                Syncing <span className="text-white/5">Protocol.</span>
            </h3>

            <div className="h-20 px-10 flex items-center justify-center text-center">
                <p className="text-white text-xl font-bold uppercase tracking-tighter italic">
                    {CARRIER_LOGS[logIndex].text}
                </p>
            </div>

            {/* Sharp Progress Bar - Static */}
            <div className="w-[600px] max-w-full h-[4px] bg-white/5 mt-24 overflow-hidden relative rounded-full">
                <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="mt-16 flex gap-6 items-center bg-white/[0.02] border border-white/10 px-12 py-5 rounded-full backdrop-blur-3xl">
                <div className="flex h-3 w-3 bg-white rounded-full shadow-[0_0_15px_white]" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em]">
                    NETWORK_STATUS: <span className="text-white">ENCRYPTED_L3</span>
                </span>
            </div>
        </div>
    );
}
