'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, BrainCircuit, Activity, Zap, Search, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { apiFetch } from '@/lib/config';

interface Quote {
    quotation_id: string;
    total_price: number;
    currency: string;
    transit_days: number | null;
    forwarder_company: string;
    ai_summary: string | null;
    carrier: string;
    service_type: string;
    received_at: string;
}

export default function MarketplaceLiveDashboard() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [status, setStatus] = useState('OPEN');
    const [progress, setProgress] = useState(0);
    const [shipmentInfo, setShipmentInfo] = useState<any>(null);

    // POLLING LOGIC
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await apiFetch(`/api/marketplace/request/${requestId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error('Network error');
                const data = await res.json();

                if (data.quotations) {
                    setQuotes(data.quotations);
                    setProgress(data.quotations.length);
                }
                if (data.request) {
                    setShipmentInfo(data.request);
                    setStatus(data.request.status);
                }
            } catch {
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();

        const interval = setInterval(() => {
            if (status !== 'CLOSED') {
                fetchQuotes();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [requestId, status]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-inter">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-32 mb-20">

                {/* Tactical Status */}
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                    >
                        {status === 'CLOSED' ? (
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase mb-10 inline-flex items-center shadow-lg shadow-emerald-500/5">
                                <Activity className="w-4 h-4 mr-3" /> Quoting Complete
                            </div>
                        ) : (
                            <div className="bg-white/5 text-zinc-400 border border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase mb-10 inline-flex items-center">
                                <BrainCircuit className="w-4 h-4 mr-3 animate-pulse text-emerald-500" /> Collecting Forwarder Quotes...
                            </div>
                        )}
                        <h1 className="text-5xl font-black mb-6 tracking-tighter font-outfit uppercase bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                            Live Quote <span className="text-white">Results</span>
                        </h1>
                        <p className="text-zinc-500 font-medium max-w-xl mx-auto text-sm leading-relaxed">
                            Request: <span className="text-zinc-200 font-mono tracking-widest">{requestId}</span>
                            <br />
                            {shipmentInfo?.origin} → {shipmentInfo?.destination}
                        </p>
                    </motion.div>
                </div>

                {/* Matrix Progress */}
                <div className="max-w-lg mx-auto mb-20 relative">
                    <div className="bg-white/[0.03] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <motion.div
                            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((progress / 3) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">
                        <span>{status === 'CLOSED' ? 'Quoting Complete' : 'Collecting Quotes'}</span>
                        <span className={progress > 0 ? 'text-emerald-500' : 'animate-pulse'}>
                            {progress} {progress === 1 ? 'Quote' : 'Quotes'} Received
                        </span>
                    </div>
                </div>

                {/* Shipment Details (1000% Perfection Grid) */}
                {shipmentInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-2">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Commodity</p>
                            <p className="text-xs font-black text-white uppercase truncate">{shipmentInfo.commodity || 'General Cargo'}</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-2">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Cargo Spec</p>
                            <p className="text-xs font-black text-white uppercase truncate">{shipmentInfo.cargo_specification || 'Standard'}</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-2">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Weight / Volume</p>
                            <p className="text-xs font-black text-white uppercase">
                                {shipmentInfo.weight_kg}KG {shipmentInfo.total_volume_cbm ? `| ${shipmentInfo.total_volume_cbm}CBM` : ''}
                            </p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-2">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Ready Date</p>
                            <p className="text-xs font-black text-white uppercase">
                                {shipmentInfo.pickup_ready_date ? new Date(shipmentInfo.pickup_ready_date).toLocaleDateString() : 'IMMEDIATE'}
                            </p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-2">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Vessel Preference</p>
                            <p className="text-xs font-black text-white uppercase truncate">{shipmentInfo.vessel || 'Any Ready'}</p>
                        </div>

                        {/* Secondary Details Row */}
                        <div className="col-span-2 md:col-span-4 bg-white/[0.01] border border-dashed border-white/5 p-4 rounded-xl flex flex-col gap-4">
                            <div className="flex flex-wrap gap-6 items-center justify-between">
                                <div className="flex gap-4">
                                    {shipmentInfo.is_hazardous && <span className="text-[8px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest">Hazardous</span>}
                                    {shipmentInfo.is_stackable && <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Stackable</span>}
                                    {shipmentInfo.needs_insurance && <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">Insured</span>}
                                </div>
                                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                    Protocol: <span className="text-zinc-300 ml-1">{shipmentInfo.cargo_type} · {shipmentInfo.incoterms}</span>
                                </div>
                            </div>
                            {shipmentInfo.special_requirements && (
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Special Requirements</p>
                                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{shipmentInfo.special_requirements}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Choose Your Forwarder heading — shown when all quotes are in */}
                {status === 'CLOSED' && quotes.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-2 text-center"
                    >
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">All Quotes Received</p>
                        <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-white">Choose Your Forwarder</h2>
                        <p className="text-xs text-zinc-500 mt-2 font-inter">Select the quote that best fits your timeline and budget.</p>
                    </motion.div>
                )}

                {/* Analysis Cards */}
                <div className="grid gap-6">
                    <AnimatePresence>
                        {quotes.map((quote, index) => {
                            const isBestPrice = quotes.length > 0 && quote.total_price === Math.min(...quotes.map(q => q.total_price))
                            const validTransit = quotes.filter(q => q.transit_days != null)
                            const isFastest = validTransit.length > 0 && quote.transit_days != null && quote.transit_days === Math.min(...validTransit.map(q => q.transit_days!))
                            return (
                            <motion.div
                                key={quote.quotation_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.15 }}
                                className="group relative"
                            >
                                {/* Comparison badges */}
                                {(isBestPrice || isFastest) && (
                                    <div className="absolute -top-3 left-8 flex gap-2 z-10">
                                        {isBestPrice && (
                                            <span className="text-[9px] font-black bg-emerald-500 text-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                                                Best Price
                                            </span>
                                        )}
                                        {isFastest && (
                                            <span className="text-[9px] font-black bg-blue-500 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/30">
                                                Fastest
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className={`bg-[#050505] border rounded-[2rem] p-10 flex flex-col lg:flex-row items-center gap-10 hover:border-white/20 transition-all shadow-2xl ${isBestPrice ? 'border-emerald-500/20' : 'border-white/5'}`}>
                                    {/* Rank */}
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-white text-black font-black text-xl flex items-center justify-center font-outfit">
                                            0{index + 1}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 text-center lg:text-left space-y-4">
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <h3 className="font-black text-2xl font-outfit uppercase tracking-tight text-white">{quote.forwarder_company}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-lg text-zinc-500 uppercase tracking-widest border border-white/5">
                                                    {quote.carrier}
                                                </span>
                                                <span className="text-[10px] font-black bg-emerald-500/10 px-3 py-1 rounded-lg text-emerald-500 uppercase tracking-widest border border-emerald-500/10">
                                                    {quote.transit_days || 'TBD'} DAYS
                                                </span>
                                            </div>
                                        </div>

                                        {/* AI Insight */}
                                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-start gap-3">
                                            <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-zinc-400 text-xs font-medium leading-relaxed italic">
                                                {quote.ai_summary || "Analyzing carrier performance metrics and logistics compatibility..."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-center lg:text-right px-6">
                                        <div className="text-4xl font-black text-white mb-2 font-outfit tracking-tighter">
                                            {quote.currency} {Number(quote.total_price).toLocaleString()}
                                        </div>
                                        <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">All-in Quote</div>
                                    </div>

                                    {/* Chat with Forwarder */}
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={async () => {
                                                const token = localStorage.getItem('token')
                                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/conversations/start`, {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ request_id: requestId, quote_id: quote.quotation_id }),
                                                })
                                                const data = await res.json()
                                                if (res.ok && data.public_id) {
                                                    window.open(`/dashboard/messages/${data.public_id}`, '_blank')
                                                }
                                            }}
                                            className="bg-white text-black h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all font-inter active:scale-95 shadow-xl flex items-center gap-3"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Chat
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                            )
                        })}
                    </AnimatePresence>

                    {/* Error State */}
                    {fetchError && quotes.length === 0 && !loading && (
                        <div className="mt-10 p-20 bg-[#020202] rounded-[3rem] border border-red-500/10 border-dashed flex flex-col items-center justify-center text-center">
                            <h4 className="text-lg font-bold text-zinc-400 mb-2 font-outfit uppercase">Failed to Load</h4>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] max-w-xs leading-loose mb-6">
                                Could not load shipment details. Please try again.
                            </p>
                            <button onClick={() => router.back()} className="text-xs text-white underline underline-offset-4 hover:text-zinc-300 transition-colors">
                                Go Back
                            </button>
                        </div>
                    )}

                    {/* Pending State */}
                    {quotes.length < 3 && !loading && !fetchError && (
                        <div className="mt-10 p-20 bg-[#020202] rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-8 border border-white/10">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-400 mb-2 font-outfit uppercase">Waiting for Quotes</h4>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] max-w-xs leading-loose">
                                Forwarders are reviewing your request. You&apos;ll be notified when quotes arrive.
                            </p>
                            <div className="mt-8 pt-8 border-t border-white/5 w-full max-w-xs">
                                <p className="text-[10px] text-zinc-700 uppercase tracking-widest mb-4">Need quotes right now?</p>
                                <Link
                                    href="/search"
                                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                                >
                                    <Search className="w-3.5 h-3.5" /> Get Instant Quote
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-32 pt-20 border-t border-white/5 text-center opacity-20">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.8em]">CargoLink · Freight Marketplace</p>
                </div>
            </div>
        </div>
    );
}

