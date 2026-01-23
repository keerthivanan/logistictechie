"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ship, Clock, Calculator, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CarrierCardProps {
    quote: any;
    origin: string;
    destination: string;
    onBook?: () => void;
}

export function CarrierCard({ quote, origin, destination, onBook }: CarrierCardProps) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);

    // Calculate totals if missing (fallback logic handled partly in backend but ensuring safety here)
    const freight = quote.ocean_freight || quote.price * 0.85;
    const surcharges = quote.surcharges || quote.price * 0.12;
    const insurance = quote.insurance_cost || quote.price * 0.03;
    const total = quote.price;

    return (
        <Card className="p-0 border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden bg-white group">
            <div className="p-6 grid md:grid-cols-4 gap-6 items-center">

                {/* 1. Carrier Info */}
                <div className="md:col-span-1">
                    <div className="flex items-center gap-4 mb-3">
                        {/* Logo Placeholder or Image */}
                        <div className="h-16 w-24 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-2 shadow-sm overflow-hidden relative">
                            {quote.carrier_logo?.startsWith('http') ? (
                                <img
                                    src={quote.carrier_logo}
                                    alt={quote.carrier}
                                    className="w-full h-full object-contain"
                                />
                            ) : quote.carrier_logo ? (
                                <span className="text-2xl">{quote.carrier_logo}</span>
                            ) : (
                                <Ship className="text-blue-600 w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{quote.carrier}</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full uppercase font-bold tracking-wider">Spot Rate</span>
                                {quote.isReal && (
                                    <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Logistics Info */}
                <div className="md:col-span-2 px-4 border-l border-r border-gray-50 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {origin.split(',')[0]}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {quote.days} Days Transit
                        </div>
                        <div className="flex items-center gap-2">
                            {destination.split(',')[0]}
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        </div>
                    </div>

                    {/* Route Visual Line */}
                    <div className="relative h-1.5 bg-gray-100 rounded-full w-full my-2">
                        <div className="absolute h-full bg-blue-500 rounded-full w-2/3" />
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Cutoff: {new Date().toLocaleDateString()}</span>
                        <span>Valid: {quote.validUntil}</span>
                    </div>
                </div>

                {/* 3. Price & Action */}
                <div className="md:col-span-1 pl-2 flex flex-col items-end gap-3">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            USD {total.toLocaleString()}
                        </div>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 mt-1 font-medium"
                        >
                            View details {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    </div>
                    <Button onClick={onBook} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-lg shadow-blue-500/20">
                        Book Now
                    </Button>
                </div>
            </div>

            {/* EXPANDABLE DETAILS SECTION */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50 border-t border-gray-100"
                    >
                        <div className="p-6 grid md:grid-cols-3 gap-8 text-sm">
                            {/* Breakdown */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-gray-500" /> Cost Breakdown
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Ocean Freight</span>
                                        <span className="font-medium text-gray-900">${freight.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Surcharges (BAF/CAF)</span>
                                        <span className="font-medium text-gray-900">${surcharges.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Terminal Handling</span>
                                        <span className="font-medium text-gray-900">$150.00</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>${total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900">Terms & Conditions</h4>
                                <ul className="space-y-1 text-gray-500 text-xs list-disc pl-4">
                                    <li>Subject to space and equipment availability.</li>
                                    <li>Rates are valid until {quote.validUntil}.</li>
                                    <li>Excludes local charges at destination.</li>
                                    <li>General Cargo only (Non-DG).</li>
                                </ul>
                            </div>

                            {/* Included */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900">Included Services</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">24/7 Support</span>
                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">Real-time Tracking</span>
                                    <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">Doc. Management</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
