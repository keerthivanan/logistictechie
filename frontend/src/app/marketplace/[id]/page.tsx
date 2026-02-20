'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, Clock, Plane, Ship, DollarSign, AlertCircle } from 'lucide-react';
import Link from 'next/link';
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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pb-20">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-12">

                {/* Status Hero */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                    >
                        {status === 'CLOSED' ? (
                            <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-6 py-2 rounded-full font-mono mb-4 inline-flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> ANALYSIS COMPLETE
                            </div>
                        ) : (
                            <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-6 py-2 rounded-full font-mono mb-4 inline-flex items-center">
                                <Clock className="w-4 h-4 mr-2 animate-pulse" /> SCANNING GLOBAL CARRIERS
                            </div>
                        )}
                        <h1 className="text-4xl font-bold mb-2">Live Market Intelligence</h1>
                        <p className="text-gray-400">Verified spot rates and AI-broker analysis for your shipment.</p>
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="mb-16 bg-white/5 rounded-full h-4 overflow-hidden relative max-w-xl mx-auto border border-white/5">
                    <motion.div
                        className="absolute left-0 top-0 bottom-0 bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: status === 'CLOSED' ? '100%' : `${Math.min((progress / 2) * 100, 90)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-10 text-[10px] font-bold text-black/50">
                        <span>NETWORK DISPATCHED</span>
                        <span>ANALYZING</span>
                        <span>FINALIZING</span>
                    </div>
                </div>

                {/* Quotes List */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {quotes.map((quote, index) => (
                            <motion.div
                                key={quote.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 group hover:border-white/30 transition-colors"
                            >
                                {/* Position Badge */}
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-white text-black font-bold text-xl flex items-center justify-center">
                                        #{quote.position}
                                    </div>
                                </div>

                                {/* Company Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <h3 className="font-bold text-xl">{quote.company_name}</h3>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">{quote.country}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                                        <span className="flex items-center">
                                            {quote.mode === 'Air' ? <Plane className="w-4 h-4 mr-1" /> : <Ship className="w-4 h-4 mr-1" />}
                                            {quote.mode || 'Freight'}
                                        </span>
                                        <span>•</span>
                                        <span>{quote.transit_days} Days Transit</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-center md:text-right">
                                    <div className="text-3xl font-bold font-mono text-white mb-1">
                                        ${Number(quote.price).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{quote.currency} ALL IN</div>
                                </div>

                                {/* Action */}
                                <div>
                                    <button className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors">
                                        Select Quote
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {quotes.length === 0 && !loading && (
                        <div className="text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 opacity-50" />
                            <p>Contacting 150+ forwarders...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
