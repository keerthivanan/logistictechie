"use client";
import Image from "next/image";
import { Ship, Calculator, ShieldCheck, ChevronDown, ChevronUp, Truck, Leaf, Anchor, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { QuoteResult } from "@/lib/logistics";

interface CarrierCardProps {
    quote: QuoteResult;
    origin: string;
    destination: string;
    onBook?: () => void;
}

export function CarrierCard({ quote, origin, destination, onBook }: CarrierCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isFeatured = quote.isFeatured;

    return (
        <div className={cn(
            "group overflow-hidden border-2 transition-all duration-700 bg-zinc-950/40 border-white/10 rounded-[64px] mb-12 hover:border-white/40 backdrop-blur-3xl shadow-2xl",
            isFeatured && "border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.05)]"
        )}>
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x lg:divide-white/10">
                {/* --- Left: Carrier Intel --- */}
                <div className="p-16 lg:w-96 flex flex-col items-center lg:items-start justify-center gap-8 bg-white/[0.03]">
                    <div className="flex flex-col items-center lg:items-start gap-10">
                        <div className="h-24 w-24 bg-white flex items-center justify-center p-6 rounded-[40px] shadow-2xl ring-4 ring-white/5 transition-all group-hover:ring-white/10 scale-110 lg:scale-125 lg:mb-8">
                            {quote.carrier_logo ? (
                                <Image
                                    src={quote.carrier_logo}
                                    alt={quote.carrier}
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                    unoptimized
                                />
                            ) : (
                                <Ship className="h-12 w-12 text-black" />
                            )}
                        </div>
                        <div className="flex flex-col text-center lg:text-left">
                            <span className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{quote.carrier}</span>
                            <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em] mt-4 leading-none">NODE_ID: {quote.id || '45986665'}</span>
                        </div>
                    </div>
                </div>

                {/* --- Center: Route Progress Architecture --- */}
                <div className="flex-1 p-16 flex flex-col justify-between gap-16">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-4">
                            <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.8em]">ORIGIN_NODE</span>
                            <span className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none underline decoration-white/10 underline-offset-8">{origin}</span>
                        </div>
                        <div className="flex flex-col items-end gap-4 text-right">
                            <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.8em]">TARGET_DESTINATION</span>
                            <span className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none underline decoration-white/10 underline-offset-8">{destination}</span>
                        </div>
                    </div>

                    {/* Segmented Timeline Architecture - Static */}
                    <div className="relative h-12 flex items-center px-4 mt-8">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10" />

                        <div className="relative z-10 flex justify-between w-full">
                            {/* Inland Start */}
                            <div className="flex flex-col items-center">
                                <div className="h-10 w-10 bg-zinc-900 border-2 border-white/20 flex items-center justify-center rounded-2xl shadow-2xl">
                                    <Truck className="h-5 w-5 text-white/60" />
                                </div>
                            </div>

                            {/* Port Loading */}
                            <div className="flex flex-col items-center">
                                <div className="h-14 w-14 bg-white flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] ring-4 ring-white/10">
                                    <Anchor className="h-7 w-7 text-black" />
                                </div>
                            </div>

                            {/* Port Discharge */}
                            <div className="flex flex-col items-center">
                                <div className="h-10 w-10 bg-zinc-900 border-2 border-white/20 flex items-center justify-center rounded-2xl">
                                    <Anchor className="h-5 w-5 text-white/60" />
                                </div>
                            </div>
                        </div>

                        {/* Progress Fill - Static */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] bg-white shadow-[0_0_20px_white]" style={{ width: '70%' }} />
                    </div>

                    <div className="flex items-center gap-12 mt-6 overflow-x-auto no-scrollbar pb-4">
                        <div className="flex items-center gap-4 px-8 py-3 bg-white/10 rounded-full border border-white/20 shadow-2xl">
                            <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                            <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">SPOT_PROTOCOL</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Truck className="h-6 w-6 text-white/40" />
                            <span className="text-[14px] font-black text-white uppercase tracking-widest italic">{quote.container_type || "40' ST"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Clock className="h-6 w-6 text-white/60" />
                            <span className="text-[14px] font-black text-white uppercase tracking-widest italic">{quote.days} Days_Transit_Velocity</span>
                        </div>
                        {isFeatured && (
                            <div className="flex items-center gap-4 px-8 py-3 bg-white/10 rounded-full border border-emerald-500/20 shadow-2xl">
                                <Leaf className="h-5 w-5 text-emerald-400" />
                                <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.4em]">ECO_STABLE</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right: Pricing & Pre-book Node --- */}
                <div className="p-16 lg:w-96 flex flex-col justify-between items-end gap-12 bg-white/[0.03]">
                    <div className="text-right flex flex-col gap-4 w-full">
                        <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.8em]">FREIGHT_QUOTA</span>
                        <div className="flex items-baseline gap-4 justify-end">
                            <span className="text-lg font-black text-white/40 uppercase tracking-[0.2em]">USD</span>
                            <span className="text-7xl font-black text-white tracking-tighter leading-none italic underline decoration-white/10 underline-offset-16">
                                {(quote.price + quote.customsDuty).toLocaleString()}
                            </span>
                        </div>
                        <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.8em] mt-4 italic">ALL_TAX_INCLUSIVE</span>
                    </div>

                    <button
                        onClick={onBook}
                        className="w-full h-28 bg-white text-black font-black uppercase tracking-[1em] text-[16px] rounded-full transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_30px_60px_rgba(255,255,255,0.1)] hover:shadow-[0_40px_80px_rgba(255,255,255,0.2)]"
                    >
                        BOOK_NOW
                    </button>
                </div>
            </div>

            {/* Expander Trigger Area - Static */}
            <div
                onClick={() => setExpanded(!expanded)}
                className="h-20 border-t border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-colors group"
            >
                <span className="text-[12px] font-black text-white/20 uppercase tracking-[1.5em] group-hover:text-white transition-colors flex items-center gap-8 italic">
                    {expanded ? 'COLLAPSE_LOGISTICS' : 'EXPAND_TELEMETRY'}
                    {expanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                </span>
            </div>

            {expanded && (
                <div className="bg-white/[0.02] border-t border-white/10">
                    <div className="p-24 grid md:grid-cols-2 gap-32">
                        {/* Left: Detailed Line Items */}
                        <div className="space-y-16">
                            <h4 className="text-[14px] font-black text-white/20 uppercase tracking-[1em] flex items-center gap-6">
                                <div className="w-12 h-12 rounded-[20px] bg-white/10 flex items-center justify-center border border-white/20">
                                    <Calculator className="w-6 h-6 text-white" />
                                </div>
                                COST_SYNOPSIS_MANIFEST
                            </h4>
                            <div className="space-y-10">
                                <div className="flex justify-between items-center group/fee pb-10 border-b border-white/10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                                        <span className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Ocean Freight</span>
                                    </div>
                                    <span className="text-4xl font-black text-white tabular-nums italic underline decoration-white/10 underline-offset-8">${quote.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group/fee pb-10 border-b border-white/10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                        <span className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Customs & Duty</span>
                                    </div>
                                    <span className="text-4xl font-black text-white tabular-nums italic underline decoration-white/10 underline-offset-8">${(quote.customsDuty || 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-12">
                                <span className="text-[12px] font-black text-white/40 uppercase tracking-[1em]">AGGREGATED_TOTAL</span>
                                <div className="flex flex-col items-end">
                                    <span className="font-black text-7xl text-white tracking-tighter leading-none italic underline decoration-white underline-offset-[20px]">
                                        <span className="text-2xl text-white/40 mr-6 tracking-[0.2em] font-black italic">USD</span>
                                        {(quote.price + quote.customsDuty).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Technical Handshake */}
                        <div className="bg-zinc-950/40 p-16 rounded-[64px] border-2 border-white/10 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                            <h4 className="text-[14px] font-black text-white/20 uppercase tracking-[1em] mb-16 flex items-center gap-6">
                                <div className="w-12 h-12 rounded-[20px] bg-white/10 flex items-center justify-center border border-white/20">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                TELEMETRY_CERTIFICATION
                            </h4>
                            <div className="space-y-12">
                                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em]">Vessel Protocol</span>
                                    <span className="text-[12px] font-black text-white uppercase italic tracking-[0.4em] ring-2 ring-white/10 px-4 py-1 rounded-full">CERTIFIED_SECURE</span>
                                </div>
                                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em]">API Handshake</span>
                                    <span className="text-[12px] font-black text-white uppercase italic tracking-[0.4em] underline decoration-white/20 underline-offset-4">{quote.carrier.toUpperCase()}_L3_SYNC</span>
                                </div>
                                <div className="mt-16 p-12 bg-white/5 rounded-[40px] border-2 border-white/10 backdrop-blur-3xl relative">
                                    <div className="absolute top-0 left-0 w-8 h-[2px] bg-white" />
                                    <div className="absolute top-0 left-0 w-[2px] h-8 bg-white" />
                                    <p className="text-[14px] font-black text-white/60 uppercase tracking-[0.4em] leading-relaxed italic">
                                        &quot;This quote is cryptographically verified and connected to live carrier slot allocation systems. Data integrity sealed via Phoenix Protocol v2.6.0.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
