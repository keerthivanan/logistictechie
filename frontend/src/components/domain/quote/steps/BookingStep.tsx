"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { CheckCircle, Ship, Package, Calendar, ArrowLeft, LayoutDashboard, Download, Loader2, Globe, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { BACKEND_URL } from "@/lib/logistics";

export function BookingStep() {
    const { t } = useLanguage();
    const { data: session, status } = useSession();
    const { selectedQuote, formData } = useQuoteStore();
    const [bookingRef, setBookingRef] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createBooking = async () => {
            if (!selectedQuote) return;

            if (status === "unauthenticated") {
                window.location.href = "/login";
                return;
            }

            if (status === "authenticated" && session?.user) {
                try {
                    const token = (session.user as any).accessToken;
                    const userId = (session.user as any).id;
                    const apiUrl = BACKEND_URL.replace('/api', '');

                    // Artificial delay for high-fidelity sync feel
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const response = await axios.post(`${apiUrl}/api/bookings`, {
                        quote_id: selectedQuote.id,
                        user_id: userId,
                        cargo_details: formData, // Send as object for cleaner backend handling
                        price: selectedQuote.price,
                        quote_data: selectedQuote // SOVEREIGN SNAPSHOT
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data && response.data.booking_reference) {
                        setBookingRef(response.data.booking_reference);
                    }
                } catch (error: any) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error("Booking Creation Failed", error);
                    }
                    setError(error.response?.data?.detail || "STRATEGIC_DECORRELATION_ERROR");
                } finally {
                    setLoading(false);
                }
            }
        };

        createBooking();
    }, [selectedQuote, formData, session, status]);

    if (!selectedQuote) return <div className="text-zinc-800 text-center py-20 font-black uppercase tracking-[0.4em]">{t('quote.booking.noQuote')}</div>;

    if (loading) {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <div className="relative w-24 h-24 mx-auto mb-12">
                    <Loader2 className="h-24 w-24 text-white animate-spin opacity-5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="h-8 w-8 text-emerald-500 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{t('quote.booking.synchronizingManifest')}</h2>
                <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">{t('quote.booking.reservingCapacity').replace('{carrier}', selectedQuote.carrier.toUpperCase())}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto text-center py-24 border border-red-911/20 bg-red-911/[0.02]">
                <div className="w-16 h-16 bg-red-911/10 text-red-500 flex items-center justify-center mx-auto mb-8 rounded-none">
                    <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">DEPLOYMENT_TERMINATED</h2>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-12 leading-loose">
                    {error}
                </p>
                <Button
                    onClick={() => window.location.reload()}
                    className="h-16 px-12 bg-white text-black font-black text-[9px] uppercase tracking-[0.4em] rounded-none hover:bg-emerald-500 transition-colors"
                >
                    RE-INITIALIZE_HANDSHAKE
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-1000">
            {/* Cinematic Success Interface */}
            <div className="text-center mb-24">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-24 h-24 bg-white text-black flex items-center justify-center mx-auto mb-10 group"
                >
                    <CheckCircle className="w-10 h-10 group-hover:scale-110 transition-transform" />
                </motion.div>
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">{t('quote.booking.missionConfirmed').split('.')[0]}.</h2>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">{t('quote.booking.strategicOps')}</p>

                <div className="mt-12 inline-flex flex-col items-center">
                    <span className="text-zinc-800 text-[9px] font-black uppercase tracking-[0.6em] mb-4">{t('quote.booking.deploymentReference')}</span>
                    <div className="bg-zinc-950/40 border border-white/5 px-12 py-6 text-2xl font-black text-emerald-500 italic tracking-tighter group hover:border-emerald-500/20 transition-all cursor-default tabular-nums">
                        {bookingRef}
                    </div>
                </div>
            </div>

            {/* Tactical Detail Matrix */}
            <div className="elite-card overflow-hidden mb-16">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 border-b border-white/5">
                    <div className="flex-1 p-10 group">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="h-14 w-14 bg-zinc-900 flex items-center justify-center transition-all duration-700 group-hover:bg-white group-hover:text-black group-hover:rotate-12">
                                <Ship className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-hover:text-emerald-500 transition-colors">{t('quote.booking.carrierIdentifier')}</h3>
                                <p className="text-xl font-black text-white italic tracking-tighter uppercase mt-1">{selectedQuote.carrier}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-10 group text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-hover:text-emerald-500 transition-colors">{t('quote.booking.totalInvestment')}</span>
                        <div className="text-4xl font-black text-white italic tracking-tighter uppercase mt-2">${selectedQuote.price?.toLocaleString()}</div>
                    </div>
                </div>

                <div className="p-10 lg:p-16">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-10">
                            <div>
                                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] block mb-4">{t('quote.results.originNode')}</span>
                                <div className="text-xl font-black text-white italic uppercase tracking-tight">{formData.origin}</div>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] block mb-4">{t('quote.results.targetDestination')}</span>
                                <div className="text-xl font-black text-white italic uppercase tracking-tight">{formData.destination}</div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] block mb-4">{t('quote.booking.cargoSpec')}</span>
                                <div className="flex items-center gap-4 text-white">
                                    <Package className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xl font-black italic uppercase tracking-tight">{formData.cargoType} ({formData.containerSize})</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] block mb-4">{t('quote.booking.estVelocity')}</span>
                                <div className="flex items-center gap-4 text-white">
                                    <Zap className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xl font-black italic uppercase tracking-tight">{selectedQuote.days} {t('quote.booking.days')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Alert */}
                <div className="bg-emerald-500/5 p-6 border-t border-white/5">
                    <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.4em] text-center flex items-center justify-center gap-4">
                        <Shield className="w-3 h-3" /> {t('quote.booking.neuralVerification')}
                    </p>
                </div>
            </div>

            {/* Tactical Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button
                    variant="outline"
                    className="h-20 px-12 rounded-none border-white/5 bg-transparent text-zinc-600 hover:text-white hover:bg-zinc-950 transition-all font-black text-[11px] uppercase tracking-[0.4em]"
                    onClick={() => window.location.href = '/'}
                >
                    <ArrowLeft className="w-4 h-4 mr-6" /> {t('quote.booking.returnHome')}
                </Button>
                <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="h-20 px-16 rounded-none bg-white text-black hover:bg-emerald-500 font-black text-[11px] uppercase tracking-[0.6em] transition-all duration-700 shadow-[0_20px_60px_rgba(255,255,255,0.05)]"
                >
                    <LayoutDashboard className="w-5 h-5 mr-6" /> {t('quote.booking.missionControl')}
                </Button>
            </div>
        </div>
    );
}
