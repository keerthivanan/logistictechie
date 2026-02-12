"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrendDataPoint {
    date: string;
    price: number;
    type: 'historical' | 'projected';
}

interface SovereignTrendChartProps {
    data: TrendDataPoint[];
    title: string;
    summary: string;
}

export function SovereignTrendChart({ data, title, summary }: SovereignTrendChartProps) {
    const { t } = useLanguage();
    const maxPrice = Math.max(...data.map(d => d.price)) * 1.1;
    const minPrice = Math.min(...data.map(d => d.price)) * 0.9;

    const points = useMemo(() => {
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.price - minPrice) / (maxPrice - minPrice)) * 100;
            return { x, y, ...d };
        });
    }, [data, minPrice, maxPrice]);

    const pathD = useMemo(() => {
        return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    }, [points]);

    return (
        <div className="w-full bg-zinc-950/40 border border-white/5 p-12 group hover:border-white/10 transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <div className="mb-12">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] block mb-4">{t('market.forecast')}</span>
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">{title}</h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed max-w-xl italic">
                    "{summary}"
                </p>
            </div>

            <div className="h-64 w-full relative group/chart">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <line key={val} x1="0" y1={val} x2="100" y2={val} stroke="white" strokeWidth="0.05" strokeOpacity="0.1" />
                    ))}

                    {/* Gradient Def */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="75%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>

                    {/* The Path */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d={pathD}
                        fill="none"
                        stroke="url(#chartGradient)"
                        strokeWidth="0.8"
                    />

                    {/* Nodes */}
                    {points.map((p, i) => (
                        <motion.circle
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + (i * 0.05) }}
                            cx={p.x}
                            cy={p.y}
                            r="0.5"
                            fill={p.type === 'projected' ? "white" : "#10b981"}
                            className="transition-all hover:r-1"
                        />
                    ))}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-4 border-t border-white/5">
                    {data.filter((_, idx) => idx % 3 === 0).map((d, i) => (
                        <span key={i} className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">
                            {d.date}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-12 flex items-center justify-between">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{t('market.historical')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{t('market.projection')}</span>
                    </div>
                </div>
                <span className="text-[8px] font-black text-zinc-900 tracking-[0.4em] uppercase">{t('market.stable')}</span>
            </div>
        </div>
    );
}
