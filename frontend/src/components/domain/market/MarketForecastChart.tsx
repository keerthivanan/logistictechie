"use client";
import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendDataPoint {
    date: string;
    price: number;
    type: 'historical' | 'projected';
}

interface MarketForecastChartProps {
    data: TrendDataPoint[];
    title: string;
    summary: string;
    className?: string;
}

export function MarketForecastChart({ data, title, summary, className }: MarketForecastChartProps) {
    const { t } = useLanguage();

    if (!data || data.length === 0) return null;

    const maxPrice = Math.max(...data.map((d: TrendDataPoint) => d.price)) * 1.1;
    const minPrice = Math.min(...data.map((d: TrendDataPoint) => d.price)) * 0.9;

    const points = useMemo(() => {
        return data.map((d: TrendDataPoint, i: number) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.price - minPrice) / (maxPrice - minPrice)) * 100;
            return { x, y, ...d };
        });
    }, [data, minPrice, maxPrice]);

    const pathD = useMemo(() => {
        return points.map((p: any, i: number) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    }, [points]);

    return (
        <div className={cn("w-full bg-zinc-950/40 border-2 border-white/10 rounded-[64px] p-16 group/chart shadow-2xl backdrop-blur-3xl relative overflow-hidden", className)}>
            <div className="absolute top-12 right-12 p-12 opacity-[0.03] pointer-events-none italic text-6xl font-black tracking-tighter text-white select-none">DATA_PULSE_V8</div>

            <div className="mb-16">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-[1px] bg-white/40" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em] block">{t('market.forecast') || "PROPHETIC_FORECAST_SYNC"}</span>
                </div>
                <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase mb-8 leading-none italic group-hover/chart:text-zinc-200 transition-colors">
                    {title.split('|')[0]} <br />
                    <span className="text-white/20 select-none">{title.split('|')[1]}</span>
                </h3>
                <p className="text-[14px] font-black text-white/40 uppercase tracking-widest leading-relaxed max-w-4xl border-l-2 border-white/10 pl-10 italic">
                    {summary}
                </p>
            </div>

            <div className="h-[400px] w-full relative bg-black/40 rounded-[48px] border-2 border-white/5 p-12 overflow-visible">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Horizontal Scaffolding */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <line key={val} x1="0" y1={val} x2="100" y2={val} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                    ))}

                    {/* Sovereign Trend Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    />

                    {/* Nodes - The Telemetry Anchors */}
                    {points.map((p: any, i: number) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={p.type === 'projected' ? "1.2" : "0.8"}
                            fill={p.type === 'projected' ? "black" : "white"}
                            stroke="white"
                            strokeWidth="0.4"
                            className="transition-all hover:r-3 cursor-crosshair"
                        />
                    ))}
                </svg>

                {/* X-Axis Registry */}
                <div className="absolute -bottom-12 left-12 right-12 flex justify-between pt-8 border-t border-white/10">
                    {data.filter((_: TrendDataPoint, idx: number) => idx % 3 === 0 || idx === data.length - 1).map((d: TrendDataPoint, i: number) => (
                        <span key={i} className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">
                            {d.date}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-white/10 pt-12">
                <div className="flex gap-16">
                    <div className="flex items-center gap-4 bg-white/5 px-8 py-3 rounded-full border border-white/10">
                        <div className="w-3 h-3 bg-white shadow-[0_0_10px_white] rounded-full" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">{t('market.historical') || "HISTORICAL_PULSE"}</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 px-8 py-3 rounded-full border border-white/10">
                        <div className="w-3 h-3 border-2 border-white rounded-full" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">{t('market.projection') || "SOVEREIGN_PROJECTION"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em] mb-2">NETWORK_MODE</span>
                        <span className="text-2xl font-black text-emerald-500 tracking-tighter uppercase italic tabular-nums">STABLE_CORRIDOR_V2</span>
                    </div>
                    <div className="h-16 w-[1px] bg-white/10" />
                    <BarChart3 className="w-12 h-12 text-white/10" />
                </div>
            </div>
        </div>
    );
}
