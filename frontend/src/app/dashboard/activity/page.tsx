'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Activity as ActivityIcon,
    Search,
    CheckCircle2,
    History,
    ArrowUpRight,
    Loader2,
    Calendar,
    Filter,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Globe
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/lib/config'
import Link from 'next/link'

interface Activity {
    id: string;
    action: string;
    entity: string;
    timestamp: string;
    metadata: any;
    url: string;
}

export default function ActivityPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const limit = 20

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return
        }

        const fetchActivity = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/dashboard/activity/full?limit=${limit}&offset=${page * limit}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setActivities(data.activities)
                }
            } catch (err) {
                console.error("Failed to fetch activity", err)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchActivity()
    }, [user, authLoading, router, page])

    if (loading && page === 0 || authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-white opacity-10" />
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Deciphering Audit Stream</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-6">
            {/* Header section - Realigned to Dashboard Pattern */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold tracking-tight text-white uppercase font-outfit">
                            Audit <span className="text-zinc-600">Ledger</span>
                        </h1>
                        <div className="h-4 w-px bg-white/10" />
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] font-inter">
                            Signal: Intelligence History
                        </p>
                    </div>
                    <p className="text-zinc-500 font-medium font-inter max-w-md text-xs leading-relaxed">A permanent ledger of all intelligence vectors and operational commits within your Sovereign node.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all font-inter shadow-sm">
                        <Filter className="w-3.5 h-3.5" /> Filter Feed
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all font-inter shadow-xl">
                        Export Protocol
                    </button>
                </div>
            </div>

            {/* Main Log View - Sovereign Ledger Pattern */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="pl-10 pr-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Timestamp</th>
                                <th className="px-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Action Protocol</th>
                                <th className="px-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Entity Vector</th>
                                <th className="px-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Intelligence</th>
                                <th className="pr-10 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter text-right">Commit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {activities.map((act) => (
                                <tr key={act.id} className="group hover:bg-white/[0.02] transition-colors relative">
                                    <td className="pl-10 pr-6 py-8 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-white font-inter tracking-tight">
                                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-1 font-inter">
                                                {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all shadow-sm">
                                                {act.action === 'SEARCH' ? <Search className="w-3.5 h-3.5 text-blue-400" /> :
                                                    act.action === 'BOOKING_CREATED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                                                        act.action === 'SOCIAL_LINK' ? <Globe className="w-3.5 h-3.5 text-purple-400" /> :
                                                            <History className="w-3.5 h-3.5 text-zinc-500" />}
                                            </div>
                                            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-tighter font-outfit group-hover:text-white transition-colors">
                                                {act.action.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <span className="text-[9px] font-mono font-bold text-zinc-600 tracking-[0.1em] bg-white/[0.02] px-2.5 py-1 rounded border border-white/5">
                                            {act.entity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                            <span className="text-[11px] font-medium text-zinc-500 font-inter opacity-80 group-hover:opacity-100 transition-opacity">
                                                {act.action === 'SEARCH' ? `${act.metadata.origin} → ${act.metadata.destination}` :
                                                    act.action === 'BOOKING_CREATED' ? `Reference: ${act.metadata.reference}` :
                                                        'Operational Commit Verified'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="pr-10 py-8 text-right">
                                        <Link
                                            href={act.url}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/5 text-zinc-700 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all shadow-sm group-hover:scale-110"
                                        >
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-10 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest font-inter">
                        Operational Slice: <span className="text-zinc-500">{page * limit + 1}</span> — <span className="text-zinc-500">{page * limit + activities.length}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="w-11 h-11 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-zinc-600 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-20 transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={activities.length < limit}
                            className="w-11 h-11 flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-zinc-600 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-20 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center pb-20 opacity-20">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em]">Ledger Stream Termination</p>
            </div>
        </div>
    )
}
