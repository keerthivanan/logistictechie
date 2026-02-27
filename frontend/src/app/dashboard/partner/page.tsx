'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/lib/config'
import {
    ShieldCheck,
    Zap,
    TrendingUp,
    Box,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

export default function PartnerDashboard() {
    const { user } = useAuth()
    const [bids, setBids] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/forwarders/my-bids`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setBids(data.bids || [])
                }
            } catch (err) {
                console.error("Failed to fetch partner bids", err)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchBids()
    }, [user])

    if (user?.role !== 'forwarder') {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Access Restricted</h2>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto">
                        This terminal is reserved for Registered OMEGO Partners.
                        Please complete your registration to unlock the Partner Center.
                    </p>
                </div>
                <Link
                    href="/forwarders/register"
                    className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                >
                    Register Now
                </Link>
            </div>
        )
    }

    const wonBids = bids.filter(b => b.bid_status === 'ACCEPTED').length
    const pendingBids = bids.filter(b => b.bid_status === 'ANSWERED').length

    return (
        <div className="space-y-10 max-w-7xl mx-auto py-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner Mode
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight uppercase font-outfit">Partner Center</h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-tight">
                        Master Node: <span className="text-white font-mono">{user.sovereign_id}</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/marketplace" className="bg-zinc-900 border border-white/5 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                        Browse Marketplace
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Bids', value: bids.length, icon: Box, color: 'text-blue-400' },
                    { label: 'Active Quotes', value: pendingBids, icon: Zap, color: 'text-yellow-400' },
                    { label: 'Contracts Won', value: wonBids, icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Network Rank', value: '#12', icon: ShieldCheck, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-950 border border-white/5 p-6 rounded-[24px] hover:border-white/10 transition-all group"
                    >
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                        <h3 className="text-3xl font-bold font-mono text-white mb-1">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-inter">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Area: Active Bids */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Active Bid Log</h2>
                    <Link href="/forwarders/my-bids" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">View History</Link>
                </div>

                <div className="grid gap-4">
                    {bids.length === 0 ? (
                        <div className="bg-zinc-950 border border-dashed border-white/5 rounded-3xl p-20 text-center space-y-4">
                            <Clock className="w-8 h-8 text-zinc-700 mx-auto" />
                            <p className="text-zinc-500 text-sm font-medium">No active bids detected in your node.</p>
                        </div>
                    ) : (
                        bids.map((bid, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-zinc-950 border border-white/5 p-6 rounded-[24px] hover:bg-white/[0.02] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="space-y-1.5 font-inter">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-zinc-600 uppercase font-bold tracking-tighter">REQ-{bid.request_id}</span>
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${bid.bid_status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            bid.bid_status === 'DECLINED_LATE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                            {bid.bid_status}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                                        {bid.origin} → {bid.destination}
                                    </h4>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {bid.cargo_type} · Submitted {new Date(bid.attempted_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Quoted Value</p>
                                        <p className="text-xl font-mono font-bold text-emerald-400">${bid.quoted_price?.toLocaleString() || '---'}</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/5 hidden md:block" />
                                    <button className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all">
                                        <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
