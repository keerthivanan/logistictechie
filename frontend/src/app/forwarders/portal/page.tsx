'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, Loader2, Package,
    TrendingUp, CheckCircle2, Clock,
    DollarSign, Ship, Truck,
    BarChart3, MessageSquare, Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/config';
import Navbar from '@/components/layout/Navbar';
import { useT } from '@/lib/i18n/t';

export default function ForwarderPortal() {
    const t = useT();
    const { user } = useAuth();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [forwarderId, setForwarderId] = useState('');
    const [email, setEmail] = useState('');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [bidPrice, setBidPrice] = useState('');
    const [bidCurrency, setBidCurrency] = useState('USD');
    const [bidCarrier, setBidCarrier] = useState('');
    const [bidTransitDays, setBidTransitDays] = useState('');
    const [submittingBid, setSubmittingBid] = useState(false);
    const [bidSuccess, setBidSuccess] = useState(false);
    const [bidError, setBidError] = useState('');

    const [activeTab, setActiveTab] = useState<'requests' | 'conversations' | 'network'>('requests');
    const [conversations, setConversations] = useState<any[]>([]);
    const [convLoading, setConvLoading] = useState(false);

    // ── F2F Network state ──────────────────────────────────────────────────
    const [myF2fPosts, setMyF2fPosts] = useState<any[]>([]);
    const [f2fConvs, setF2fConvs] = useState<any[]>([]);
    const [f2fBrowse, setF2fBrowse] = useState<any[]>([]);
    const [f2fQuotingId, setF2fQuotingId] = useState<string | null>(null);
    const [f2fQuotePrice, setF2fQuotePrice] = useState('');
    const [f2fQuoteCurrency, setF2fQuoteCurrency] = useState('USD');
    const [f2fQuoteTransit, setF2fQuoteTransit] = useState('');
    const [f2fQuoteNotes, setF2fQuoteNotes] = useState('');
    const [f2fQuoting, setF2fQuoting] = useState(false);
    const [f2fQuoteSuccess, setF2fQuoteSuccess] = useState<string | null>(null);

    const [cvAmount, setCvAmount] = useState('');
    const [cvFrom, setCvFrom] = useState('USD');
    const [cvTo, setCvTo] = useState('EUR');
    const [cvResult, setCvResult] = useState<string | null>(null);
    const [cvLoading, setCvLoading] = useState(false);

    const switchTab = (tab: 'requests' | 'conversations' | 'network') => {
        setActiveTab(tab);
        const id = localStorage.getItem('cl_fwd_id');
        const mail = localStorage.getItem('cl_fwd_email');
        if (!id || !mail) return;
        if (tab === 'conversations') fetchConversations(id, mail);
        if (tab === 'network') {
            Promise.all([fetchMyF2fPosts(id, mail), fetchF2fConvs(id, mail), fetchF2fBrowse(id, mail)]);
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

    const fetchMyF2fPosts = useCallback(async (id: string, mail: string) => {
        try {
            const res = await apiFetch('/api/f2f/my-requests', { headers: { 'X-Forwarder-Id': id, 'X-Forwarder-Email': mail } });
            if (res.ok) { const d = await res.json(); setMyF2fPosts(d.requests || []); }
        } catch { /* silent */ }
    }, []);

    const fetchF2fConvs = useCallback(async (id: string, mail: string) => {
        try {
            const res = await apiFetch('/api/f2f/conversations', { headers: { 'X-Forwarder-Id': id, 'X-Forwarder-Email': mail } });
            if (res.ok) { const d = await res.json(); setF2fConvs(d.conversations || []); }
        } catch { /* silent */ }
    }, []);

    const fetchF2fBrowse = useCallback(async (id: string, mail: string) => {
        try {
            const res = await apiFetch('/api/f2f/requests', { headers: { 'X-Forwarder-Id': id, 'X-Forwarder-Email': mail } });
            if (res.ok) { const d = await res.json(); setF2fBrowse(d.requests || []); }
        } catch { /* silent */ }
    }, []);

    const submitF2fQuote = async (requestPublicId: string) => {
        const id = localStorage.getItem('cl_fwd_id') || '';
        const mail = localStorage.getItem('cl_fwd_email') || '';
        const price = parseFloat(f2fQuotePrice);
        if (!price || price <= 0 || f2fQuoting) return;
        setF2fQuoting(true);
        try {
            const res = await apiFetch(`/api/f2f/requests/${requestPublicId}/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Forwarder-Id': id, 'X-Forwarder-Email': mail },
                body: JSON.stringify({
                    price,
                    currency: f2fQuoteCurrency,
                    transit_days: f2fQuoteTransit ? parseInt(f2fQuoteTransit) : undefined,
                    notes: f2fQuoteNotes || undefined,
                }),
            });
            if (res.ok) {
                setF2fQuoteSuccess(requestPublicId);
                setF2fQuotingId(null);
                setF2fQuotePrice(''); setF2fQuoteTransit(''); setF2fQuoteNotes('');
                await fetchF2fBrowse(id, mail);
                setTimeout(() => setF2fQuoteSuccess(null), 3000);
            }
        } catch { /* silent */ } finally { setF2fQuoting(false); }
    };


    const acceptF2fQuote = async (requestPublicId: string, quoteId: number) => {
        const id = localStorage.getItem('cl_fwd_id') || '';
        const mail = localStorage.getItem('cl_fwd_email') || '';
        try {
            const res = await apiFetch(`/api/f2f/requests/${requestPublicId}/accept/${quoteId}`, {
                method: 'POST',
                headers: { 'X-Forwarder-Id': id, 'X-Forwarder-Email': mail },
            });
            if (res.ok) {
                const d = await res.json();
                await fetchMyF2fPosts(id, mail);
                await fetchF2fConvs(id, mail);
                if (d.conv_public_id) window.location.href = `/forwarders/f2f-chat/${d.conv_public_id}`;
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || 'Failed to accept quote. It may have already been accepted by someone else.');
                await fetchMyF2fPosts(id, mail);
            }
        } catch {
            alert('Network error — please try again.');
        }
    };

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
        let id: string | null = null;
        if (user && user.role === 'forwarder') {
            const fwdId = user.forwarder_id || localStorage.getItem('forwarder_id') || user.sovereign_id;
            localStorage.setItem('cl_fwd_id', fwdId);
            if (user.email) localStorage.setItem('cl_fwd_email', user.email);
            setIsAuthenticated(true);
            id = fwdId;
            fetchDashboardData(id);
        } else {
            const storedId = localStorage.getItem('cl_fwd_id');
            const storedEmail = localStorage.getItem('cl_fwd_email');
            if (storedId && storedEmail) {
                handleAuth(storedId, storedEmail);
                id = storedId;
            }
        }
        if (!id) return;
        const iv = setInterval(() => fetchDashboardData(id), 15000);
        return () => clearInterval(iv);
    }, [user, fetchDashboardData, handleAuth]);

    // Poll conversations tab every 10s when it's active — keeps unread counts + messages live
    useEffect(() => {
        if (!isAuthenticated || activeTab !== 'conversations') return;
        const id = localStorage.getItem('cl_fwd_id');
        const mail = localStorage.getItem('cl_fwd_email');
        if (!id || !mail) return;
        const iv = setInterval(() => fetchConversations(id, mail), 10000);
        return () => clearInterval(iv);
    }, [isAuthenticated, activeTab, fetchConversations]);

    // Poll F2F network tab every 15s
    useEffect(() => {
        if (!isAuthenticated || activeTab !== 'network') return;
        const id = localStorage.getItem('cl_fwd_id');
        const mail = localStorage.getItem('cl_fwd_email');
        if (!id || !mail) return;
        const iv = setInterval(() => {
            fetchMyF2fPosts(id, mail);
            fetchF2fConvs(id, mail);
            fetchF2fBrowse(id, mail);
        }, 15000);
        return () => clearInterval(iv);
    }, [isAuthenticated, activeTab, fetchMyF2fPosts, fetchF2fConvs, fetchF2fBrowse]);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAuth(forwarderId.toUpperCase(), email);
    };

    useEffect(() => {
        const amount = parseFloat(cvAmount);
        if (!cvAmount || isNaN(amount) || amount <= 0) { setCvResult(null); return; }
        if (cvFrom === cvTo) { setCvResult(amount.toLocaleString(undefined, { maximumFractionDigits: 2 })); return; }
        const controller = new AbortController();
        setCvResult(null);
        setCvLoading(true);
        fetch(`https://api.frankfurter.app/latest?from=${cvFrom}&to=${cvTo}&amount=${amount}`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                const rate = data.rates?.[cvTo];
                setCvResult(rate != null ? Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) : null);
            })
            .catch(() => { setCvResult(null); })
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
                    currency: bidCurrency,
                    carrier: bidCarrier || undefined,
                    transit_days: bidTransitDays ? parseInt(bidTransitDays) : undefined,
                })
            });
            if (res.ok) {
                setBidSuccess(true);
                setBidPrice('');
                setBidCarrier('');
                setBidTransitDays('');
                setBidCurrency('USD');
                fetchDashboardData(localStorage.getItem('cl_fwd_id'));
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
                            <div className="w-12 h-12 bg-white/[0.06] border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-5 h-5 text-white" />
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
    const openRequests = dashboardData?.open_requests || [];

    const companyName = dashboardData?.company_name || user?.name || '—';
    const fwdId = localStorage.getItem('cl_fwd_id') || user?.sovereign_id || '';

    const tabLabels: Record<string, string> = {
        requests: t('portal.tab.requests'),
        conversations: t('portal.tab.messages'),
        network: 'F2F Network',
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
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {t('portal.active')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1 flex-shrink-0">
                    {(['requests', 'conversations', 'network'] as const).map((tab) => {
                        const hasUnread = tab === 'conversations' && conversations.some((c: any) => c.unread_count > 0);
                        const hasF2fUnread = tab === 'network' && f2fConvs.some((c: any) => c.unread_count > 0);
                        return (
                            <button
                                key={tab}
                                onClick={() => switchTab(tab)}
                                className={`flex-1 relative py-2 px-3 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${
                                    activeTab === tab ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                                }`}
                            >
                                {tabLabels[tab]}
                                {(hasUnread || hasF2fUnread) && (
                                    <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── F2F Network tab — 2-column: Browse left, My Posts right ── */}
                {activeTab === 'network' && (
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">

                        {/* LEFT — Browse other forwarders' open requests */}
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-0">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <Package className="w-3.5 h-3.5 text-zinc-600" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Browse & Quote</span>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-700 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">{f2fBrowse.length} open</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                                {f2fBrowse.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-16">
                                        <Package className="w-8 h-8 text-zinc-600" />
                                        <p className="text-sm font-bold text-white">No open requests</p>
                                        <p className="text-xs text-zinc-600">When other forwarders post F2F requests they appear here</p>
                                    </div>
                                ) : f2fBrowse.map((r: any) => (
                                    <div key={r.public_id} className="bg-black border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">{r.origin}</span>
                                                <ArrowRight className="w-3 h-3 text-zinc-600" />
                                                <span className="text-sm font-bold text-white">{r.destination}</span>
                                                <span className="text-[9px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full uppercase">{r.cargo_type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {f2fQuoteSuccess === r.public_id && <span className="text-[9px] font-bold text-emerald-400">Quote sent!</span>}
                                                {!r.already_quoted && f2fQuoteSuccess !== r.public_id && (
                                                    <button onClick={() => setF2fQuotingId(f2fQuotingId === r.public_id ? null : r.public_id)}
                                                        className="text-[10px] font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-all">
                                                        {f2fQuotingId === r.public_id ? 'Cancel' : 'Quote'}
                                                    </button>
                                                )}
                                                {r.already_quoted && <span className="text-[9px] font-bold text-zinc-600 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">Quoted</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                                            <span>{r.posted_by_company}</span>
                                            {r.commodity && <><span className="w-1 h-1 rounded-full bg-zinc-800" /><span>{r.commodity}</span></>}
                                            {r.weight_kg && <><span className="w-1 h-1 rounded-full bg-zinc-800" /><span>{Number(r.weight_kg).toLocaleString()} kg</span></>}
                                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                            <span>{r.quote_count} quote{r.quote_count !== 1 ? 's' : ''}</span>
                                        </div>
                                        {r.notes && <p className="text-[10px] text-zinc-600 mt-1 truncate">{r.notes}</p>}
                                        {f2fQuotingId === r.public_id && (
                                            <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">Currency</label>
                                                    <select value={f2fQuoteCurrency} onChange={e => setF2fQuoteCurrency(e.target.value)}
                                                        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white outline-none">
                                                        {['USD','EUR','SAR','AED','GBP','CNY'].map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">Your Price *</label>
                                                    <input type="number" placeholder="0.00" value={f2fQuotePrice} onChange={e => setF2fQuotePrice(e.target.value)}
                                                        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-white/20" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">Transit Days</label>
                                                    <input type="number" placeholder="e.g. 14" value={f2fQuoteTransit} onChange={e => setF2fQuoteTransit(e.target.value)}
                                                        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-white/20" />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">Notes</label>
                                                    <input placeholder="Optional" value={f2fQuoteNotes} onChange={e => setF2fQuoteNotes(e.target.value)}
                                                        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/20" />
                                                </div>
                                                <div className="col-span-2 flex justify-end">
                                                    <button onClick={() => submitF2fQuote(r.public_id)} disabled={!f2fQuotePrice || f2fQuoting}
                                                        className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg hover:bg-zinc-100 transition-all disabled:opacity-30 flex items-center gap-1.5">
                                                        {f2fQuoting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Submit Quote'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT — My Posted Requests */}
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-0">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <Package className="w-3.5 h-3.5 text-zinc-600" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">My Posts</span>
                                </div>
                                <button onClick={() => router.push('/forwarders/f2f')}
                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-all">
                                    <Plus className="w-3 h-3" /> Post Request
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                {myF2fPosts.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-16">
                                        <Plus className="w-8 h-8 text-zinc-600" />
                                        <p className="text-sm font-bold text-white">No requests yet</p>
                                        <p className="text-xs text-zinc-600">Post a request to get quotes from other forwarders</p>
                                    </div>
                                ) : myF2fPosts.map((r: any) => (
                                    <div key={r.public_id} className="bg-black border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">{r.origin}</span>
                                                <ArrowRight className="w-3 h-3 text-zinc-600" />
                                                <span className="text-sm font-bold text-white">{r.destination}</span>
                                                <span className="text-[9px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full uppercase">{r.cargo_type}</span>
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                r.status === 'MATCHED' ? 'bg-emerald-500/10 text-emerald-400'
                                                : r.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-500'
                                                : 'bg-white/5 text-zinc-400'}`}>{r.status}</span>
                                        </div>
                                        {r.quotes.length === 0 ? (
                                            <p className="text-xs text-zinc-600">No quotes yet. Forwarders have been notified.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{r.quotes.length} Quote{r.quotes.length !== 1 ? 's' : ''} Received</p>
                                                {r.quotes.map((q: any) => (
                                                    <div key={q.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5">
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{q.company_name}</p>
                                                            {q.transit_days && <p className="text-[10px] text-zinc-600">{q.transit_days} days transit</p>}
                                                            {q.notes && <p className="text-[10px] text-zinc-600 truncate max-w-[160px]">{q.notes}</p>}
                                                        </div>
                                                        <div className="text-right flex items-center gap-3">
                                                            <div>
                                                                <p className="text-sm font-bold font-mono text-white">{q.currency} {Number(q.price).toLocaleString()}</p>
                                                                <p className={`text-[9px] font-bold uppercase ${q.status === 'ACCEPTED' ? 'text-emerald-400' : q.status === 'REJECTED' ? 'text-zinc-600' : 'text-zinc-500'}`}>{q.status}</p>
                                                            </div>
                                                            {r.status === 'OPEN' && q.status === 'PENDING' && (
                                                                <button onClick={() => acceptF2fQuote(r.public_id, q.id)}
                                                                    className="text-[10px] font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-all">
                                                                    Accept
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {/* Messages tab — shipper chats + F2F chats unified */}
                {activeTab === 'conversations' && (
                    <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-0">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">All Messages</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-700 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">
                                {conversations.length + f2fConvs.length} chats
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {convLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
                                </div>
                            ) : conversations.length === 0 && f2fConvs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-16">
                                    <MessageSquare className="w-8 h-8 text-zinc-600" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">{t('portal.no.conv')}</p>
                                        <p className="text-xs text-zinc-600">{t('portal.no.conv.sub')}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {conversations.length > 0 && (
                                        <>
                                            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest px-1">Shipper Chats</p>
                                            {conversations.map((conv: any) => (
                                                <a key={conv.public_id} href={`/forwarders/chat/${conv.public_id}`}
                                                    className="block p-4 rounded-xl border bg-black border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono text-zinc-600">{conv.request_id}</span>
                                                            {conv.unread_count > 0 && <span className="text-[9px] font-semibold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{conv.unread_count}</span>}
                                                        </div>
                                                        <span className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${conv.status === 'BOOKED' ? 'bg-white/[0.06] text-white' : conv.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-500' : 'bg-white/5 text-zinc-500'}`}>
                                                            {conv.status === 'BOOKED' ? t('portal.booked') : conv.status === 'CLOSED' ? t('portal.closed') : t('portal.open')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-zinc-400 truncate max-w-[180px]">{conv.last_message?.content || t('portal.no.messages')}</p>
                                                        <div className="text-right flex-shrink-0 ml-3">
                                                            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">{conv.agreed_price ? t('portal.agreed') : conv.current_offer ? t('portal.offer') : t('portal.quoted')}</p>
                                                            <p className="text-sm font-bold font-mono text-white">{conv.currency} {Number(conv.agreed_price ?? conv.current_offer ?? conv.original_price).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </>
                                    )}
                                    {f2fConvs.length > 0 && (
                                        <>
                                            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest px-1 pt-2">F2F Chats</p>
                                            {f2fConvs.map((c: any) => (
                                                <a key={c.public_id} href={`/forwarders/f2f-chat/${c.public_id}`}
                                                    className="block p-4 rounded-xl border bg-black border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-white">{c.other_company}</span>
                                                            <span className="text-[9px] bg-amber-500/10 text-amber-400/70 px-1.5 py-0.5 rounded font-medium">{c.my_role}</span>
                                                            {c.unread_count > 0 && <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{c.unread_count}</span>}
                                                        </div>
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${c.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : c.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-500' : 'bg-white/5 text-zinc-500'}`}>{c.status}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-zinc-500 truncate max-w-[180px]">{c.last_message?.content || 'No messages yet'}</p>
                                                        {c.agreed_price && <p className="text-sm font-bold font-mono text-white flex-shrink-0 ml-3">{c.currency} {Number(c.agreed_price).toLocaleString()}</p>}
                                                    </div>
                                                </a>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Requests tab — Open Requests + Performance sidebar */}
                {activeTab === 'requests' && <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">

                    {/* LEFT — Open Requests */}
                    <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    {t('portal.open.requests')}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-700 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">
                                {openRequests.length} {openRequests.length === 1 ? t('portal.request.singular') : t('portal.requests.plural')}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {openRequests.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-16">
                                    <Clock className="w-8 h-8 text-zinc-600" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">{t('portal.no.requests')}</p>
                                        <p className="text-xs text-zinc-600">{t('portal.no.requests.sub')}</p>
                                    </div>
                                </div>
                            ) : (
                                openRequests.map((item: any) => {
                                    const isSelected = selectedRequest?.request_id === item.request_id;
                                    return (
                                        <div
                                            key={item.request_id}
                                            onClick={() => { setSelectedRequest(item); setBidSuccess(false); }}
                                            className={`p-4 rounded-xl border transition-all group cursor-pointer ${
                                                isSelected
                                                    ? 'bg-white/[0.04] border-white/20 border-l-2 border-l-white'
                                                    : 'bg-black border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                                        isSelected ? 'bg-white text-black' : 'bg-white/[0.03] border border-white/5 text-zinc-600 group-hover:bg-white/[0.06]'
                                                    }`}>
                                                        {item.cargo_type?.toUpperCase().includes('SEA') || item.cargo_type?.toUpperCase().includes('OCEAN') ? <Ship className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-sm font-bold text-white">{item.origin}</span>
                                                            <ArrowRight className="w-3 h-3 text-zinc-600" />
                                                            <span className="text-sm font-bold text-white">{item.destination}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono text-zinc-600">{item.request_id}</span>
                                                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                            <span className="text-[10px] text-zinc-600 uppercase tracking-wide">{item.cargo_type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">{item.quotation_count}/3 quotes</p>
                                                    <p className="text-sm font-bold font-mono text-zinc-500">{t('portal.submit.quote')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT — Metrics + Bid Form */}
                    <div className="w-full lg:w-72 flex flex-col gap-4 lg:flex-shrink-0 overflow-y-auto custom-scrollbar">

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
                                    <p className="text-xl font-bold text-white font-mono">{metrics?.won_bids ?? '—'}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('portal.reliability')}</p>
                                    <p className="text-xl font-bold text-white font-mono">{metrics?.reliability_score ?? 4.9}<span className="text-xs text-zinc-600">/5</span></p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('portal.status')}</p>
                                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
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
                                        {['USD','EUR','GBP','SAR','AED','QAR','KWD','BHD','JPY','CNY','SGD','INR','AUD','CAD','CHF','TRY','EGP','NZD','HKD'].map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                    </select>
                                    <ArrowRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
                                    <select value={cvTo} onChange={e => setCvTo(e.target.value)} className="flex-1 bg-black border border-white/5 rounded-xl px-2 py-2 text-[11px] text-zinc-400 outline-none cursor-pointer">
                                        {['USD','EUR','GBP','SAR','AED','QAR','KWD','BHD','JPY','CNY','SGD','INR','AUD','CAD','CHF','TRY','EGP','NZD','HKD'].map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                    </select>
                                </div>
                                <div className="bg-black border border-white/[0.04] rounded-xl px-3 py-2 text-center min-h-[36px] flex items-center justify-center">
                                    {cvLoading ? (
                                        <span className="text-[10px] text-zinc-600">{t('portal.converting')}</span>
                                    ) : cvResult ? (
                                        <span className="text-sm font-semibold font-mono text-white">{cvTo} {cvResult}</span>
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
                                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
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
                                    <div className="bg-black border border-white/5 rounded-xl p-3 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-zinc-600">{selectedRequest.request_id}</span>
                                            <span className="text-[9px] font-bold text-zinc-500 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                                {selectedRequest.cargo_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                            <span>{selectedRequest.origin}</span>
                                            <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                            <span>{selectedRequest.destination}</span>
                                        </div>
                                        <div className="border-t border-white/[0.04] pt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                                            {selectedRequest.commodity && (
                                                <div className="col-span-2">
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Commodity</p>
                                                    <p className="text-[11px] text-white font-medium truncate">{selectedRequest.commodity}</p>
                                                </div>
                                            )}
                                            {selectedRequest.weight_kg && (
                                                <div>
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Weight</p>
                                                    <p className="text-[11px] text-white font-medium">{Number(selectedRequest.weight_kg).toLocaleString()} kg</p>
                                                </div>
                                            )}
                                            {selectedRequest.quantity && (
                                                <div>
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Qty</p>
                                                    <p className="text-[11px] text-white font-medium">{selectedRequest.quantity} units</p>
                                                </div>
                                            )}
                                            {selectedRequest.container_type && (
                                                <div>
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Container</p>
                                                    <p className="text-[11px] text-white font-medium">{selectedRequest.container_type} × {selectedRequest.container_count || 1}</p>
                                                </div>
                                            )}
                                            {selectedRequest.incoterms && (
                                                <div>
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Incoterms</p>
                                                    <p className="text-[11px] text-white font-medium">{selectedRequest.incoterms}</p>
                                                </div>
                                            )}
                                            {selectedRequest.target_date && (
                                                <div className="col-span-2">
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Required by</p>
                                                    <p className="text-[11px] text-white font-medium">{selectedRequest.target_date}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price input */}
                                    <div className="flex-1 flex flex-col justify-end gap-3">
                                        {/* Currency + Price row */}
                                        <div className="flex gap-2">
                                            <div className="w-24">
                                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">Currency</label>
                                                <select
                                                    value={bidCurrency}
                                                    onChange={e => setBidCurrency(e.target.value)}
                                                    className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-sm font-bold text-white focus:border-white/20 outline-none transition-colors"
                                                >
                                                    {['USD','EUR','SAR','AED','GBP','CNY'].map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('portal.your.price')}</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={bidPrice}
                                                        onChange={e => setBidPrice(e.target.value)}
                                                        className="w-full bg-black border border-white/5 rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-white placeholder-zinc-800 focus:border-white/20 outline-none transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Carrier + Transit days row */}
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">Carrier</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Maersk"
                                                    value={bidCarrier}
                                                    onChange={e => setBidCarrier(e.target.value)}
                                                    className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-sm text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">Transit days</label>
                                                <input
                                                    type="number"
                                                    placeholder="14"
                                                    min={1}
                                                    value={bidTransitDays}
                                                    onChange={e => setBidTransitDays(e.target.value)}
                                                    className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-sm font-bold text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors font-mono"
                                                />
                                            </div>
                                        </div>
                                        {bidError && (
                                            <p className="text-xs text-red-400 font-inter text-center px-1">{bidError}</p>
                                        )}
                                        <button
                                            disabled={!bidPrice || submittingBid}
                                            onClick={submitBid}
                                            className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98]"
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
