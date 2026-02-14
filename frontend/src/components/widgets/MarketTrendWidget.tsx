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
        <div className={`w-full bg-white border border-slate-100 rounded-3xl p-8 relative overflow-hidden group shadow-xl ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">{t('widgets.marketTrend.title')?.toUpperCase() || "MARKET_TELEMETRY"}</span>
                        <div className={`text-[9px] font-bold px-3 py-1 rounded-full border ${market.trend_direction === 'UP' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-blue-100 bg-blue-50 text-blue-600'}`}>
                            {market.trend_direction === 'UP' ? (t('widgets.marketTrend.bullish')?.toUpperCase() || "BULLISH_SIGNAL") : (t('widgets.marketTrend.bearish')?.toUpperCase() || "BEARISH_SIGNAL")}
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold text-slate-900 tracking-tighter flex items-center gap-4">
                        {market.commodity} <span className="text-slate-300 font-medium text-xs tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-lg">[{country}]</span>
                    </h3>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder={t('widgets.officeLocator.searchPlaceholder')?.toUpperCase() || "SEARCH_NODE"}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-full md:w-64 uppercase"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10">
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </form>
            </div>

            {/* CHART */}
            <div className="relative h-[240px] w-full bg-slate-50/50 rounded-2xl border border-slate-50 p-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
                    {/* Area Fill */}
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        d={`M${areaPoints} Z`}
                        fill="url(#areaGradient)"
                        fillOpacity="1"
                    />

                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={`M${points}`}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeOpacity="0.8"
                    />

                    {/* Points */}
                    {market.data.map((d, i) => (
                        <g key={i}>
                            <circle
                                cx={getX(i)}
                                cy={getY(d.price)}
                                r="3"
                                className={`fill-white stroke-[2] ${d.type === 'projected' ? 'stroke-slate-300' : 'stroke-blue-600'}`}
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
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-0 left-0 pointer-events-none z-20"
                        style={{
                            left: `${(hoveredPoint / (market.data.length - 1)) * 100}%`,
                            top: `${(getY(market.data[hoveredPoint].price) / height) * 100}%`,
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <div className="bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl shadow-2xl text-center min-w-[140px]" dir="ltr">
                            <div className="text-[10px] font-bold text-slate-500 mb-1 tracking-widest uppercase">{market.data[hoveredPoint].date}</div>
                            <div className="text-2xl font-black text-white tracking-tighter">${market.data[hoveredPoint].price.toLocaleString()}</div>
                            {market.data[hoveredPoint].type === 'projected' && (
                                <div className="text-[9px] font-bold text-blue-400 mt-2 uppercase tracking-widest">VALIDATED_FORECAST</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-10 flex items-center gap-10 text-[10px] font-bold border-t border-slate-50 pt-8 uppercase tracking-widest">
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="w-2 h-2 bg-blue-600 rounded-full" /> {t('widgets.marketTrend.historical')?.toUpperCase() || "HISTORICAL_BENCHMARK"}
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="w-2 h-2 border-2 border-slate-200 rounded-full" /> {t('widgets.marketTrend.prediction')?.toUpperCase() || "AI_INSIGHTS"}
                </div>
            </div>

            <p className="mt-8 text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-tight max-w-3xl border-l-2 border-blue-500 pl-6">
                <span className="text-slate-900 font-bold tracking-[0.2em] mr-4">{t('widgets.marketTrend.analysis')?.toUpperCase() || "EXECUTIVE_SUMMARY"}:</span> {market.summary}
            </p>
        </div>
    );
}
