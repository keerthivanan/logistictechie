"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuoteStore } from "@/hooks/use-quote";
import { CheckCircle, Ship, Package, ArrowLeft, LayoutDashboard, Globe, Shield, Zap, Loader2 } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { BACKEND_URL } from "@/lib/logistics";
import { cn } from "@/lib/utils";

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
                    const response = await axios.post(`${BACKEND_URL}/bookings/`, {
                        quote_id: selectedQuote.id,
                        cargo_details: {
                            type: "FCL",
                            size: formData.containerSize || "40"
                        },
                        quote_data: selectedQuote
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

    if (!selectedQuote) return <div className="text-white/20 text-center py-48 font-black uppercase tracking-[1em] text-2xl">ZERO_SPEC_DATA_FOUND</div>;

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-48">
                <div className="relative w-48 h-48 mx-auto mb-20">
                    <Loader2 className="h-48 w-48 text-white/10 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="h-16 w-16 text-white" />
                    </div>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-10 leading-none">{t('quote.booking.synchronizingManifest')}</h2>
                <p className="text-white/40 text-[12px] font-black uppercase tracking-[1em] italic">{t('quote.booking.reservingCapacity').replace('{carrier}', selectedQuote.carrier.toUpperCase())}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto text-center py-48 border border-white/10 bg-zinc-950/40 rounded-[80px] backdrop-blur-3xl shadow-2xl px-20">
                <div className="w-32 h-32 bg-white/10 text-white flex items-center justify-center mx-auto mb-16 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                    <Shield className="w-16 h-16" />
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-10 leading-none underline decoration-white/10 underline-offset-16">DEPLOYMENT_TERMINATED</h2>
                <p className="text-white/40 text-[12px] font-black uppercase tracking-[1em] mb-20 px-12 leading-relaxed">
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="h-32 px-24 bg-white text-black font-black text-[16px] uppercase tracking-[1.2em] rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl"
                >
                    RE-INITIALIZE
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Cinematic Success Interface - Static */}
            <div className="text-center mb-48">
                <div className="w-48 h-48 bg-white text-black flex items-center justify-center mx-auto mb-20 rounded-[64px] shadow-[0_0_100px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 active:scale-95">
                    <CheckCircle className="w-20 h-20" />
                </div>
                <h2 className="text-8xl md:text-[180px] font-black text-white uppercase italic tracking-[0.02em] mb-12 leading-[0.8]">
                    {t('quote.booking.missionConfirmed').split('.')[0]}. <br />
                    <span className="text-white/20 select-none">ENGAGED.</span>
                </h2>
                <p className="text-white text-4xl font-black uppercase tracking-tighter italic max-w-4xl mx-auto leading-[0.9]">{t('quote.booking.strategicOps')}</p>

                <div className="mt-24 inline-flex flex-col items-center">
                    <span className="text-white/20 text-[12px] font-black uppercase tracking-[1.2em] mb-10">{t('quote.booking.deploymentReference')}</span>
                    <div className="bg-zinc-950/40 border border-white/20 px-32 py-12 text-6xl font-black text-white italic tracking-[0.05em] rounded-full shadow-2xl tabular-nums backdrop-blur-3xl group hover:border-white transition-all">
                        {bookingRef}
                    </div>
                </div>
            </div>

            {/* Tactical Detail Matrix */}
            <div className="bg-zinc-950/40 border border-white/10 rounded-[80px] overflow-hidden mb-32 backdrop-blur-3xl shadow-2xl">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-white/10">
                    <div className="flex-1 p-20 group">
                        <div className="flex items-center gap-12 mb-12">
                            <div className="h-24 w-24 bg-white text-black flex items-center justify-center transition-all rounded-[40px] shadow-2xl">
                                <Ship className="h-12 w-12" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black uppercase tracking-[0.8em] text-white/20">{t('quote.booking.carrierIdentifier')}</h3>
                                <p className="text-5xl font-black text-white italic tracking-tighter uppercase mt-4 leading-none">{selectedQuote.carrier}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-20 text-right">
                        <span className="text-[12px] font-black uppercase tracking-[0.8em] text-white/20">{t('quote.booking.totalInvestment')}</span>
                        <div className="text-8xl font-black text-white italic tracking-tighter uppercase mt-6 underline decoration-white/10 underline-offset-16 leading-none">
                            <span className="text-2xl text-white/40 mr-8 font-black tracking-[0.2em]">USD</span>
                            ${selectedQuote.price?.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="p-20 md:p-32">
                    <div className="grid md:grid-cols-2 gap-32">
                        <div className="space-y-24">
                            <div>
                                <span className="text-[12px] font-black text-white/20 uppercase tracking-[1em] block mb-10">{t('quote.results.originNode')}</span>
                                <div className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:translate-x-2 transition-transform">{formData.origin}</div>
                            </div>
                            <div>
                                <span className="text-[12px] font-black text-white/20 uppercase tracking-[1em] block mb-10">{t('quote.results.targetDestination')}</span>
                                <div className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:translate-x-2 transition-transform">{formData.destination}</div>
                            </div>
                        </div>

                        <div className="space-y-24">
                            <div>
                                <span className="text-[12px] font-black text-white/20 uppercase tracking-[1em] block mb-10">{t('quote.booking.cargoSpec')}</span>
                                <div className="flex items-center gap-10 text-white group-hover:translate-x-2 transition-transform">
                                    <Package className="w-12 h-12 text-white/40" />
                                    <span className="text-4xl font-black italic uppercase tracking-tighter">{formData.cargoType} ({formData.containerSize}&apos; ST)</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[12px] font-black text-white/20 uppercase tracking-[1em] block mb-10">{t('quote.booking.estVelocity')}</span>
                                <div className="flex items-center gap-10 text-white group-hover:translate-x-2 transition-transform">
                                    <Zap className="w-12 h-12 text-white" />
                                    <span className="text-4xl font-black italic uppercase tracking-tighter">{selectedQuote.days} {t('quote.booking.days')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Alert */}
                <div className="bg-white/[0.03] p-12 border-t border-white/10">
                    <p className="text-[12px] font-black text-white/20 uppercase tracking-[1.5em] text-center flex items-center justify-center gap-12 italic">
                        <Shield className="w-6 h-6" /> {t('quote.booking.neuralVerification')}
                    </p>
                </div>
            </div>

            {/* Tactical Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-12 pb-48">
                <button
                    className="h-32 px-24 rounded-full border-2 border-white/10 bg-white/5 text-white hover:bg-white hover:text-black hover:border-white transition-all font-black text-[16px] uppercase tracking-[1.2em] active:scale-95 shadow-2xl"
                    onClick={() => window.location.href = '/'}
                >
                    <ArrowLeft className="w-8 h-8 mr-8" /> {t('quote.booking.returnHome')}
                </button>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="h-32 px-32 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-[18px] uppercase tracking-[1.5em] transition-all shadow-2xl active:scale-95"
                >
                    <LayoutDashboard className="w-8 h-8 mr-8" /> {t('quote.booking.missionControl')}
                </button>
            </div>
        </div>
    );
}
