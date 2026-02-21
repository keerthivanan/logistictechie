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
        <div className="max-w-5xl mx-auto space-y-12 py-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400">
                            <ActivityIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Operational Oversight</span>
                    </div>
                    <h1 className="text-5xl font-bold font-outfit tracking-tighter uppercase italic italic-none">Audit Log <span className="text-zinc-700">/</span> Activity</h1>
                    <p className="text-zinc-500 font-medium font-inter max-w-md text-sm">A permanent ledger of all intelligence vectors and operational commits within your Sovereign node.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                        <Filter className="w-3.5 h-3.5" /> Filter Feed
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">
                        Export Ledger
                    </button>
                </div>
            </div>

            {/* Main Log View */}
            <div className="bg-[#080808] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Action Protocol</th>
                                <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Entity Vector</th>
                                <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Details</th>
                                <th className="pr-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] text-right">Resume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {activities.map((act) => (
                                <tr key={act.id} className="group hover:bg-white/[0.02] transition-colors relative">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-white font-inter">
                                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                                                {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                                                {act.action === 'SEARCH' ? <Search className="w-3 h-3 text-blue-400" /> :
                                                    act.action === 'BOOKING_CREATED' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> :
                                                        act.action === 'SOCIAL_LINK' ? <Globe className="w-3 h-3 text-purple-400" /> :
                                                            <History className="w-3 h-3 text-zinc-500" />}
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.15em] font-outfit">
                                                {act.action.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider">
                                            {act.entity}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                            <span className="text-[10px] font-medium text-zinc-500 font-inter">
                                                {act.action === 'SEARCH' ? `${act.metadata.origin} → ${act.metadata.destination}` :
                                                    act.action === 'BOOKING_CREATED' ? `Booking Reference: ${act.metadata.reference}` :
                                                        'System Operational Commit'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="pr-8 py-6 text-right">
                                        <Link
                                            href={act.url}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/5 text-zinc-600 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        Showing protocol <span className="text-zinc-400">{page * limit + 1}</span> - <span className="text-zinc-400">{page * limit + activities.length}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={activities.length < limit}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center pb-12">
                <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em]">End of Ledger Stream</p>
            </div>
        </div>
    )
}
