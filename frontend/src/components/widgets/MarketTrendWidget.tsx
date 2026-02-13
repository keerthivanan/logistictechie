"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { BACKEND_URL } from "@/lib/logistics";

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
            const apiUrl = BACKEND_URL.replace('/api', '');
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
        <div className="h-64 w-full bg-card/50 rounded-none animate-pulse border border-border" />
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
        <div className={`w-full bg-black border border-white/5 rounded-none p-6 relative overflow-hidden group ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="arch-label">{t('widgets.marketTrend.title')?.toUpperCase() || "MARKET_TELEMETRY"}</span>
                        <div className={`text-[9px] font-black px-2 py-0.5 border ${market.trend_direction === 'UP' ? 'border-zinc-800 text-zinc-500' : 'border-emerald-500/20 text-emerald-500'}`}>
                            {market.trend_direction === 'UP' ? (t('widgets.marketTrend.bullish')?.toUpperCase() || "BULLISH_SIGNAL") : (t('widgets.marketTrend.bearish')?.toUpperCase() || "BEARISH_SIGNAL")}
                        </div>
                    </div>
                    <h3 className="text-3xl font-light text-white tracking-tighter flex items-center gap-3 italic">
                        {market.commodity} <span className="text-zinc-800 font-bold not-italic text-sm tracking-[0.2em]">[{country}]</span>
                    </h3>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-0">
                    <input
                        type="text"
                        placeholder={t('widgets.officeLocator.searchPlaceholder')?.toUpperCase() || "NODE_SCAN"}
                        className="bg-transparent border border-white/10 rounded-none px-4 py-2 text-[10px] font-bold text-white placeholder:text-zinc-900 focus:outline-none focus:border-white transition-all w-32 md:w-48 uppercase"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="h-9 w-12 bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors">
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </form>
            </div>

            {/* CHART */}
            <div className="relative h-[220px] w-full bg-zinc-950/20 border border-white/5">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
                    {/* Area Fill */}
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        d={`M${areaPoints} Z`}
                        fill="white"
                        fillOpacity="0.02"
                    />

                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={`M${points}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeOpacity="0.8"
                        style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))" }}
                    />

                    {/* Points */}
                    {market.data.map((d, i) => (
                        <g key={i}>
                            <circle
                                cx={getX(i)}
                                cy={getY(d.price)}
                                r="2"
                                className={`fill-black stroke-[1] ${d.type === 'projected' ? 'stroke-zinc-800' : 'stroke-white'}`}
                            />
                            {/* Hover Trigger */}
                            <rect
                                x={getX(i) - 15}
                                y={0}
                                width={30}
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{
                            left: `${(hoveredPoint / (market.data.length - 1)) * 100}%`,
                            top: `${(getY(market.data[hoveredPoint].price) / height) * 100}%`,
                            transform: 'translate(-50%, -130%)'
                        }}
                    >
                        <div className="bg-black border border-white/20 px-4 py-3 rounded-none shadow-2xl text-center min-w-[120px]" dir="ltr">
                            <div className="text-[9px] font-black text-zinc-500 mb-2 tracking-widest uppercase">{market.data[hoveredPoint].date}</div>
                            <div className="text-xl font-light text-white italic tracking-tighter">${market.data[hoveredPoint].price}</div>
                            {market.data[hoveredPoint].type === 'projected' && (
                                <div className="text-[8px] font-black text-emerald-500 mt-2 uppercase tracking-[0.2em]">{t('widgets.marketTrend.forecast')?.toUpperCase() || "PROJECTED_VALUE"}</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-8 flex items-center gap-8 text-[9px] font-black border-t border-white/5 pt-6 uppercase tracking-widest">
                <div className="flex items-center gap-3 text-zinc-700">
                    <span className="w-1.5 h-1.5 bg-zinc-800" /> {t('widgets.marketTrend.historical')?.toUpperCase() || "HISTORICAL_DATA"}
                </div>
                <div className="flex items-center gap-3 text-zinc-500">
                    <span className="w-1.5 h-1.5 bg-white" /> {t('widgets.marketTrend.prediction')?.toUpperCase() || "NEURAL_PREDICTION"}
                </div>
            </div>

            <p className="mt-6 text-[11px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight max-w-2xl">
                <span className="text-white font-black tracking-widest mr-3">{t('widgets.marketTrend.analysis')?.toUpperCase() || "CORE_ANALYSIS"}:</span> {market.summary}
            </p>
        </div>
    );
}
