'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search, CheckCircle2, History, ArrowUpRight,
    Package, FileText, Globe, Zap,
    LogIn, LogOut, UserPlus, User, ShieldCheck, Send, Store,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import { PageSpinner } from '@/components/ui/Spinner'
import Link from 'next/link'
import { useT } from '@/lib/i18n/t'

interface Activity {
    id: string
    action: string
    entity: string
    timestamp: string
    metadata: any
    url: string
}

const ACTION_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    // Auth
    LOGIN:              { label: 'Signed In',           icon: LogIn,        color: 'text-blue-400' },
    LOGOUT:             { label: 'Signed Out',           icon: LogOut,       color: 'text-zinc-500' },
    SIGNUP:             { label: 'Account Created',      icon: UserPlus,     color: 'text-emerald-400' },
    SOCIAL_LINK:        { label: 'Google Sign-In',       icon: Globe,        color: 'text-blue-400' },
    // Profile
    PROFILE_UPDATE:     { label: 'Profile Updated',      icon: User,         color: 'text-purple-400' },
    SECURITY_UPDATE:    { label: 'Password Changed',     icon: ShieldCheck,  color: 'text-amber-400' },
    // Marketplace
    MARKETPLACE_SUBMIT: { label: 'Shipment Requested',   icon: Store,        color: 'text-emerald-400' },
    SEARCH:             { label: 'Freight Search',       icon: Search,       color: 'text-blue-400' },
    VECTOR_SEARCH:      { label: 'Freight Search',       icon: Search,       color: 'text-blue-400' },
    QUOTE_REQUESTED:    { label: 'Quote Requested',      icon: Zap,          color: 'text-purple-400' },
    // Forwarder
    PARTNER_APPLIED:    { label: 'Partner Application',  icon: Send,         color: 'text-amber-400' },
    BID_SUBMITTED:      { label: 'Bid Submitted',        icon: Zap,          color: 'text-emerald-400' },
    // Tasks
    TASK_CREATED:       { label: 'Task Created',         icon: FileText,     color: 'text-zinc-400' },
    TASK_COMPLETED:     { label: 'Task Completed',       icon: CheckCircle2, color: 'text-emerald-400' },
    TASK_REOPENED:      { label: 'Task Reopened',        icon: History,      color: 'text-yellow-400' },
    // Bookings
    BOOKING_CREATED:    { label: 'Booking Created',      icon: CheckCircle2, color: 'text-emerald-400' },
    BOOKING_UPDATED:    { label: 'Booking Updated',      icon: Package,      color: 'text-yellow-400' },
    DOCUMENT_UPLOAD:    { label: 'Document Uploaded',    icon: FileText,     color: 'text-zinc-400' },
}

function getAction(action: string) {
    return ACTION_MAP[action] ?? { label: action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()), icon: History, color: 'text-zinc-500' }
}

function getDetail(act: Activity) {
    const m = act.metadata || {}
    switch (act.action) {
        case 'SEARCH':
        case 'VECTOR_SEARCH':
            return m.origin && m.destination ? `${m.origin} → ${m.destination}` : 'Freight route search'
        case 'MARKETPLACE_SUBMIT':
            return m.origin && m.destination ? `${m.origin} → ${m.destination}` : 'New shipment request'
        case 'BID_SUBMITTED':
            return m.price ? `Quote: $${Number(m.price).toLocaleString()}` : `Request #${m.request_id ?? '—'}`
        case 'BOOKING_CREATED':
            return `Ref: ${m.reference ?? '—'}`
        case 'TASK_COMPLETED':
        case 'TASK_CREATED':
        case 'TASK_REOPENED':
            return m.title ?? 'Task update'
        case 'PARTNER_APPLIED':
            return 'Application submitted for review'
        case 'PROFILE_UPDATE':
            return 'Profile details updated'
        case 'SECURITY_UPDATE':
            return 'Password changed'
        case 'LOGIN':
        case 'SOCIAL_LINK':
            return 'CargoLink platform'
        default:
            return '—'
    }
}

function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ActivityPage() {
    const t = useT()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [offset, setOffset] = useState(0)
    const PAGE = 50

    const fetchActivities = async (currentOffset: number, append = false) => {
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/dashboard/activity/full?limit=${PAGE}&offset=${currentOffset}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                const raw: Activity[] = data.activities ?? []
                setHasMore(raw.length === PAGE)
                setActivities(prev => append ? [...prev, ...raw] : raw)
                setOffset(currentOffset + raw.length)
            }
        } catch { /* silent */ } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return }
        if (!user) return
        fetchActivities(0)
    }, [user, authLoading, router])

    if (loading || authLoading) {
        return (
            <PageSpinner />
        )
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="border-b border-white/5 pb-4">
                <h1 className="text-base font-semibold font-outfit tracking-tight text-white mb-0.5">
                    {t('activity.title')}
                </h1>
                <p className="text-xs text-zinc-600 font-inter">{t('activity.sub')}</p>
            </div>

            {/* List */}
            {activities.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl flex flex-col items-center justify-center py-16 opacity-40">
                    <History className="w-6 h-6 mb-3 text-zinc-600" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 font-inter">{t('activity.empty')}</p>
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
                                    <p className="text-xs font-semibold text-white font-inter mb-0.5">{label}</p>
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

            {/* Load More */}
            {hasMore && (
                <button
                    onClick={() => { setLoadingMore(true); fetchActivities(offset, true) }}
                    disabled={loadingMore}
                    className="w-full py-3 text-[11px] font-semibold text-zinc-600 hover:text-white uppercase tracking-widest font-inter border border-white/[0.05] rounded-2xl hover:border-white/10 transition-all disabled:opacity-40"
                >
                    {loadingMore ? '...' : t('activity.load.more')}
                </button>
            )}
            {!hasMore && activities.length > 0 && (
                <p className="text-[10px] text-zinc-800 font-inter text-center">{t('activity.all.loaded').replace('{n}', activities.length.toString())}</p>
            )}
        </div>
    )
}
