"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrendDataPoint {
    date: string;
    price: number;
    type: 'historical' | 'projected';
}

interface MarketForecastChartProps {
    data: TrendDataPoint[];
    title: string;
    summary: string;
}

export function MarketForecastChart({ data, title, summary }: MarketForecastChartProps) {
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
        <div className="w-full bg-white border border-slate-100 rounded-3xl p-10 group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            </div>

            <div className="mb-10">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] block mb-4">{t('market.forecast')}</span>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">{title}</h3>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl border-l-2 border-slate-100 pl-6">
                    {summary}
                </p>
            </div>

            <div className="h-72 w-full relative group/chart bg-slate-50/30 rounded-2xl border border-slate-50 p-6">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <line key={val} x1="0" y1={val} x2="100" y2={val} stroke="#e2e8f0" strokeWidth="0.1" />
                    ))}

                    {/* Gradient Def */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.6" />
                            <stop offset="75%" stopColor="#2563eb" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
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
                        strokeWidth="1.2"
                        strokeLinecap="round"
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
                            r="0.8"
                            fill={p.type === 'projected' ? "#ffffff" : "#2563eb"}
                            stroke={p.type === 'projected' ? "#2563eb" : "none"}
                            strokeWidth="0.2"
                            className="transition-all hover:r-1.5"
                        />
                    ))}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-6 right-6 flex justify-between pt-4 border-t border-slate-100">
                    {data.filter((_, idx) => idx % 3 === 0).map((d, i) => (
                        <span key={i} className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                            {d.date}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
                <div className="flex gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('market.historical')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 border-2 border-blue-600 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('market.projection')}</span>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-200 tracking-[0.4em] uppercase">{t('market.stable')}</span>
            </div>
        </div>
    );
}
