'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, Clock, Plane, Ship, Check, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { API_URL } from '@/lib/config';

interface Quote {
    id: string;
    price: number;
    currency: string;
    transit_days: number;
    mode: string;
    company_name: string;
    logo_url: string;
    country: string;
    position: number; // 1, 2, or 3
}

export default function MarketplaceLiveDashboard() {
    const params = useParams();
    const uniqueId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [status, setStatus] = useState('OPEN'); // OPEN, CLOSED
    const [progress, setProgress] = useState(0); // 0 to 3

    // POLLING LOGIC
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const res = await fetch(`${API_URL}/api/marketplace/quotes/${uniqueId}`);
                const data = await res.json();

                if (data.quotes) {
                    setQuotes(data.quotes);
                    setProgress(data.quotes.length);
                    // If 3 quotes received, we can conceptually consider it 'done' for this MVP
                    if (data.status === 'CLOSED' || data.quotes.length >= 1) {
                        setStatus('CLOSED');
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchQuotes();

        // Poll every 5 seconds if not closed
        const interval = setInterval(() => {
            if (status !== 'CLOSED') {
                fetchQuotes();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [uniqueId, status]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-32">

                {/* Status Hero */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                    >
                        {status === 'CLOSED' ? (
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase font-inter mb-6 inline-flex items-center">
                                <CheckCircle className="w-3.5 h-3.5 mr-2" /> Analysis Protocol Complete
                            </div>
                        ) : (
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase font-inter mb-6 inline-flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-2 animate-pulse" /> Scanning Global Carrier Mesh
                            </div>
                        )}
                        <h1 className="text-4xl font-bold mb-4 tracking-tight font-outfit uppercase">Market Intelligence</h1>
                        <p className="text-zinc-500 font-medium font-inter max-w-lg mx-auto">Verified spot rates and strategic broker analysis for your operational requirements.</p>
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="mb-20 bg-white/[0.02] rounded-full h-1 overflow-hidden relative max-w-md mx-auto border border-white/5">
                    <motion.div
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: status === 'CLOSED' ? '100%' : `${Math.min((progress / 2) * 100, 90)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Quotes List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {quotes.map((quote, index) => (
                            <motion.div
                                key={quote.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-950 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 group hover:border-white/20 transition-all"
                            >
                                {/* Position Badge */}
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-xl bg-white text-black font-bold text-base flex items-center justify-center font-outfit shadow-xl">
                                        0{quote.position}
                                    </div>
                                </div>

                                {/* Company Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                        <h3 className="font-bold text-lg font-outfit uppercase tracking-tight">{quote.company_name}</h3>
                                        <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-zinc-500 font-inter tracking-widest">{quote.country}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-[11px] text-zinc-600 font-bold font-inter tracking-wide">
                                        <span className="flex items-center uppercase">
                                            {quote.mode === 'Air' ? <Plane className="w-3.5 h-3.5 mr-2 opacity-50" /> : <Ship className="w-3.5 h-3.5 mr-2 opacity-50" />}
                                            {quote.mode || 'Freight'}
                                        </span>
                                        <span className="opacity-20">•</span>
                                        <span className="uppercase text-emerald-500/70">{quote.transit_days} Transit Days</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-center md:text-right">
                                    <div className="text-2xl font-bold text-white mb-0.5 font-outfit">
                                        ${Number(quote.price).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] font-inter">Verified Spot Rate</div>
                                </div>

                                {/* Action */}
                                <div>
                                    <button className="bg-white text-black py-2.5 px-6 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-inter active:scale-95 shadow-xl flex items-center gap-2">
                                        Execute <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {quotes.length === 0 && !loading && (
                        <div className="text-center py-20 bg-zinc-950 rounded-[32px] border border-white/5 border-dashed">
                            <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                            </div>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] font-inter">Intercepting Operational Intelligence...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
