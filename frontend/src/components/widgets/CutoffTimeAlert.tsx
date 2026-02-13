"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/logistics";

interface Deadline {
    type: string;
    cutoffDate: string;
    description?: string;
}

interface CutoffAlertProps {
    voyage?: string;
    imo?: string;
}

export function CutoffTimeAlert({ voyage, imo }: CutoffAlertProps) {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!voyage || !imo) return;

        async function fetchDeadlines() {
            setLoading(true);
            setError(null);
            try {
                const apiUrl = BACKEND_URL.replace('/api', '');
                const res = await axios.get(`${apiUrl}/api/deadlines?voyage=${voyage}&imo=${imo}`);
                if (res.data.success) {
                    setDeadlines(res.data.deadlines || []);
                } else {
                    setError(res.data.error || "Failed to fetch deadlines");
                }
            } catch (err) {
                setError("Unable to retrieve deadline information");
            } finally {
                setLoading(false);
            }
        }
        fetchDeadlines();
    }, [voyage, imo]);

    if (!voyage || !imo) {
        return (
            <div className="bg-zinc-950/20 border-l border-white/10 p-6">
                <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-zinc-700" />
                    <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase">SELECT_VOYAGE_TO_VIEW_CUTOFFS</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-zinc-950/20 border border-white/5 p-6">
                <div className="animate-pulse flex items-center gap-3">
                    <Clock className="w-4 h-4 text-zinc-700" />
                    <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-700 uppercase">SYNCING_DEADLINES</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-zinc-950/20 border-l border-white/20 p-6">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-400 uppercase">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950/20 border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Clock className="w-4 h-4 text-white" />
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">CUTOFF_TIMES</h4>
            </div>

            {deadlines.length > 0 ? (
                <div className="space-y-0">
                    {deadlines.map((deadline, idx) => (
                        <div key={idx} className="flex items-center justify-between py-4 border-b border-white/5 last:border-b-0">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span className="text-sm font-bold text-white uppercase tracking-wider">{deadline.type}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] tabular-nums">
                                {new Date(deadline.cutoffDate).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-zinc-700 text-[10px] font-bold tracking-[0.4em] uppercase">NO_DEADLINE_DATA</p>
            )}
        </div>
    );
}
