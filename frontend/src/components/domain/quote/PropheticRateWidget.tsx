"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BACKEND_URL } from "@/lib/logistics";

interface PropheticWidgetProps {
    origin: string;
    destination: string;
    currentPrice: number;
}

interface PredictionData {
    predicted_price_30d: number;
    trend: "UP" | "DOWN" | "STABLE";
    variance_percent: number;
    action: "BOOK_NOW" | "WAIT";
    reason: string;
    ai_advice: string;
    confidence_score: number;
}

export function PropheticRateWidget({ origin, destination, currentPrice }: PropheticWidgetProps) {
    const [prediction, setPrediction] = useState<PredictionData | null>(null);
    const [trendData, setTrendData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = BACKEND_URL;

                // 1. Fetch Prediction
                const predRes = await fetch(`${apiUrl}/api/ai/predict`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ origin, destination, price: currentPrice })
                });
                const pData = await predRes.json();
                if (pData.success) setPrediction(pData.data);

                // 2. Fetch Market Trend for Origin
                const country = origin.split(',').pop()?.trim() || "GLOBAL";
                const trendRes = await fetch(`${apiUrl}/api/ai/trend?country=${country}`);
                const tData = await trendRes.json();
                if (tData.success) setTrendData(tData.data);

            } catch (e) {
                console.error("AI Insights Failed", e);
            } finally {
                setLoading(false);
            }
        };

        if (currentPrice > 0) fetchData();
    }, [origin, destination, currentPrice]);

    if (loading) return (
        <div className="animate-pulse h-24 bg-white/5 border border-white/10 w-full mb-8 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">SYNCHRONIZING SOVEREIGN INTELLIGENCE...</span>
        </div>
    );

    if (!prediction) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="bg-gradient-to-r from-emerald-900/20 to-black border border-emerald-500/20 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-8">
                    {/* Action Block */}
                    <div className="flex items-start gap-6 flex-1">
                        <div className={`p-4 ${prediction.action === 'BOOK_NOW' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'} border border-white/5`}>
                            {prediction.trend === 'UP' ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Sovereign_Cortex_V1</span>
                                <span className="text-[10px] font-bold tracking-widest bg-white/10 text-white px-2 py-0.5">CONFIDENCE: {prediction.confidence_score}%</span>
                            </div>

                            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
                                {prediction.action === 'BOOK_NOW' ? "LOCK RATES IMMEDIATELY." : "ADVISORY: HOLD BOOKING."}
                            </h3>

                            <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                                {prediction.ai_advice}
                            </p>
                        </div>
                    </div>

                    {/* Trend Sparkline Block */}
                    {trendData && (
                        <div className="md:w-64 border-l border-white/5 md:pl-8 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-3">Market Origin: {trendData.country}</span>
                            <div className="h-12 w-full flex items-end gap-1 mb-3">
                                {trendData.data.slice(-10).map((d: any, i: number) => (
                                    <div
                                        key={i}
                                        className={`flex-1 transition-all duration-500 ${d.type === 'projected' ? 'opacity-40 border-t border-dashed border-white' : (prediction.trend === 'UP' ? 'bg-emerald-500/40' : 'bg-blue-500/40')}`}
                                        style={{ height: `${(d.price / Math.max(...trendData.data.map((x: any) => x.price))) * 100}%` }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-zinc-500">Vol: High</span>
                                <span className={prediction.trend === 'UP' ? 'text-emerald-500' : 'text-blue-500'}>
                                    {prediction.trend} Trend
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
