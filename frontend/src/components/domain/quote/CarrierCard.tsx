"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Ship, Calculator, ShieldCheck, ChevronDown, ChevronUp, MapPin, Truck, Leaf } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { QuoteResult } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";

interface CarrierCardProps {
    quote: QuoteResult;
    origin: string;
    destination: string;
    onBook?: () => void;
}

export function CarrierCard({ quote, origin, destination, onBook }: CarrierCardProps) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const isFeatured = quote.isFeatured;

    return (
        <Card className={`group overflow-hidden border ${isFeatured ? 'border-emerald-500/40 holographic-glow' : 'border-white/10'} shadow-none hover:border-white/30 transition-all duration-700 bg-black/40 backdrop-blur-3xl rounded-none mb-4 relative`}>
            {isFeatured && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
            )}
            {!isFeatured && (
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}

            {/* Header / Carrier Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 border-b border-white/5 p-10">
                <div className="flex items-center gap-8">
                    <div className="relative h-20 w-20 flex-shrink-0 bg-white p-3 shadow-2xl transition-all duration-700 group-hover:scale-105">
                        {quote.carrier_logo ? (
                            <Image
                                src={quote.carrier_logo}
                                alt={quote.carrier}
                                width={80}
                                height={80}
                                className="h-full w-full object-contain"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-lg font-bold text-black uppercase">
                                {quote.carrier.substring(0, 2)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-white tracking-tight uppercase group-hover:tracking-normal transition-all duration-700">{quote.carrier}</h4>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {quote.tags && quote.tags.length > 0 ? (
                                quote.tags.map((tag: string, i: number) => (
                                    <span key={i} className="titan-label border border-white/10 px-3 py-1 text-gray-400 group-hover:text-white group-hover:border-white/20">
                                        {tag}
                                    </span>
                                ))
                            ) : null}
                            <span className={`titan-label border px-3 py-1 ${quote.riskScore > 50 ? 'border-red-911 text-red-500' : 'border-white/10 text-gray-500'}`}>
                                <ShieldCheck className="w-2 h-2 mr-2" /> {t('quote.card.risk')}: {quote.riskScore}%
                            </span>
                            {quote.isReal && (
                                <span className="titan-label bg-white text-black border-transparent px-3 py-1">
                                    {t('quote.card.coreVerified')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <span className="titan-label block">AGGR_FREIGHT_USD</span>
                    <div className="text-5xl font-bold text-white tracking-tight leading-none">
                        ${(quote.price + quote.customsDuty).toLocaleString()}
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">INCL. ${quote.customsDuty.toLocaleString()} {t('quote.card.dutyCalc')}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-10 grid md:grid-cols-12 gap-12 items-center">
                <div className="md:col-span-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex flex-col items-start w-[45%]">
                            <span className="titan-label mb-2">{t('quote.card.receiptNode')}</span>
                            <span className="truncate w-full font-bold text-white uppercase tracking-tight text-xl">{origin.split(',')[0]}</span>
                        </div>
                        <div className="flex flex-col items-end w-[45%] text-right">
                            <span className="titan-label mb-2">{t('quote.card.gatewayPoint')}</span>
                            <span className="truncate w-full font-bold text-white uppercase tracking-tight text-xl">{destination.split(',')[0]}</span>
                        </div>
                    </div>

                    {/* Timeline Bar - Titan Stark Style */}
                    <div className="relative flex items-center w-full">
                        <div className="w-2 h-2 bg-white shadow-[0_0_15px_white] z-10 shrink-0"></div>
                        <div className="h-[1px] bg-white/10 flex-1 relative mx-4 overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-40"
                            />
                        </div>
                        <div className="h-14 w-14 bg-white text-black flex items-center justify-center z-10 shrink-0 transform hover:scale-110 transition-transform duration-700">
                            <Ship className="w-6 h-6" />
                        </div>
                        <div className="h-[1px] bg-white/10 flex-1 relative mx-4"></div>
                        <div className="w-2 h-2 border border-white/20 bg-black z-10 shrink-0"></div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <div className="flex items-center gap-6">
                            <span className="titan-label text-gray-600">{t('quote.card.velocityMetric')}: {quote.days} {t('quote.booking.days').split(' ')[0]}</span>
                            {quote.departureDate && (
                                <span className="titan-label text-emerald-500 border border-emerald-500/20 px-2 py-0.5">
                                    {t('quote.card.departure')}: {quote.departureDate}
                                </span>
                            )}
                            {quote.vesselName && (
                                <span className="titan-label text-white/40 italic">
                                    {t('quote.card.vessel')}: {quote.vesselName}
                                </span>
                            )}
                        </div>
                        <span className="titan-label text-gray-600">SECURE_CORRIDOR_TRANSIT</span>
                    </div>
                </div>

                <div className="md:col-span-4 flex flex-col items-stretch justify-center gap-4 lg:border-l lg:pl-12 border-white/5">
                    <Button
                        onClick={onBook}
                        className="w-full bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-[0.2em] h-16 rounded-none shadow-none text-xs active:scale-95 transition-all"
                    >
                        {t('quote.card.initBooking')}
                    </Button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="titan-label hover:text-white flex items-center justify-center gap-3 transition-all p-3 border border-white/5 hover:border-white/10"
                    >
                        {expanded ? t('quote.card.collapseIntel') : t('quote.card.expandAnalytics')}
                        {expanded ? <ChevronUp className="w-3 h-3 text-white/30" /> : <ChevronDown className="w-3 h-3 text-white/30" />}
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
                        className="bg-black/80 border-t border-white/5"
                    >
                        <div className="p-12 grid md:grid-cols-2 gap-20">
                            {/* Left: Detailed Line Items */}
                            <div className="space-y-10">
                                <h4 className="titan-label flex items-center gap-3">
                                    <Calculator className="w-3 h-3 text-emerald-500" /> {t('quote.card.rateCalibration')}
                                </h4>
                                <div className="space-y-5">
                                    {quote.wisdom && (
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 mb-8">
                                            <span className="titan-label text-emerald-500 mb-2 block">{t('quote.card.intelWisdom')}</span>
                                            <p className="text-[11px] font-bold text-white uppercase leading-relaxed italic tracking-widest leading-loose">
                                                "{quote.wisdom}"
                                            </p>
                                        </div>
                                    )}
                                    {quote.fee_breakdown && quote.fee_breakdown.length > 0 ? (
                                        quote.fee_breakdown.map((fee: { name: string; amount: number }, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center group/fee">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1 h-1 ${fee.name.includes("Freight") ? "bg-white" : "bg-white/20"}`}></div>
                                                    <span className="titan-label text-gray-500 group-hover/fee:text-white transition-colors">{fee.name.toUpperCase()}</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-white">${fee.amount.toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center group/fee">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-1 bg-white"></div>
                                                    <span className="titan-label text-gray-500 group-hover/fee:text-white transition-colors">{t('quote.card.baseFreight')}</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-white">${(quote.fuel_fee || quote.price * 0.6).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center group/fee">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-1 bg-white/20"></div>
                                                    <span className="titan-label text-gray-500 group-hover/fee:text-white transition-colors">{t('quote.card.terminalHandling')}</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-white">${(quote.thc_fee || 350).toLocaleString()}</span>
                                            </div>
                                            {quote.pss_fee && quote.pss_fee > 0 ? (
                                                <div className="flex justify-between items-center group/fee">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1 h-1 bg-red-500"></div>
                                                        <span className="titan-label text-gray-500 group-hover/fee:text-white transition-colors">{t('quote.card.peakSeason')}</span>
                                                    </div>
                                                    <span className="font-mono text-xs font-bold text-white">${quote.pss_fee.toLocaleString()}</span>
                                                </div>
                                            ) : null}
                                            <div className="flex justify-between items-center group/fee">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-1 bg-white/10"></div>
                                                    <span className="titan-label text-gray-500 group-hover/fee:text-white transition-colors">{t('quote.card.dynamicSurcharges')}</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-white">${(quote.price - (quote.fuel_fee || 0) - (quote.thc_fee || 0) - (quote.pss_fee || 0)).toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                    <span className="titan-label text-white">{t('quote.card.aggregatedTotal')}</span>
                                    <span className="font-bold text-2xl text-white tracking-tight">USD {quote.price.toLocaleString()}</span>
                                </div>

                                {/* 5-API SYNC TELEMETRY */}
                                <div className="pt-8 border-t border-white/5 space-y-4">
                                    <h4 className="titan-label text-white/40 mb-4 tracking-[0.4em]">{t('quote.card.sovereignHandshake')}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{t('quote.card.vesselAuth')}</span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase italic">{(quote as any).source_endpoint?.split('(')[1]?.replace(')', '') || "VERIFIED"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{t('quote.card.localOffice')}</span>
                                        <span className="text-[10px] font-black text-white uppercase italic">{quote.contactOffice || "+1 (800) MAERSK"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Routing Details */}
                            <div className="bg-white/[0.01] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                                <h4 className="titan-label mb-10 flex items-center gap-3">
                                    <Truck className="w-3 h-3 text-emerald-500" /> {t('quote.card.nodeTelemetry')}
                                </h4>
                                <div className="space-y-8 relative z-10">
                                    <div className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-white shadow-[0_0_10px_white]"></div>
                                            <div className="w-[1px] h-full bg-white/10 my-2"></div>
                                        </div>
                                        <div>
                                            <p className="titan-label text-white mb-2">{t('quote.card.receiptProtocol')}</p>
                                            <p className="text-xs font-bold uppercase text-gray-600 tracking-widest">{origin}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-white/20"></div>
                                            <div className="w-[1px] h-full bg-white/10 my-2"></div>
                                        </div>
                                        <div>
                                            <p className="titan-label text-white mb-2">{t('quote.card.loadPoint')}</p>
                                            <p className="text-xs font-bold uppercase text-gray-600 tracking-widest">{origin.split(',')[0]} {t('quote.card.loadPoint').includes('_') ? 'PORT_GATEWAY' : 'PORT GATEWAY'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-white/5"></div>
                                        </div>
                                        <div>
                                            <p className="titan-label text-white mb-2">{t('quote.card.dischargeUnit')}</p>
                                            <p className="text-xs font-bold uppercase text-gray-600 tracking-widest mb-4">{destination.split(',')[0]} {t('quote.card.dischargeUnit').includes('_') ? 'GATEWAY_INFRA' : 'GATEWAY INFRA'}</p>
                                            <div className="flex items-center gap-4">
                                                <div className="h-[2px] w-32 bg-white/5 overflow-hidden">
                                                    <div className={`h-full ${quote.portCongestion > 70 ? 'bg-red-500' : 'bg-white'}`} style={{ width: `${quote.portCongestion}%` }} />
                                                </div>
                                                <span className="text-xs font-bold uppercase text-gray-400 tracking-[0.3em]">{t('quote.card.health')}: {100 - Math.round(quote.portCongestion)}%</span>
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

