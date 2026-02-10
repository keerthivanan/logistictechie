"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import axios from "axios";

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
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-300 text-sm">Select a voyage to view cutoff times</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="animate-pulse flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Loading deadlines...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h4 className="text-white font-bold uppercase text-sm tracking-wider">Cutoff Times</h4>
            </div>

            {deadlines.length > 0 ? (
                <div className="space-y-2">
                    {deadlines.map((deadline, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-black/40 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span className="text-white text-sm">{deadline.type}</span>
                            </div>
                            <span className="text-cyan-400 text-xs font-mono">
                                {new Date(deadline.cutoffDate).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm">No deadline information available</p>
            )}
        </div>
    );
}

