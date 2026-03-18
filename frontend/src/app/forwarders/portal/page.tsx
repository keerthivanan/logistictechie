'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ArrowRight, Loader2, Anchor, Package,
    TrendingUp, LogOut, CheckCircle, Clock, Zap, Target,
    Globe, Radio, Activity, LayoutGrid, Terminal,
    DollarSign, BarChart3, Truck, Ship, Info, AlertCircle,
    Copy, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, API_URL } from '@/lib/config';

const PortalNavbar = () => (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 z-[100] px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-emerald-500">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">PORTAL</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black font-outfit uppercase tracking-[0.3em] leading-none text-white">CARGOLINK</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">PARTNER PORTAL</span>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">SECURE NODE ACTIVE</span>
            </div>
        </div>
    </nav>
);

export default function ForwarderPortal() {
    const { user } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Standard state persistence
    const [forwarderId, setForwarderId] = useState('');
    const [email, setEmail] = useState('');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [bidPrice, setBidPrice] = useState('');
    const [submittingBid, setSubmittingBid] = useState(false);

    // Tactical data retrieval
    const fetchDashboardData = useCallback(async (id: string | null) => {
        if (!id) return;
        try {
            const token = localStorage.getItem('token');
            let url: string;
            let headers: Record<string, string> = {};

            if (token && token !== 'null') {
                url = `${API_URL}/api/forwarders/dashboard/${id}`;
                headers = { 'Authorization': `Bearer ${token}` };
            } else {
                const storedEmail = localStorage.getItem('cl_fwd_email');
                if (!storedEmail) return;
                url = `${API_URL}/api/forwarders/portal-dashboard/${id}?email=${encodeURIComponent(storedEmail)}`;
            }

            const res = await fetch(url, { headers });
            if (res.ok) {
                const data = await res.json();
                setDashboardData(data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
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
                setError(data.detail || 'Invalid credentials.');
                localStorage.removeItem('cl_fwd_id');
                localStorage.removeItem('cl_fwd_email');
            }
        } catch (err) {
            setError('Network error.');
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

    const handleLogout = () => {
        localStorage.removeItem('cl_fwd_id');
        localStorage.removeItem('cl_fwd_email');
        setIsAuthenticated(false);
        setDashboardData(null);
    };

    const submitBid = async () => {
        if (!selectedRequest || !bidPrice) return;
        setSubmittingBid(true);
        try {
            const res = await apiFetch(`/api/forwarders/portal-bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: selectedRequest.request_id,
                    forwarder_id: localStorage.getItem('cl_fwd_id'),
                    email: localStorage.getItem('cl_fwd_email'),
                    status: 'ANSWERED',
                    price: parseFloat(bidPrice)
                })
            });
            if (res.ok) {
                setSelectedRequest(null);
                setBidPrice('');
                fetchDashboardData(localStorage.getItem('cl_fwd_id'));
            }
        } catch (err) { console.error('Bid failed', err); }
        finally { setSubmittingBid(false); }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white font-inter">
                <PortalNavbar />
                <div className="max-w-xs mx-auto px-4 pt-48">
                    <div className="text-center mb-6">
                        <div className="mb-4">
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-500">PORTAL</span>
                        </div>
                        <h1 className="text-lg font-black font-outfit uppercase tracking-tighter mb-1">Partner Portal Access</h1>
                        <p className="text-zinc-600 font-medium text-xs uppercase tracking-widest">Secure Access Required</p>
                    </div>

                    <form
                        onSubmit={handleLoginSubmit}
                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 backdrop-blur-md"
                    >
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded-lg text-xs font-bold tracking-widest text-center uppercase">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Partner ID</label>
                            <input
                                type="text" placeholder="REG-OMEGO-XXXX"
                                value={forwarderId} onChange={(e) => setForwarderId(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-lg px-4 py-3 text-sm font-bold text-white focus:border-white/10 outline-none uppercase font-mono placeholder:text-zinc-700"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Email Address</label>
                            <input
                                type="email" placeholder="company@email.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-lg px-4 py-3 text-sm font-bold text-white focus:border-white/10 outline-none placeholder:text-zinc-700"
                                required
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-white text-black font-black h-12 rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center text-xs tracking-widest uppercase disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Access Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black text-white font-inter overflow-hidden flex flex-col selection:bg-emerald-500 selection:text-black">
            <PortalNavbar />

            <div className="flex-1 flex overflow-hidden pt-20">
                {/* 2. MAIN OPERATIONS AREA */}
                <div className="flex-1 flex flex-col p-8 overflow-hidden">
                    {/* DYNAMIC HEADER */}
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase tracking-widest">Partner Portal</span>
                            </div>
                            <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white">
                                Quotation Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Logged In As</p>
                                <p className="text-xs font-mono font-bold text-zinc-300 uppercase">{dashboardData?.company_name || '...'}</p>
                                <p className="text-[10px] font-mono text-zinc-600">{localStorage.getItem('cl_fwd_id')}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-zinc-400">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden min-h-0">
                        {/* LEFT: ACTIVE REQUESTS */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-white">Open Requests</h2>
                                    <div className="px-2 py-0.5 bg-zinc-900 border border-white/5 rounded text-[10px] font-bold text-zinc-500 uppercase">{dashboardData?.quotes.length || 0} requests</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar bg-white/[0.01] rounded-2xl p-4 border border-white/5">
                                {dashboardData?.quotes.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                                        <Radio className="w-8 h-8 text-zinc-600" />
                                        <p className="text-sm font-medium text-zinc-500">No requests assigned yet.</p>
                                        <p className="text-xs text-zinc-700">Requests will appear here after broadcast.</p>
                                    </div>
                                ) : (
                                    dashboardData?.quotes.map((quote: any) => (
                                        <div
                                            key={quote.request_id}
                                            onClick={() => setSelectedRequest(quote)}
                                            className="bg-black border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden active:scale-[0.99]"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                                    {quote.cargo_type?.includes('SEA') ? <Ship className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">#{quote.request_id.slice(-6)}</span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                        <span className="text-[10px] font-medium text-zinc-600 uppercase">{quote.cargo_type}</span>
                                                    </div>
                                                    <h3 className="text-base font-black font-outfit uppercase tracking-tight">
                                                        {quote.origin} → {quote.destination}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Your Quote</p>
                                                    <p className="text-xl font-black font-outfit text-white group-hover:text-emerald-400 transition-colors">
                                                        {quote.your_price > 0 ? `$${quote.your_price.toLocaleString()}` : '—'}
                                                    </p>
                                                </div>
                                                <div className="p-2 rounded-full border border-white/5 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-black" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT: TACTICAL SIDE PANEL */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0">
                            {/* PERFORMANCE METRICS */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Performance</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Bids</p>
                                        <p className="text-2xl font-black font-outfit text-white">{dashboardData?.metrics.total_quotes_submitted ?? '—'}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Won</p>
                                        <p className="text-2xl font-black font-outfit text-emerald-400">{dashboardData?.metrics.won_bids ?? '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Reliability</p>
                                        <p className="text-2xl font-black font-outfit text-white">{dashboardData?.metrics.reliability_score || 100}%</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Status</p>
                                        <p className="text-sm font-black font-outfit text-emerald-400">Active</p>
                                    </div>
                                </div>
                            </div>

                            {/* QUOTE SUBMISSION PANEL */}
                            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col min-h-0">
                                {!selectedRequest ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 opacity-30">
                                        <Terminal className="w-10 h-10 text-zinc-600" />
                                        <p className="text-sm font-medium text-zinc-500">Select a request to submit your quote.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Submit Quote</h3>
                                            <button onClick={() => setSelectedRequest(null)} className="text-xs text-zinc-600 hover:text-white transition-colors">Cancel</button>
                                        </div>

                                        <div className="bg-black/50 border border-white/5 p-4 rounded-xl space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                                                    <Info className="w-3.5 h-3.5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Request ID</p>
                                                    <p className="text-xs font-mono font-bold text-white">{selectedRequest.request_id}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Route</p>
                                                    <p className="text-xs font-bold text-zinc-300 truncate">{selectedRequest.origin} → {selectedRequest.destination}</p>
                                                </div>
                                                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Cargo</p>
                                                    <p className="text-xs font-bold text-zinc-300 capitalize">{selectedRequest.cargo_type}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Your Price (USD)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number" placeholder="0.00"
                                                        value={bidPrice} onChange={(e) => setBidPrice(e.target.value)}
                                                        className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xl font-black font-outfit text-emerald-400 placeholder:text-zinc-800 focus:border-emerald-500/50 outline-none transition-all"
                                                    />
                                                    <DollarSign className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            disabled={!bidPrice || submittingBid}
                                            onClick={submitBid}
                                            className="w-full bg-white hover:bg-emerald-400 text-black h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30"
                                        >
                                            {submittingBid ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Quote <ArrowRight className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.02); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.1); }
            `}</style>
        </div>
    );
}
