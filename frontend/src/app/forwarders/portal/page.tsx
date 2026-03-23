'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ArrowRight, Loader2, Package,
    TrendingUp, CheckCircle2, Clock,
    DollarSign, Ship, Truck, Info,
    BarChart3, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/config';
import Navbar from '@/components/layout/Navbar';
import { useT } from '@/lib/i18n/t';

export default function ForwarderPortal() {
    const t = useT();
    const { user } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [forwarderId, setForwarderId] = useState('');
    const [email, setEmail] = useState('');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [bidPrice, setBidPrice] = useState('');
    const [submittingBid, setSubmittingBid] = useState(false);
    const [bidSuccess, setBidSuccess] = useState(false);
    const [bidError, setBidError] = useState('');

    const [activeTab, setActiveTab] = useState<'requests' | 'conversations' | 'performance'>('requests');
    const [conversations, setConversations] = useState<any[]>([]);
    const [convLoading, setConvLoading] = useState(false);

    const [cvAmount, setCvAmount] = useState('');
    const [cvFrom, setCvFrom] = useState('USD');
    const [cvTo, setCvTo] = useState('EUR');
    const [cvResult, setCvResult] = useState<string | null>(null);
    const [cvLoading, setCvLoading] = useState(false);

    const switchTab = (tab: 'requests' | 'conversations' | 'performance') => {
        setActiveTab(tab);
        if (tab === 'conversations') {
            const id = localStorage.getItem('cl_fwd_id');
            const mail = localStorage.getItem('cl_fwd_email');
            if (id && mail) fetchConversations(id, mail);
        }
    };

    const fetchConversations = useCallback(async (id: string, mail: string) => {
        setConvLoading(true);
        try {
            const res = await apiFetch(
                `/api/forwarders/conversations/list`,
                { headers: { 'X-Forwarder-Id': id, 'X-Forwarder-Email': mail } }
            );
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch {
            // silent
        } finally {
            setConvLoading(false);
        }
    }, []);

    const fetchDashboardData = useCallback(async (id: string | null) => {
        if (!id) return;
        try {
            const token = localStorage.getItem('token');
            let res: Response;

            if (token && token !== 'null') {
                res = await apiFetch(`/api/forwarders/dashboard/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            } else {
                const storedEmail = localStorage.getItem('cl_fwd_email');
                if (!storedEmail) return;
                res = await apiFetch(`/api/forwarders/portal-dashboard/${id}?email=${encodeURIComponent(storedEmail)}`);
            }

            if (res.ok) {
                const data = await res.json();
                setDashboardData(data);
            }
        } catch {
            // silent
        }
    }, []);

    const handleAuth = useCallback(async (id: string, mail: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch(`/api/forwarders/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: id, email: mail })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('cl_fwd_id', id);
                localStorage.setItem('cl_fwd_email', mail);
                setIsAuthenticated(true);
                fetchDashboardData(id);
            } else {
                setError(data.detail || 'Invalid credentials. Check your Partner ID and email.');
                localStorage.removeItem('cl_fwd_id');
                localStorage.removeItem('cl_fwd_email');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [fetchDashboardData]);

    useEffect(() => {
        if (user && user.role === 'forwarder' && user.sovereign_id?.startsWith('REG-')) {
            localStorage.setItem('cl_fwd_id', user.sovereign_id);
            setIsAuthenticated(true);
            fetchDashboardData(user.sovereign_id);
        } else {
            const storedId = localStorage.getItem('cl_fwd_id');
            const storedEmail = localStorage.getItem('cl_fwd_email');
            if (storedId && storedEmail) {
                handleAuth(storedId, storedEmail);
            }
        }
    }, [user, fetchDashboardData, handleAuth]);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAuth(forwarderId.toUpperCase(), email);
    };

    useEffect(() => {
        const amount = parseFloat(cvAmount);
        if (!cvAmount || isNaN(amount) || amount <= 0) { setCvResult(null); return; }
        if (cvFrom === cvTo) { setCvResult(amount.toLocaleString(undefined, { maximumFractionDigits: 2 })); return; }
        const controller = new AbortController();
        setCvLoading(true);
        fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${cvFrom}&to=${cvTo}`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                const rate = data.rates?.[cvTo];
                setCvResult(rate != null ? Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) : null);
            })
            .catch(() => {})
            .finally(() => setCvLoading(false));
        return () => controller.abort();
    }, [cvAmount, cvFrom, cvTo]);

    const submitBid = async () => {
        if (!selectedRequest || !bidPrice) return;
        const price = parseFloat(bidPrice);
        if (isNaN(price) || price <= 0) {
            setBidError('Please enter a valid price greater than 0.');
            return;
        }
        setSubmittingBid(true);
        setBidError('');
        try {
            const res = await apiFetch(`/api/forwarders/portal-bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: selectedRequest.request_id,
                    forwarder_id: localStorage.getItem('cl_fwd_id'),
                    email: localStorage.getItem('cl_fwd_email'),
                    status: 'ANSWERED',
                    price,
                })
            });
            if (res.ok) {
                setBidSuccess(true);
                setBidPrice('');
                fetchDashboardData(localStorage.getItem('cl_fwd_id'));
                setTimeout(() => {
                    setBidSuccess(false);
                    setSelectedRequest(null);
                }, 2000);
            } else {
                const err = await res.json().catch(() => null);
                setBidError(err?.detail || 'Failed to submit quote. Please try again.');
            }
        } catch {
            setBidError('Network error. Please check your connection and try again.');
        } finally {
            setSubmittingBid(false);
        }
    };

    // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#080808] text-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h1 className="text-xl font-bold font-outfit text-white mb-1">{t('portal.title')}</h1>
                            <p className="text-xs text-zinc-500">{t('portal.sign.in.sub')}</p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-medium">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('portal.partner.id')}</label>
                                <input
                                    type="text"
                                    placeholder="REG-OMEGO-XXXX"
                                    value={forwarderId}
                                    onChange={e => setForwarderId(e.target.value)}
                                    className="w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-white/20 outline-none transition-colors placeholder-zinc-700 uppercase"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('portal.email')}</label>
                                <input
                                    type="email"
                                    placeholder="company@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-colors placeholder-zinc-700"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                            >
                                {loading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <>{t('portal.sign.in')} <ArrowRight className="w-3.5 h-3.5" /></>
                                }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────────
    const metrics = dashboardData?.metrics;
    const quotes = dashboardData?.quotes || [];
    const companyName = dashboardData?.company_name || user?.name || '—';
    const fwdId = localStorage.getItem('cl_fwd_id') || user?.sovereign_id || '';

    const tabLabels: Record<string, string> = {
        requests: t('portal.tab.requests'),
        conversations: t('portal.tab.messages'),
        performance: t('portal.tab.performance'),
    };

    return (
        <div className="h-screen bg-[#080808] text-white flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 flex flex-col min-h-0 px-6 pt-24 pb-6 gap-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-lg font-bold font-outfit text-white tracking-tight">{companyName}</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs font-mono text-zinc-500">{fwdId}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {t('portal.active')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1 flex-shrink-0">
                    {(['requests', 'conversations', 'performance'] as const).map((tab) => {
                        const hasUnread = tab === 'conversations' && conversations.some((c: any) => c.unread_count > 0);
                        return (
                            <button
                                key={tab}
                                onClick={() => switchTab(tab)}
                                className={`flex-1 relative py-2 px-4 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${
                                    activeTab === tab ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                                }`}
                            >
                                {tabLabels[tab]}
                                {hasUnread && (
                                    <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Conversations tab */}
                {activeTab === 'conversations' && (
                    <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-0">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('portal.active.conv')}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-700 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">
                                {conversations.length} {conversations.length === 1 ? t('portal.chat') : t('portal.chats')}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {convLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-16">
                                    <MessageSquare className="w-8 h-8 text-zinc-600" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">{t('portal.no.conv')}</p>
                                        <p className="text-xs text-zinc-600">{t('portal.no.conv.sub')}</p>
                                    </div>
                                </div>
                            ) : (
                                conversations.map((conv: any) => (
                                    <a
                                        key={conv.public_id}
                                        href={`/forwarders/chat/${conv.public_id}`}
                                        className="block p-4 rounded-xl border bg-black border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-zinc-600">{conv.request_id}</span>
                                                {conv.unread_count > 0 && (
                                                    <span className="text-[9px] font-semibold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{conv.unread_count}</span>
                                                )}
                                            </div>
                                            <span className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                conv.status === 'BOOKED' ? 'bg-emerald-500/10 text-emerald-400'
                                                : conv.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-500'
                                                : 'bg-white/5 text-zinc-500'
                                            }`}>
                                                {conv.status === 'BOOKED' ? t('portal.booked') : conv.status === 'CLOSED' ? t('portal.closed') : t('portal.open')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-400 truncate max-w-[180px]">
                                                {conv.last_message?.content || t('portal.no.messages')}
                                            </p>
                                            <div className="text-right flex-shrink-0 ml-3">
                                                <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">
                                                    {conv.agreed_price ? t('portal.agreed') : conv.current_offer ? t('portal.offer') : t('portal.quoted')}
                                                </p>
                                                <p className="text-sm font-bold font-mono text-white">
                                                    {conv.currency} {Number(conv.agreed_price ?? conv.current_offer ?? conv.original_price).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Main split — Requests + Performance tabs */}
                {activeTab !== 'conversations' && <div className="flex-1 flex gap-5 min-h-0">

                    {/* LEFT — Open Requests */}
                    <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('portal.open.requests')}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-700 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">
                                {quotes.length} {quotes.length === 1 ? t('portal.request.singular') : t('portal.requests.plural')}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {quotes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-16">
                                    <Clock className="w-8 h-8 text-zinc-600" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">{t('portal.no.requests')}</p>
                                        <p className="text-xs text-zinc-600">{t('portal.no.requests.sub')}</p>
                                    </div>
                                </div>
                            ) : (
                                quotes.map((quote: any) => {
                                    const isSelected = selectedRequest?.request_id === quote.request_id;
                                    return (
                                        <div
                                            key={quote.request_id}
                                            onClick={() => { setSelectedRequest(quote); setBidSuccess(false); }}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                                                isSelected
                                                    ? 'bg-emerald-500/[0.06] border-emerald-500/30 border-l-2 border-l-emerald-500'
                                                    : 'bg-black border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                                        isSelected ? 'bg-emerald-500 text-black' : 'bg-white/[0.03] border border-white/5 text-zinc-600 group-hover:bg-white/[0.06]'
                                                    }`}>
                                                        {quote.cargo_type?.includes('SEA') ? <Ship className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-sm font-bold text-white">{quote.origin}</span>
                                                            <ArrowRight className="w-3 h-3 text-zinc-600" />
                                                            <span className="text-sm font-bold text-white">{quote.destination}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono text-zinc-600">{quote.request_id}</span>
                                                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                            <span className="text-[10px] text-zinc-600 uppercase tracking-wide">{quote.cargo_type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">{t('portal.your.quote')}</p>
                                                    <p className={`text-sm font-bold font-mono ${quote.your_price > 0 ? 'text-emerald-400' : 'text-zinc-700'}`}>
                                                        {quote.your_price > 0 ? `USD ${quote.your_price.toLocaleString()}` : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT — Metrics + Bid Form */}
                    <div className="w-72 flex flex-col gap-4 flex-shrink-0">

                        {/* Metrics */}
                        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <TrendingUp className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('portal.performance')}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('portal.total.bids')}</p>
                                    <p className="text-xl font-bold text-white font-mono">{metrics?.total_quotes_submitted ?? '—'}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('portal.won')}</p>
                                    <p className="text-xl font-bold text-emerald-400 font-mono">{metrics?.won_bids ?? '—'}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('portal.reliability')}</p>
                                    <p className="text-xl font-bold text-white font-mono">{metrics?.reliability_score ?? 4.9}<span className="text-xs text-zinc-600">/5</span></p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('portal.status')}</p>
                                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {t('portal.active')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Currency Converter */}
                        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-3 h-3 text-zinc-600" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('portal.currency.conv')}</span>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    placeholder={t('portal.enter.amount')}
                                    value={cvAmount}
                                    onChange={e => setCvAmount(e.target.value)}
                                    className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-zinc-700 outline-none focus:border-white/10 transition-colors"
                                />
                                <div className="flex items-center gap-2">
                                    <select value={cvFrom} onChange={e => setCvFrom(e.target.value)} className="flex-1 bg-black border border-white/5 rounded-xl px-2 py-2 text-[11px] text-zinc-400 outline-none cursor-pointer">
                                        {['USD','EUR','GBP','JPY','CNY','AED','SGD','INR','SAR','AUD','CAD','CHF'].map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                    </select>
                                    <ArrowRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
                                    <select value={cvTo} onChange={e => setCvTo(e.target.value)} className="flex-1 bg-black border border-white/5 rounded-xl px-2 py-2 text-[11px] text-zinc-400 outline-none cursor-pointer">
                                        {['USD','EUR','GBP','JPY','CNY','AED','SGD','INR','SAR','AUD','CAD','CHF'].map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                    </select>
                                </div>
                                <div className="bg-black border border-white/[0.04] rounded-xl px-3 py-2 text-center min-h-[36px] flex items-center justify-center">
                                    {cvLoading ? (
                                        <span className="text-[10px] text-zinc-600">{t('portal.converting')}</span>
                                    ) : cvResult ? (
                                        <span className="text-sm font-semibold font-mono text-emerald-400">{cvTo} {cvResult}</span>
                                    ) : (
                                        <span className="text-[10px] text-zinc-700">{t('portal.enter.amount.above')}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bid Form */}
                        <div className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col">
                            {!selectedRequest ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 opacity-25">
                                    <CheckCircle2 className="w-8 h-8 text-zinc-600" />
                                    <p className="text-xs text-zinc-500">{t('portal.select.request')}</p>
                                </div>
                            ) : bidSuccess ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">{t('portal.quote.submitted')}</p>
                                        <p className="text-xs text-zinc-500">{t('portal.bid.sent')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('portal.submit.quote')}</span>
                                        <button onClick={() => setSelectedRequest(null)} className="text-[10px] text-zinc-600 hover:text-white transition-colors">{t('portal.cancel')}</button>
                                    </div>

                                    {/* Request summary */}
                                    <div className="bg-black border border-white/5 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Info className="w-3 h-3 text-zinc-600" />
                                            <span className="text-[10px] font-mono text-zinc-500">{selectedRequest.request_id}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                            <span>{selectedRequest.origin}</span>
                                            <ArrowRight className="w-3 h-3 text-zinc-600" />
                                            <span>{selectedRequest.destination}</span>
                                        </div>
                                        <span className="inline-block text-[9px] font-bold text-zinc-500 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                            {selectedRequest.cargo_type}
                                        </span>
                                    </div>

                                    {/* Price input */}
                                    <div className="flex-1 flex flex-col justify-end gap-3">
                                        <div>
                                            <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('portal.your.price')}</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={bidPrice}
                                                    onChange={e => setBidPrice(e.target.value)}
                                                    className="w-full bg-black border border-white/5 rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-emerald-400 placeholder-zinc-800 focus:border-emerald-500/30 outline-none transition-colors font-mono"
                                                />
                                            </div>
                                        </div>
                                        {bidError && (
                                            <p className="text-xs text-red-400 font-inter text-center px-1">{bidError}</p>
                                        )}
                                        <button
                                            disabled={!bidPrice || submittingBid}
                                            onClick={submitBid}
                                            className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98]"
                                        >
                                            {submittingBid
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <>{t('portal.submit.quote')} <ArrowRight className="w-3.5 h-3.5" /></>
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>}

            </div>
        </div>
    );
}
