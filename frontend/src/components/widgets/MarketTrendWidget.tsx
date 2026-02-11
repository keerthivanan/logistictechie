"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrendPoint {
    date: string;
    price: number;
    type: 'historical' | 'projected';
}

interface MarketData {
    commodity: string;
    trend_direction: 'UP' | 'DOWN';
    data: TrendPoint[];
    summary: string;
}

interface MarketTrendWidgetProps {
    initialCountry?: string;
    initialCommodity?: string;
    className?: string;
}

export function MarketTrendWidget({ initialCountry, initialCommodity, className }: MarketTrendWidgetProps) {
    const [market, setMarket] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [country, setCountry] = useState(initialCountry || "GLOBAL");
    const [searchInput, setSearchInput] = useState("");
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const { t, direction } = useLanguage();
    const isRTL = direction === 'rtl';

    const fetchData = async (targetCountry: string = country) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.get(`${apiUrl}/api/ai/trend`, {
                params: { country: targetCountry }
            });
            if (res.data.success) {
                setMarket(res.data.data);
                setCountry(targetCountry.toUpperCase());
            }
        } catch (e) {
            console.error("Trend Fetch Error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(initialCountry || "GLOBAL");
    }, [initialCountry]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            fetchData(searchInput);
        }
    };

    if (loading || !market) return (
        <div className="h-64 w-full bg-card/50 rounded-xl animate-pulse border border-border" />
    );

    // Chart Dimensions
    const width = 600;
    const height = 200;
    const padding = 20;

    // Scale Logic
    const maxPrice = Math.max(...market.data.map(d => d.price)) * 1.1;
    const minPrice = Math.min(...market.data.map(d => d.price)) * 0.9;

    const getX = (index: number) => (index / (market.data.length - 1)) * (width - padding * 2) + padding;
    const getY = (price: number) => height - ((price - minPrice) / (maxPrice - minPrice)) * (height - padding * 2) - padding;

    // SVG Path Generation
    const points = market.data.map((d, i) => `${getX(i)},${getY(d.price)}`).join(" ");

    // Gradient Area
    const areaPoints = `${getX(0)},${height} ${points} ${getX(market.data.length - 1)},${height}`;

    return (
        <div className={`w-full bg-card/50 border border-border rounded-xl p-6 relative overflow-hidden group ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-zinc-400">{t('widgets.marketTrend.title')}</span>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${market.trend_direction === 'UP' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {market.trend_direction === 'UP' ? t('widgets.marketTrend.bullish') : t('widgets.marketTrend.bearish')}
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        {market.commodity} <span className="text-zinc-500 font-medium">({country})</span>
                    </h3>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder={t('widgets.officeLocator.searchPlaceholder')}
                        className="bg-card/30 border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 w-32 md:w-40"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors">
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </form>
            </div>

            {/* CHART */}
            <div className="relative h-[220px] w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
                    {/* Defs for Gradient */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={market.trend_direction === 'UP' ? '#ef4444' : '#10b981'} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={market.trend_direction === 'UP' ? '#ef4444' : '#10b981'} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area Fill */}
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        d={`M${areaPoints} Z`}
                        fill="url(#chartGradient)"
                    />

                    {/* Line */}
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={`M${points}`}
                        fill="none"
                        stroke={market.trend_direction === 'UP' ? '#ef4444' : '#10b981'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points */}
                    {market.data.map((d, i) => (
                        <g key={i}>
                            <circle
                                cx={getX(i)}
                                cy={getY(d.price)}
                                r="4"
                                className={`fill-black stroke-2 ${d.type === 'projected' ? 'stroke-white' : (market.trend_direction === 'UP' ? 'stroke-red-500' : 'stroke-emerald-500')}`}
                            />
                            {/* Hover Trigger */}
                            <rect
                                x={getX(i) - 10}
                                y={0}
                                width={20}
                                height={height}
                                fill="transparent"
                                onMouseEnter={() => setHoveredPoint(i)}
                                onMouseLeave={() => setHoveredPoint(null)}
                                className="cursor-crosshair"
                            />
                        </g>
                    ))}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredPoint !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{
                            left: `${(hoveredPoint / (market.data.length - 1)) * 100}%`,
                            top: `${(getY(market.data[hoveredPoint].price) / height) * 100}%`,
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <div className="bg-card border border-border px-3 py-2 rounded-lg shadow-xl text-center min-w-[100px]" dir="ltr">
                            <div className="text-xs text-zinc-500 mb-1">{market.data[hoveredPoint].date}</div>
                            <div className="text-lg font-bold text-white">${market.data[hoveredPoint].price}</div>
                            {market.data[hoveredPoint].type === 'projected' && (
                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{t('widgets.marketTrend.forecast')}</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs font-medium border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" /> {t('widgets.marketTrend.historical')}
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-white border border-zinc-500" /> {t('widgets.marketTrend.prediction')} ({t('widgets.marketTrend.confidence')}: 92%)
                </div>
            </div>

            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                <span className="text-white font-semibold">{t('widgets.marketTrend.analysis')}</span> {market.summary}
            </p>
        </div>
    );
}
