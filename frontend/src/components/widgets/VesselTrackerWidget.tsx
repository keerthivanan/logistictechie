"use client";

import { useEffect, useState } from "react";
import { Ship, Anchor, Flag } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/logistics";

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
                const apiUrl = BACKEND_URL.replace('/api', '');
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
            <div className="bg-zinc-950/20 border border-white/5 p-6">
                <div className="animate-pulse flex items-center gap-3">
                    <Ship className="w-5 h-5 text-zinc-700" />
                    <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-700 uppercase">SYNCING_FLEET_DATA</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950/20 border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Ship className="w-5 h-5 text-white" />
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">ACTIVE_FLEET</h3>
                </div>
                <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500">
                    {vessels.length} VESSELS
                </span>
            </div>

            <div className="space-y-0 max-h-[300px] overflow-y-auto">
                {vessels.map((vessel, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between py-4 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] transition-all duration-500"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-zinc-800 tracking-[0.4em]">{String(idx + 1).padStart(2, '0')}</span>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{vessel.name}</p>
                                <p className="text-[10px] text-zinc-600 tracking-widest">IMO: {vessel.imo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600">
                            <Flag className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">{vessel.flag || "INT"}</span>
                        </div>
                    </div>
                ))}
                {vessels.length === 0 && (
                    <p className="text-zinc-700 text-center py-4 text-[10px] font-bold tracking-[0.4em] uppercase">NO_VESSELS_DETECTED</p>
                )}
            </div>
        </div>
    );
}
