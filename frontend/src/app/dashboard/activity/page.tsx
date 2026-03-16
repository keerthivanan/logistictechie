'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    CheckCircle2,
    History,
    ArrowUpRight,
    Loader2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Globe,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import Link from 'next/link'

interface Activity {
    id: string
    action: string
    entity: string
    timestamp: string
    metadata: any
    url: string
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
                const res = await apiFetch(`/api/dashboard/activity/full?limit=${limit}&offset=${page * limit}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setActivities(data.activities)
                }
            } catch (err) {
                console.error('Failed to fetch activity', err)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchActivity()
    }, [user, authLoading, router, page])

    if ((loading && page === 0) || authLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-white opacity-10" />
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Deciphering Audit Stream</p>
            </div>
        )
    }

    const actionIcon = (action: string) => {
        if (action === 'SEARCH') return <Search className="w-3.5 h-3.5 text-blue-400" />
        if (action === 'BOOKING_CREATED') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        if (action === 'SOCIAL_LINK') return <Globe className="w-3.5 h-3.5 text-purple-400" />
        return <History className="w-3.5 h-3.5 text-zinc-500" />
    }

    const actionMeta = (act: Activity) => {
        if (act.action === 'SEARCH') return `${act.metadata?.origin} → ${act.metadata?.destination}`
        if (act.action === 'BOOKING_CREATED') return `Reference: ${act.metadata?.reference}`
        return 'Operational Commit Verified'
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 flex-shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold tracking-tight text-white uppercase font-outfit">
                            Audit <span className="text-zinc-600">Ledger</span>
                        </h1>
                        <div className="h-3 w-px bg-white/10" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] font-inter">Signal: Intelligence History</p>
                    </div>
                    <p className="text-zinc-600 font-medium font-inter text-xs">Permanent ledger of all intelligence vectors and operational commits.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all font-inter">
                        <Filter className="w-3.5 h-3.5" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all font-inter">
                        Export
                    </button>
                </div>
            </div>

            {/* Table container */}
            <div className="flex-1 min-h-0 bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#0a0a0a] z-10">
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="pl-8 pr-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Timestamp</th>
                                <th className="px-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Action Protocol</th>
                                <th className="px-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Entity Vector</th>
                                <th className="px-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Intelligence</th>
                                <th className="pr-8 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter text-right">Commit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {activities.map((act) => (
                                <tr key={act.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="pl-8 pr-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-white font-inter tracking-tight">
                                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-0.5 font-inter">
                                                {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
                                                {actionIcon(act.action)}
                                            </div>
                                            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-tighter font-outfit group-hover:text-white transition-colors">
                                                {act.action.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[9px] font-mono font-bold text-zinc-600 tracking-[0.1em] bg-white/[0.02] px-2.5 py-1 rounded border border-white/5">
                                            {act.entity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[11px] font-medium text-zinc-500 font-inter opacity-80 group-hover:opacity-100 transition-opacity">
                                            {actionMeta(act)}
                                        </span>
                                    </td>
                                    <td className="pr-8 py-5 text-right">
                                        <Link href={act.url}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/5 text-zinc-700 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {activities.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <History className="w-8 h-8 mb-3" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">No Activity Recorded</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="px-8 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between flex-shrink-0">
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest font-inter">
                        Slice: <span className="text-zinc-500">{page * limit + 1}–{page * limit + activities.length}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-zinc-600 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPage(p => p + 1)} disabled={activities.length < limit}
                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-zinc-600 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
