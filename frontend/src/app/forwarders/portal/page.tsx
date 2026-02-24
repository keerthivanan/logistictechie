'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, ArrowRight, Loader2, Anchor, Package,
    TrendingUp, LogOut, CheckCircle, Clock
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { API_URL } from '@/lib/config';

export default function ForwarderPortal() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login form state
    const [forwarderId, setForwarderId] = useState('');
    const [email, setEmail] = useState('');

    // Dashboard data state
    const [dashboardData, setDashboardData] = useState<any>(null);

    // Check localStorage on mount
    useEffect(() => {
        const storedId = localStorage.getItem('omego_fwd_id');
        const storedEmail = localStorage.getItem('omego_fwd_email');
        if (storedId && storedEmail) {
            handleAuth(storedId, storedEmail);
        }
    }, []);

    const handleAuth = async (id: string, mail: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/forwarders/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: id, email: mail })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('omego_fwd_id', id);
                localStorage.setItem('omego_fwd_email', mail);
                setIsAuthenticated(true);
                fetchDashboardData(id);
            } else {
                setError(data.detail || 'Invalid credentials. Check your email for your Partner ID.');
                localStorage.removeItem('omego_fwd_id');
                localStorage.removeItem('omego_fwd_email');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/api/forwarders/dashboard/${id}`);
            if (res.ok) {
                const data = await res.json();
                setDashboardData(data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        }
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAuth(forwarderId.toUpperCase(), email);
    };

    const handleLogout = () => {
        localStorage.removeItem('omego_fwd_id');
        localStorage.removeItem('omego_fwd_email');
        setIsAuthenticated(false);
        setDashboardData(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
                <Navbar />
                <div className="max-w-md mx-auto px-4 pt-48">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold font-outfit uppercase tracking-tight mb-2">Partner Portal</h1>
                        <p className="text-zinc-500 font-inter text-sm">Secure access for verified Sovereign Network Forwarders.</p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleLoginSubmit}
                        className="bg-zinc-950 border border-white/5 rounded-[24px] p-8 space-y-6"
                    >
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold font-inter text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-inter ml-2">Partner ID</label>
                            <input
                                type="text" placeholder="e.g. F001"
                                value={forwarderId} onChange={(e) => setForwarderId(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-white/20 outline-none font-mono uppercase"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-inter ml-2">Registered Email</label>
                            <input
                                type="email" placeholder="company@email.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-white/20 outline-none font-inter"
                                required
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-white text-black font-bold h-14 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center text-xs tracking-widest font-inter uppercase disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authenticate <ArrowRight className="w-4 h-4 ml-2" /></>}
                        </button>
                    </motion.form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-inter tracking-widest uppercase mb-4">
                            <ShieldCheck className="w-3.5 h-3.5" /> SECURE TERMINAL
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-outfit uppercase tracking-tight mb-2">
                            {dashboardData?.company_name || 'Partner'} Workspace
                        </h1>
                        <p className="text-zinc-500 font-inter text-sm flex items-center gap-2">
                            ID: <span className="text-white font-mono">{localStorage.getItem('omego_fwd_id')}</span>
                        </p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold font-inter text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                        <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                </div>

                {!dashboardData ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
                ) : (
                    <>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                    <Package className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="text-3xl font-bold font-mono mb-1">{dashboardData.metrics.total_quotes_submitted}</h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-inter">Total Quotes Sent</p>
                            </div>
                            <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                </div>
                                <h3 className="text-3xl font-bold font-mono mb-1">{dashboardData.metrics.active_bids}</h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-inter">Active Live Bids</p>
                            </div>
                            <div className="bg-zinc-950 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 relative z-10">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h3 className="text-3xl font-bold font-mono mb-1 text-emerald-400 relative z-10">{dashboardData.metrics.won_bids}</h3>
                                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest font-inter relative z-10">Won Contracts (#1 Position)</p>
                            </div>
                        </div>

                        {/* Quotes Log */}
                        <div>
                            <h2 className="text-lg font-bold font-outfit uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Anchor className="w-5 h-5 text-zinc-500" /> Active Operations Log
                            </h2>

                            {dashboardData.quotes.length === 0 ? (
                                <div className="bg-zinc-950 border border-white/5 rounded-3xl p-12 text-center">
                                    <p className="text-zinc-500 font-inter text-sm mb-4">No quotes indexed yet.</p>
                                    <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Wait for automated email requests from OMEGO.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData.quotes.map((quote: any, idx: number) => (
                                        <div key={idx} className="bg-zinc-950 border border-white/5 rounded-[20px] p-6 hover:border-white/10 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-zinc-400 font-bold uppercase tracking-widest font-mono">
                                                        {quote.request_id}
                                                    </span>
                                                    {quote.status === 'OPEN' ? (
                                                        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Live</span>
                                                    ) : (
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Closed</span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold font-inter text-white mb-1">
                                                    {quote.origin} <ArrowRight className="inline w-3 h-3 mx-1 opacity-50" /> {quote.destination}
                                                </h3>
                                                <p className="text-xs text-zinc-500 font-inter uppercase tracking-widest">{quote.cargo_type} Cargo</p>
                                            </div>

                                            <div className="flex items-center gap-8 bg-black p-4 rounded-2xl border border-white/5 w-full md:w-auto">
                                                <div>
                                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 font-inter">Your Price</p>
                                                    <p className="font-mono font-bold text-emerald-400">${quote.your_price}</p>
                                                </div>
                                                <div className="w-px h-8 bg-white/5" />
                                                <div>
                                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 font-inter">Position</p>
                                                    <p className="font-mono font-bold text-white">#{quote.your_position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
