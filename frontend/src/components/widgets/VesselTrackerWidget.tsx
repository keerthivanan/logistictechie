"use client";

import { useEffect, useState } from "react";
import { Ship, Anchor, Flag } from "lucide-react";
import axios from "axios";

interface Vessel {
    name: string;
    imo: string;
    flag: string;
    operator: string;
}

export function VesselTrackerWidget() {
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVessels() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await axios.get(`${apiUrl}/api/vessels/active`);
                setVessels(res.data.vessels || []);
            } catch (error) {
                console.error("Failed to fetch vessels:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVessels();
    }, []);

    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <div className="animate-pulse flex items-center gap-3">
                    <Ship className="w-6 h-6 text-cyan-400" />
                    <span className="text-gray-400">Loading Active Fleet...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Ship className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Active Fleet</h3>
                </div>
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-bold">
                    {vessels.length} Vessels
                </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {vessels.map((vessel, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <Anchor className="w-5 h-5 text-cyan-500/70" />
                            <div>
                                <p className="text-white font-semibold">{vessel.name}</p>
                                <p className="text-xs text-gray-500">IMO: {vessel.imo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Flag className="w-4 h-4" />
                            <span className="text-xs uppercase">{vessel.flag || "INT"}</span>
                        </div>
                    </div>
                ))}
                {vessels.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No vessels found</p>
                )}
            </div>
        </div>
    );
}

