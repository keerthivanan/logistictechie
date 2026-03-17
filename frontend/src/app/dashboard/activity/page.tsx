'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search, CheckCircle2, History, ArrowUpRight,
    Loader2, Package, FileText, Globe, Zap,
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

const ACTION_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    SEARCH:           { label: 'Freight Search',    icon: Search,       color: 'text-blue-400' },
    VECTOR_SEARCH:    { label: 'Freight Search',    icon: Search,       color: 'text-blue-400' },
    BOOKING_CREATED:  { label: 'Booking Created',   icon: CheckCircle2, color: 'text-emerald-400' },
    BOOKING_UPDATED:  { label: 'Booking Updated',   icon: Package,      color: 'text-yellow-400' },
    QUOTE_REQUESTED:  { label: 'Quote Requested',   icon: Zap,          color: 'text-purple-400' },
    DOCUMENT_UPLOAD:  { label: 'Document Uploaded', icon: FileText,     color: 'text-zinc-400' },
    SOCIAL_LINK:      { label: 'Profile Updated',   icon: Globe,        color: 'text-purple-400' },
}

function getAction(action: string) {
    return ACTION_MAP[action] ?? { label: action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()), icon: History, color: 'text-zinc-500' }
}

function getDetail(act: Activity) {
    if (act.action === 'SEARCH' || act.action === 'VECTOR_SEARCH') {
        const o = act.metadata?.origin
        const d = act.metadata?.destination
        if (o && d) return `${o} → ${d}`
        return 'Freight route search'
    }
    if (act.action === 'BOOKING_CREATED') return `Ref: ${act.metadata?.reference ?? '—'}`
    return '—'
}

function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ActivityPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return }
        if (!user) return

        const fetch = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await apiFetch(`/api/dashboard/activity/full?limit=20&offset=0`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    // Deduplicate consecutive same-action entries, keep last 6
                    const raw: Activity[] = data.activities ?? []
                    const deduped: Activity[] = []
                    for (const act of raw) {
                        const prev = deduped[deduped.length - 1]
                        const isSame = prev && prev.action === act.action &&
                            prev.metadata?.origin === act.metadata?.origin &&
                            prev.metadata?.destination === act.metadata?.destination
                        if (!isSame) deduped.push(act)
                        if (deduped.length >= 6) break
                    }
                    setActivities(deduped)
                }
            } catch { /* silent */ } finally { setLoading(false) }
        }
        fetch()
    }, [user, authLoading, router])

    if (loading || authLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/10" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">

            {/* Header */}
            <div className="border-b border-white/5 pb-4">
                <h1 className="text-base font-black font-outfit tracking-tight text-white mb-0.5">
                    Activity Log
                </h1>
                <p className="text-xs text-zinc-600 font-inter">Your 6 most recent platform actions.</p>
            </div>

            {/* List */}
            {activities.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl flex flex-col items-center justify-center py-16 opacity-40">
                    <History className="w-6 h-6 mb-3 text-zinc-600" />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-600 font-inter">No activity yet</p>
                </div>
            ) : (
                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.04]">
                    {activities.map((act) => {
                        const { label, icon: Icon, color } = getAction(act.action)
                        return (
                            <div key={act.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors">
                                {/* Icon */}
                                <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                                </div>

                                {/* Label + detail */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-white font-inter mb-0.5">{label}</p>
                                    <p className="text-[11px] text-zinc-600 font-inter truncate">{getDetail(act)}</p>
                                </div>

                                {/* Time */}
                                <span className="text-[10px] text-zinc-700 font-mono flex-shrink-0">{timeAgo(act.timestamp)}</span>

                                {/* Link */}
                                <Link href={act.url}
                                    className="w-7 h-7 flex items-center justify-center rounded-xl border border-white/[0.05] text-zinc-700 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all flex-shrink-0 opacity-0 group-hover:opacity-100">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Footer hint */}
            <p className="text-[10px] text-zinc-800 font-inter text-center">Showing last 6 unique actions</p>
        </div>
    )
}
