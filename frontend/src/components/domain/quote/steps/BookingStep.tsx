"use client";

import { useEffect, useState } from "react";
import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Ship, Package, Calendar, Download, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { logisticsClient } from "@/lib/logistics";

export function BookingStep() {
    const { selectedQuote, formData } = useQuoteStore();
    const [bookingRef, setBookingRef] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const createBooking = async () => {
            if (!selectedQuote) return;

            // Call Backend to verify and book
            const result = await logisticsClient.bookQuote({
                quote_id: selectedQuote.id,
                contact_name: "Guest User",
                contact_email: "guest@example.com",
                company_name: "Guest Company",
                cargo_details: JSON.stringify(formData) // Ensure cargo details are stringified if backend expects string
            });

            if (result && result.success) {
                setBookingRef(result.booking_reference); // Backend returns booking_reference
            } else {
                setBookingRef("ERR-FAILED");
            }
            setLoading(false);
        };

        createBooking();
    }, [selectedQuote, formData]);

    if (!selectedQuote) return <div className="text-white">No quote selected.</div>;

    if (loading) {
        return (
            <div className="max-w-xl mx-auto text-center space-y-8 py-24">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-t-2 border-white/30 rounded-full animate-spin direction-reverse"></div>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">Securing Space...</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Negotiating with {selectedQuote.carrier}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-10">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                >
                    <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6">Booking Confirmed</h2>
                <div className="inline-flex items-center gap-4 bg-white/[0.05] border border-white/10 px-8 py-4 rounded-2xl">
                    <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Reference ID</span>
                    <span className="font-mono text-2xl text-white tracking-widest font-black">{bookingRef}</span>
                </div>
            </div>

            <Card className="p-10 bg-black border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 mb-8 gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center">
                                {/* Use Carrier Logo if available, else Ship icon */}
                                {selectedQuote.carrier_logo ? (
                                    <img src={selectedQuote.carrier_logo} alt={selectedQuote.carrier} className="h-8 w-auto" />
                                ) : (
                                    <Ship className="w-8 h-8 text-black" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                                    {selectedQuote.carrier}
                                </h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Ocean Service • Verified</p>
                            </div>
                        </div>
                        <div className="text-right rtl:text-left">
                            <div className="text-4xl font-black text-white tracking-tighter">${selectedQuote.price?.toLocaleString()}</div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Total Paid (USD)</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="group">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] block mb-2">Origin Port</span>
                                <div className="text-2xl font-bold text-white group-hover:pl-2 transition-all">{formData.origin}</div>
                            </div>
                            <div className="group">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] block mb-2">Destination Port</span>
                                <div className="text-2xl font-bold text-white group-hover:pl-2 transition-all">{formData.destination}</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] block mb-2">Cargo Specifications</span>
                                <div className="flex items-center gap-3 text-white text-lg font-medium bg-white/[0.03] p-4 rounded-xl border border-white/5">
                                    <Package className="w-5 h-5 text-gray-400" />
                                    <span>{formData.cargoType.toUpperCase()} ({formData.containerSize})</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] block mb-2">Estimated Arrival</span>
                                <div className="flex items-center gap-3 text-white text-lg font-medium bg-white/[0.03] p-4 rounded-xl border border-white/5">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span>{selectedQuote.days} Days Transit Time</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col md:flex-row justify-center gap-6 pt-4">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/20 text-white hover:bg-white hover:text-black transition-all hover:scale-105" onClick={() => window.location.reload()}>
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </Button>
                <Button className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-gray-200 font-black text-lg uppercase tracking-tight shadow-2xl hover:scale-105 transition-all">
                    <Download className="w-5 h-5 mr-3" />
                    Download Bill of Lading
                </Button>
            </div>
        </div>
    );
}
