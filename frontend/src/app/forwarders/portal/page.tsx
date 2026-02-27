'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, ArrowRight, Loader2, Anchor, Package,
    TrendingUp, LogOut, CheckCircle, Clock
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/config';

export default function ForwarderPortal() {
    const { user } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login form state
    const [forwarderId, setForwarderId] = useState('');
    const [email, setEmail] = useState('');

    // Dashboard data state
    const [dashboardData, setDashboardData] = useState<any>(null);

    // Auto-authenticate if global session is forwarder
    useEffect(() => {
        if (user && user.role === 'forwarder' && user.sovereign_id?.startsWith('REG-')) {
            setIsAuthenticated(true);
            fetchDashboardData(user.sovereign_id);
        } else {
            // Check localStorage fallbacks for standalone usage if needed
            const storedId = localStorage.getItem('omego_fwd_id');
            const storedEmail = localStorage.getItem('omego_fwd_email');
            if (storedId && storedEmail) {
                handleAuth(storedId, storedEmail);
            }
        }
    }, [user]);

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

    const fetchDashboardData = async (id: string | null) => {
        if (!id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/forwarders/dashboard/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
            <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-black">
                <Navbar />
                <div className="max-w-md mx-auto px-4 pt-48">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                        <div className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-3">Partner Access</h1>
                        <p className="text-zinc-500 font-inter text-sm font-medium">Verify your node credentials to enter the Command Center.</p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleLoginSubmit}
                        className="bg-[#050505] border border-white/10 rounded-[32px] p-10 space-y-8 shadow-2xl"
                    >
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-[10px] font-black tracking-widest font-inter text-center uppercase">
                                {error}
                            </div>
                        )}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter ml-1">Sovereign Node ID</label>
                            <input
                                type="text" placeholder="ID-0000"
                                value={forwarderId} onChange={(e) => setForwarderId(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-5 text-sm font-black text-white focus:border-white/30 transition-all outline-none font-mono uppercase placeholder:text-zinc-800"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter ml-1">Registry Email</label>
                            <input
                                type="email" placeholder="ops@omego.online"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-5 text-sm font-black text-white focus:border-white/30 transition-all outline-none font-inter placeholder:text-zinc-800"
                                required
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-white text-black font-black h-16 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center text-[10px] tracking-[0.2em] font-inter uppercase disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Access Dashboard <ArrowRight className="w-5 h-5 ml-2" /></>}
                        </button>
                    </motion.form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-36 pb-32">
                {/* Tactical Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-black font-inter tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <ShieldCheck className="w-3.5 h-3.5" /> SECURE NODE ACTIVE
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black font-inter tracking-widest uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE SIGNAL
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter leading-none">
                            Command <span className="text-zinc-600">Center</span>
                        </h1>
                        <div className="flex items-center gap-6">
                            <p className="text-zinc-500 font-inter text-xs font-bold uppercase tracking-widest">
                                Partner: <span className="text-white">{dashboardData?.company_name || 'SYNCING...'}</span>
                            </p>
                            <div className="w-1 h-3 bg-zinc-800" />
                            <p className="text-zinc-500 font-inter text-xs font-bold uppercase tracking-widest">
                                Node ID: <span className="text-white font-mono">{user?.sovereign_id || localStorage.getItem('omego_fwd_id')}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="px-8 py-4 border border-white/10 rounded-2xl text-[10px] font-black font-inter text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 bg-white/5">
                        <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                </div>

                {!dashboardData ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <Loader2 className="w-12 h-12 text-white animate-spin opacity-20" />
                        <p className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase">Synchronizing Global Oracle...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Side: Stats & Metrics */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-[#050505] border border-white/10 p-10 rounded-[32px] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <h3 className="text-6xl font-black font-outfit mb-2 tracking-tighter">{dashboardData.metrics.total_quotes_submitted}</h3>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-inter">Global Bids Submitted</p>
                                </div>
                                <div className="bg-[#050505] border border-white/10 p-10 rounded-[32px] relative overflow-hidden group border-emerald-500/20">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl" />
                                    <h3 className="text-6xl font-black font-outfit mb-2 tracking-tighter text-emerald-400">{dashboardData.metrics.won_bids}</h3>
                                    <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] font-inter">Verified Contracts Won</p>
                                </div>
                                <div className="bg-[#050505] border border-white/10 p-10 rounded-[32px] flex items-center justify-between">
                                    <div>
                                        <h3 className="text-4xl font-black font-outfit mb-1 tracking-tighter">{dashboardData.metrics.reliability_score || '4.9'}</h3>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-inter">Network Rank</p>
                                    </div>
                                    <TrendingUp className="w-10 h-10 text-zinc-200 opacity-20" />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Operational Feed */}
                        <div className="lg:col-span-8">
                            <div className="bg-[#050505] border border-white/10 rounded-[40px] p-10 min-h-[600px]">
                                <h2 className="text-sm font-black font-outfit uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                                    <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" /> Operational Intelligence
                                </h2>

                                {dashboardData.quotes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                        <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center opacity-20">
                                            <Package className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-white font-bold tracking-tight">System Standby</p>
                                            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest max-w-[200px]">Waiting for tactical broadcast requests from OMEGO Brain.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {dashboardData.quotes.map((quote: any, idx: number) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                key={idx}
                                                className="bg-black border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-10 group"
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] bg-white text-black px-3 py-1 rounded-full font-black uppercase tracking-widest font-mono">
                                                            {quote.request_id}
                                                        </span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${quote.status === 'OPEN' ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                                            <Clock className="w-3.5 h-3.5" /> {quote.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black font-outfit text-white uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
                                                            {quote.origin} <span className="text-zinc-700 mx-2">→</span> {quote.destination}
                                                        </h3>
                                                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-2 font-inter">{quote.cargo_type} LOGISTICS NODE</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10 bg-[#080808] p-6 rounded-[24px] border border-white/5 w-full md:w-auto shadow-xl">
                                                    <div>
                                                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1 font-inter">Live Price</p>
                                                        <p className="text-2xl font-black font-outfit text-white">${quote.your_price || '0.00'}</p>
                                                    </div>
                                                    <div className="w-px h-10 bg-white/5" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1 font-inter">Position</p>
                                                        <p className="text-2xl font-black font-outfit text-zinc-500">#{quote.your_position || '1'}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
