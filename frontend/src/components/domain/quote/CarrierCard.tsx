"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Ship, Calculator, ShieldCheck, ChevronDown, ChevronUp, MapPin, Truck, Leaf } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { QuoteResult } from "@/lib/logistics";

interface CarrierCardProps {
    quote: QuoteResult;
    origin: string;
    destination: string;
    onBook?: () => void;
}

export function CarrierCard({ quote, origin, destination, onBook }: CarrierCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="group overflow-hidden border border-white/10 shadow-3xl hover:border-white/20 transition-all duration-500 bg-black/40 backdrop-blur-3xl rounded-3xl mb-6 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Header / Carrier Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 p-8">
                <div className="flex items-center gap-6">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-white p-2 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                        {quote.carrier_logo ? (
                            <Image
                                src={quote.carrier_logo}
                                alt={quote.carrier}
                                width={64}
                                height={64}
                                className="h-full w-full object-contain"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-black text-black uppercase">
                                {quote.carrier.substring(0, 2)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic group-hover:not-italic transition-all duration-500">{quote.carrier}</h4>
                        {/* Tags / Badges - Classic High Contrast */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {quote.tags && quote.tags.length > 0 ? (
                                quote.tags.map((tag: string, i: number) => {
                                    return (
                                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-gray-500 group-hover:text-gray-300 transition-colors">
                                            {tag}
                                        </span>
                                    );
                                })
                            ) : null}
                            {/* Sovereign Intelligence Badges */}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${quote.riskScore > 50 ? 'border-red-500/50 text-red-500' : 'border-white/10 text-gray-500 group-hover:text-gray-300'}`}>
                                <ShieldCheck className="w-3 h-3 mr-1.5" /> Risk: {quote.riskScore}%
                            </span>

                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-gray-400">
                                <Leaf className="w-3 h-3 mr-1.5" /> {quote.carbonEmissions.toLocaleString()} kg CO₂
                            </span>

                            {/* Verified Badge */}
                            {quote.isReal && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-black shadow-lg">
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Freight + Landed Estimate</div>
                    <div className="text-4xl font-black text-white tracking-tighter leading-none">
                        USD {(quote.price + quote.customsDuty).toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Incl. ${quote.customsDuty.toLocaleString()} Duties</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-8 grid md:grid-cols-12 gap-10 items-center">

                {/* 1. Timeline Visual (9 cols) */}
                <div className="md:col-span-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col items-start w-[45%]">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">Receipt Network</span>
                            <span className="truncate w-full font-black text-white uppercase tracking-tighter text-lg">{origin.split(',')[0]}</span>
                        </div>
                        <div className="flex flex-col items-end w-[45%] text-right">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">Gateway Arrival</span>
                            <span className="truncate w-full font-black text-white uppercase tracking-tighter text-lg">{destination.split(',')[0]}</span>
                        </div>
                    </div>

                    {/* Timeline Bar - Premium Metric Style */}
                    <div className="relative flex items-center w-full px-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10 shrink-0"></div>
                        <div className="h-[2px] bg-white/10 flex-1 relative mx-2 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
                            />
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center z-10 shrink-0 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Ship className="w-5 h-5" />
                        </div>
                        <div className="h-[2px] bg-white/10 flex-1 relative mx-2 rounded-full"></div>
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-white/20 bg-black z-10 shrink-0"></div>
                    </div>

                    <div className="flex justify-between items-center mt-4 px-1">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Master-Load: {quote.days} Days E.T.T</span>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Global Corridor Transit</span>
                    </div>
                </div>

                {/* 3. Price & Action (4 cols) */}
                <div className="md:col-span-4 flex flex-col items-end justify-center gap-4 border-l pl-10 border-white/10">
                    <Button onClick={onBook} className="w-full bg-white hover:bg-gray-200 text-black font-black uppercase tracking-tighter h-14 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] text-lg active:scale-95 transition-all">
                        Pre-book
                    </Button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[10px] text-gray-500 hover:text-white flex items-center gap-2 font-black uppercase tracking-widest transition-all px-2 py-1"
                    >
                        {expanded ? "Collapse Intel" : "Full Breakdown"}
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>
            </div>

            {/* EXPANDABLE BREAKDOWN */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border-t border-white/10 divide-y divide-white/5"
                    >
                        <div className="p-6 grid md:grid-cols-2 gap-12">
                            {/* Left: Detailed Line Items */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-gray-500" /> Rate Breakdown
                                </h4>
                                <div className="space-y-3 pl-2 border-l-2 border-white/20">
                                    {quote.fee_breakdown && quote.fee_breakdown.length > 0 ? (
                                        quote.fee_breakdown.map((fee: { name: string; amount: number }, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-sm group/fee">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${fee.name.includes("Freight") ? "bg-white" : "bg-gray-600"}`}></span>
                                                    <span className="text-gray-400 group-hover/fee:text-white transition-colors">{fee.name}</span>
                                                </div>
                                                <span className="font-mono font-medium text-gray-300">${fee.amount.toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        // Fallback if no detailed breakdown available
                                        <>
                                            <div className="flex justify-between text-sm text-gray-400"><span>Ocean Freight</span> <span className="font-mono text-gray-300">${(quote.price * 0.8).toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm text-gray-400"><span>Fees & Surcharges</span> <span className="font-mono text-gray-300">${(quote.price * 0.2).toFixed(2)}</span></div>
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                    <span className="font-bold text-white">Total Rate</span>
                                    <span className="font-black text-xl text-white">USD {quote.price.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Right: Map Placeholder / Route Info */}
                            <div className="bg-black/20 rounded-lg border border-white/10 p-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Ship className="w-32 h-32 text-white" />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-gray-500" /> Routing
                                </h4>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-white ring-4 ring-white/10"></div>
                                            <div className="w-0.5 h-full bg-white/10 my-1"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-sm font-semibold text-white">Place of Receipt</p>
                                            <p className="text-xs text-gray-500">{origin}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-gray-500 ring-4 ring-white/5"></div>
                                            <div className="w-0.5 h-full bg-white/10 my-1"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-sm font-semibold text-white">Port of Loading</p>
                                            <p className="text-xs text-gray-500">{origin.split(',')[0]} Port</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-gray-800 ring-4 ring-white/5"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Port of Discharge</p>
                                            <p className="text-xs text-gray-500 italic mb-2">{destination.split(',')[0]} Port</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full ${quote.portCongestion > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${quote.portCongestion}%` }} />
                                                </div>
                                                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Health: {100 - Math.round(quote.portCongestion)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
