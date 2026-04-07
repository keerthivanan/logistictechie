'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Loader2, Zap, MessageSquare, Search, ChevronLeft, Activity, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { apiFetch } from '@/lib/config';
import { useT } from '@/lib/i18n/t';

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
    const t = useT();
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [status, setStatus] = useState('OPEN');
    const [progress, setProgress] = useState(0);
    const [shipmentInfo, setShipmentInfo] = useState<any>(null);

    useEffect(() => {
        let retries = 0;
        const fetchQuotes = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { setFetchError('Not logged in. Please log in and try again.'); setLoading(false); return; }
                const res = await apiFetch(`/api/marketplace/request/${requestId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.status === 401) { setFetchError('Session expired. Please log in again.'); setLoading(false); return; }
                if (res.status === 403) { setFetchError('You are not authorised to view this request.'); setLoading(false); return; }
                if (res.status === 404) {
                    // Request may not be written yet — retry up to 3 times with 1s delay
                    if (retries < 3) { retries++; setTimeout(fetchQuotes, 1000); return; }
                    setFetchError('Request not found. It may still be processing — try refreshing in a moment.'); setLoading(false); return;
                }
                if (!res.ok) { setFetchError(`Server error (${res.status}). Please try again.`); setLoading(false); return; }
                const data = await res.json();
                setFetchError(null);
                if (data.quotations) {
                    setQuotes(data.quotations);
                    setProgress(data.quotations.length);
                }
                if (data.request) {
                    setShipmentInfo(data.request);
                    setStatus(data.request.status);
                }
            } catch {
                setFetchError('Network error. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();

        const interval = setInterval(() => {
            if (status !== 'CLOSED') fetchQuotes();
        }, 5000);

        return () => clearInterval(interval);
    }, [requestId, status]);

    const shortId = requestId?.slice(0, 8).toUpperCase();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-inter">
            <Navbar />

            {/* Sticky breadcrumb bar */}
            <div className="fixed top-16 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.05]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.push('/search')}
                        className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs font-medium"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        {t('mkt.back.search')}
                    </button>

                    <div className="flex items-center gap-2">
                        {shipmentInfo && (
                            <span className="text-[10px] font-mono text-zinc-600 bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-full">
                                {shipmentInfo.origin} → {shipmentInfo.destination}
                            </span>
                        )}
                        <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-widest ${
                            status === 'CLOSED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                        }`}>
                            {status === 'CLOSED'
                                ? <><CheckCircle2 className="w-3 h-3" /> {t('mkt.quoting.complete')}</>
                                : <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> {t('mkt.collecting')}</>
                            }
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.3em] mb-2">
                        REF · {shortId}
                    </p>
                    <h1 className="text-2xl font-semibold font-outfit uppercase tracking-tight text-white">
                        {t('mkt.live.results')}
                    </h1>
                    {shipmentInfo && (
                        <p className="text-sm text-zinc-500 mt-1 font-inter">
                            {shipmentInfo.origin} → {shipmentInfo.destination}
                        </p>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mb-8 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                            {status === 'CLOSED' ? t('mkt.progress.complete') : t('mkt.progress.collecting')}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${progress > 0 ? 'text-emerald-400' : 'text-zinc-600 animate-pulse'}`}>
                            {progress} / 3 {t('mkt.quotes.plural')}
                        </span>
                    </div>
                    <div className="bg-white/[0.04] rounded-full h-1 overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((progress / 3) * 100, 100)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Shipment details */}
                {shipmentInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden"
                    >
                        <div className="px-6 pt-5 pb-4 border-b border-white/[0.05]">
                            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.3em]">
                                {t('mkt.shipment.details')}
                            </p>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t('mkt.commodity')}</p>
                                <p className="text-xs font-semibold text-white truncate">{shipmentInfo.commodity || 'General Cargo'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t('mkt.cargo.spec')}</p>
                                <p className="text-xs font-semibold text-white truncate">{shipmentInfo.cargo_specification || 'Standard'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t('mkt.weight.vol')}</p>
                                <p className="text-xs font-semibold text-white">
                                    {shipmentInfo.weight_kg}kg{shipmentInfo.total_volume_cbm ? ` · ${shipmentInfo.total_volume_cbm}cbm` : ''}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t('mkt.ready.date')}</p>
                                <p className="text-xs font-semibold text-white">
                                    {shipmentInfo.pickup_ready_date ? new Date(shipmentInfo.pickup_ready_date).toLocaleDateString() : t('mkt.immediate')}
                                </p>
                            </div>
                        </div>
                        <div className="px-6 pb-5 flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-semibold text-zinc-600 border border-white/[0.06] px-2.5 py-1 rounded-full uppercase tracking-widest bg-white/[0.02]">
                                {shipmentInfo.cargo_type} · {shipmentInfo.incoterms}
                            </span>
                            {shipmentInfo.is_hazardous && (
                                <span className="text-[9px] font-semibold bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">
                                    {t('mkt.hazardous')}
                                </span>
                            )}
                            {shipmentInfo.is_stackable && (
                                <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                    {t('mkt.stackable')}
                                </span>
                            )}
                            {shipmentInfo.needs_insurance && (
                                <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                    {t('mkt.insured')}
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Heading when all quotes received */}
                {status === 'CLOSED' && quotes.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-[0.3em] mb-1">
                            {t('mkt.all.received')}
                        </p>
                        <h2 className="text-lg font-semibold font-outfit uppercase tracking-tight text-white">
                            {t('mkt.choose.fwd')}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">{t('mkt.choose.sub')}</p>
                    </motion.div>
                )}

                {/* Quotes card */}
                <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden">
                    <AnimatePresence>
                        {quotes.map((quote, index) => {
                            const isBestPrice = quotes.length > 0 && quote.total_price === Math.min(...quotes.map(q => q.total_price));
                            const validTransit = quotes.filter(q => q.transit_days != null);
                            const isFastest = validTransit.length > 0 && quote.transit_days != null && quote.transit_days === Math.min(...validTransit.map(q => q.transit_days!));
                            const initials = quote.forwarder_company?.slice(0, 2).toUpperCase() || '??';

                            return (
                                <motion.div
                                    key={quote.quotation_id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative p-6 border-b border-white/[0.05] last:border-b-0 ${isBestPrice ? 'bg-emerald-500/[0.03]' : ''}`}
                                >
                                    {/* Badges */}
                                    {(isBestPrice || isFastest) && (
                                        <div className="flex gap-2 mb-4">
                                            {isBestPrice && (
                                                <span className="text-[9px] font-semibold bg-emerald-500 text-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                                                    {t('mkt.best.price')}
                                                </span>
                                            )}
                                            {isFastest && (
                                                <span className="text-[9px] font-semibold bg-blue-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                                                    {t('mkt.fastest')}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        {/* Avatar + name */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold font-outfit ${
                                                isBestPrice ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'
                                            }`}>
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white font-outfit uppercase truncate">
                                                    {quote.forwarder_company}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] text-zinc-500 font-mono uppercase">{quote.carrier}</span>
                                                    <span className="text-[9px] text-zinc-700">·</span>
                                                    <span className="text-[9px] text-emerald-500 font-semibold uppercase">
                                                        {quote.transit_days ?? 'TBD'} {t('mkt.days')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="text-left sm:text-right">
                                            <p className={`text-2xl font-semibold font-outfit tracking-tighter ${isBestPrice ? 'text-emerald-400' : 'text-white'}`}>
                                                {quote.currency} {Number(quote.total_price).toLocaleString()}
                                            </p>
                                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-0.5">
                                                {t('mkt.all.in')}
                                            </p>
                                        </div>

                                        {/* Chat button */}
                                        <div className="flex-shrink-0 w-full sm:w-auto">
                                            <button
                                                onClick={async () => {
                                                    const token = localStorage.getItem('token');
                                                    const res = await apiFetch('/api/conversations/start', {
                                                        method: 'POST',
                                                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ request_id: requestId, quote_id: quote.quotation_id }),
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok && data.public_id) {
                                                        window.open(`/dashboard/messages/${data.public_id}`, '_blank');
                                                    }
                                                }}
                                                className={`w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-6 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all active:scale-95 ${
                                                    isBestPrice
                                                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/[0.08]'
                                                }`}
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                {t('mkt.chat')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* AI insight */}
                                    {quote.ai_summary && (
                                        <div className="mt-4 flex items-start gap-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                                            <Zap className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-zinc-500 leading-relaxed italic">{quote.ai_summary}</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Loading state */}
                    {loading && (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="relative w-14 h-14 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                    <Ship className="w-6 h-6 text-zinc-600" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-400 font-outfit uppercase">{t('mkt.waiting')}</p>
                        </div>
                    )}

                    {/* Error state */}
                    {fetchError && quotes.length === 0 && !loading && (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <p className="text-sm font-semibold text-zinc-400 font-outfit uppercase mb-2">{t('mkt.failed')}</p>
                            <p className="text-xs text-zinc-500 mb-2 max-w-xs">{fetchError}</p>
                            <div className="flex items-center gap-4 mt-4">
                                <button onClick={() => window.location.reload()} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-xl transition-colors">
                                    Retry
                                </button>
                                <button onClick={() => router.back()} className="text-xs text-zinc-500 hover:text-white underline underline-offset-4 transition-colors">
                                    {t('mkt.go.back')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Waiting for more quotes */}
                    {!loading && !fetchError && quotes.length < 3 && quotes.length > 0 && (
                        <div className="p-6 border-t border-white/[0.05] flex items-center gap-3 text-xs text-zinc-600">
                            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                            <span>{t('mkt.waiting.sub')}</span>
                        </div>
                    )}

                    {/* No quotes yet */}
                    {!loading && !fetchError && quotes.length === 0 && (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="relative w-14 h-14 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-zinc-600" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-400 font-outfit uppercase mb-2">{t('mkt.waiting')}</p>
                            <p className="text-xs text-zinc-600 max-w-xs">{t('mkt.waiting.sub')}</p>
                            <div className="mt-8 pt-6 border-t border-white/[0.05] w-full max-w-xs">
                                <p className="text-[10px] text-zinc-700 uppercase tracking-widest mb-4">{t('mkt.need.now')}</p>
                                <Link
                                    href="/search"
                                    className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/[0.08] px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-white/20 transition-all"
                                >
                                    <Search className="w-3.5 h-3.5" /> {t('mkt.get.instant')}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[9px] font-semibold text-zinc-800 uppercase tracking-[0.6em]">CargoLink · Freight Marketplace</p>
                </div>
            </div>
        </div>
    );
}
