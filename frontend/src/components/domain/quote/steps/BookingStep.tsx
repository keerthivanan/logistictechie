"use client";

import { useEffect, useState } from "react";
import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { CheckCircle, Ship, Package, Calendar, ArrowLeft, LayoutDashboard, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { logisticsClient } from "@/lib/logistics";
import axios from "axios";

export function BookingStep() {
    const { selectedQuote, formData } = useQuoteStore();
    const [bookingRef, setBookingRef] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const createBooking = async () => {
            if (!selectedQuote) return;

            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("user_id");

            if (!token || !userId) {
                // Redirect if not logged in - critical for real booking
                window.location.href = "/login";
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await axios.post(`${apiUrl}/api/bookings`, {
                    quote_id: selectedQuote.id,
                    user_id: userId,
                    cargo_details: JSON.stringify(formData),
                    price: selectedQuote.price
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.booking_reference) {
                    setBookingRef(response.data.booking_reference);
                }
            } catch (error) {
                console.error("Booking Creation Failed", error);
                // Fallback for demo or show error
                alert("Booking failed. Please try again or contact support.");
            }
            setLoading(false);
        };

        createBooking();
    }, [selectedQuote, formData]);

    if (!selectedQuote) return <div className="text-zinc-400 text-center py-20">No quote selected.</div>;

    if (loading) {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Submitting Your Booking Request</h2>
                <p className="text-zinc-400">Reserving space with {selectedQuote.carrier}...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Booking Request Submitted!</h2>
                <p className="text-zinc-400">Our operations team will confirm your booking within 24 hours.</p>

                <div className="mt-6 inline-flex items-center gap-4 bg-zinc-800/50 border border-zinc-700 px-6 py-3 rounded-lg">
                    <span className="text-zinc-500 text-sm">Booking Reference</span>
                    <span className="font-mono text-xl text-white font-bold">{bookingRef}</span>
                </div>
            </div>

            {/* Booking Details Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden mb-8">
                {/* Carrier Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center">
                            {selectedQuote.carrier_logo ? (
                                <img src={selectedQuote.carrier_logo} alt={selectedQuote.carrier} className="h-6 w-auto" />
                            ) : (
                                <Ship className="w-6 h-6 text-black" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">{selectedQuote.carrier}</h3>
                            <p className="text-sm text-zinc-500">Verified Carrier</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">${selectedQuote.price?.toLocaleString()}</div>
                        <p className="text-sm text-zinc-500">Total Amount</p>
                    </div>
                </div>

                {/* Shipment Details */}
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-zinc-500 block mb-1">Origin</span>
                                <div className="text-lg font-semibold text-white">{formData.origin}</div>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block mb-1">Destination</span>
                                <div className="text-lg font-semibold text-white">{formData.destination}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-zinc-500 block mb-1">Cargo</span>
                                <div className="flex items-center gap-2 text-white">
                                    <Package className="w-4 h-4 text-zinc-500" />
                                    <span>{formData.cargoType} ({formData.containerSize})</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block mb-1">Transit Time</span>
                                <div className="flex items-center gap-2 text-white">
                                    <Calendar className="w-4 h-4 text-zinc-500" />
                                    <span>{selectedQuote.days} Days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal Disclaimer - PROTECTS THE USER */}
                <div className="bg-amber-500/10 border-t border-amber-500/20 p-4">
                    <p className="text-xs text-amber-500 text-center">
                        <strong>Note:</strong> Rate subject to final carrier confirmation.
                        Valid for 24 hours. Our operations team will contact you if any adjustments are needed.
                    </p>
                </div>

                {/* Next Steps */}
                <div className="bg-zinc-800/30 p-6 border-t border-zinc-800">
                    <h4 className="font-medium text-white mb-3">What Happens Next?</h4>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                            Our operations team will review and confirm your booking
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                            You&apos;ll receive a confirmation email with shipping documents
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                            Track your shipment status from your dashboard
                        </li>
                    </ul>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                    variant="outline"
                    className="h-12 px-6 rounded-lg border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                    onClick={() => window.location.href = '/'}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
                <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="h-12 px-8 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold transition-all"
                >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
