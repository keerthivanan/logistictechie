'use client'

import Link from 'next/link'
import { Search, CheckCircle2, History, Package, FileText, Globe, ArrowUpRight, Activity as ActivityIcon, LogIn, LogOut, UserPlus, User, ShieldCheck, Send, Store, Zap } from 'lucide-react'
import { Activity } from './types'
import { useT } from '@/lib/i18n/t'

function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function dedupe(activities: Activity[], max = 5): Activity[] {
    const out: Activity[] = []
    for (const act of activities) {
        const prev = out[out.length - 1]
        const same = prev && prev.action === act.action &&
            (prev as any).metadata?.origin === (act as any).metadata?.origin &&
            (prev as any).metadata?.destination === (act as any).metadata?.destination
        if (!same) out.push(act)
        if (out.length >= max) break
    }
    return out
}

export default function CommandFeed({ activities, title }: { activities: Activity[], title?: string }) {
    const t = useT()
    const items = dedupe(activities, 5)

    const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
        LOGIN:              { label: t('act.signed.in'),           icon: LogIn,        color: 'text-blue-400' },
        LOGOUT:             { label: t('act.signed.out'),          icon: LogOut,       color: 'text-zinc-500' },
        SIGNUP:             { label: t('act.account.created'),     icon: UserPlus,     color: 'text-emerald-400' },
        SOCIAL_LINK:        { label: t('act.google.signin'),       icon: Globe,        color: 'text-blue-400' },
        PROFILE_UPDATE:     { label: t('act.profile.updated'),     icon: User,         color: 'text-purple-400' },
        SECURITY_UPDATE:    { label: t('act.password.changed'),    icon: ShieldCheck,  color: 'text-amber-400' },
        MARKETPLACE_SUBMIT: { label: t('act.shipment.requested'),  icon: Store,        color: 'text-emerald-400' },
        SEARCH:             { label: t('act.freight.search'),      icon: Search,       color: 'text-blue-400' },
        VECTOR_SEARCH:      { label: t('act.freight.search'),      icon: Search,       color: 'text-blue-400' },
        PARTNER_APPLIED:    { label: t('act.partner.app'),         icon: Send,         color: 'text-amber-400' },
        BID_SUBMITTED:      { label: t('act.bid.submitted'),       icon: Zap,          color: 'text-emerald-400' },
        TASK_CREATED:       { label: t('act.task.created'),        icon: FileText,     color: 'text-zinc-400' },
        TASK_COMPLETED:     { label: t('act.task.completed'),      icon: CheckCircle2, color: 'text-emerald-400' },
        TASK_REOPENED:      { label: t('act.task.reopened'),       icon: History,      color: 'text-yellow-400' },
        BOOKING_CREATED:    { label: t('act.booking.created'),     icon: CheckCircle2, color: 'text-emerald-400' },
        BOOKING_UPDATED:    { label: t('act.booking.updated'),     icon: Package,      color: 'text-yellow-400' },
        DOCUMENT_UPLOAD:    { label: t('act.doc.uploaded'),        icon: FileText,     color: 'text-zinc-400' },
    }

    function getConfig(action: string) {
        return ACTION_CONFIG[action] ?? {
            label: action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()),
            icon: History,
            color: 'text-zinc-500',
        }
    }

    return (
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <ActivityIcon className="w-3.5 h-3.5 text-zinc-600" />
                <h3 className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase font-inter">{title ?? t('act.recent')}</h3>
            </div>

            {/* List — fixed, no scroll */}
            <div className="flex-1 flex flex-col gap-1">
                {items.length > 0 ? items.map((act) => {
                    const { label, icon: Icon, color } = getConfig(act.action)
                    return (
                        <Link
                            key={act.id}
                            href={act.url}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
                        >
                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                            <span className="text-xs font-semibold text-white font-inter flex-1 truncate group-hover:text-white/80 transition-colors">
                                {label}
                            </span>
                            <span className="text-[10px] text-zinc-700 font-mono flex-shrink-0">{timeAgo(act.timestamp)}</span>
                            <ArrowUpRight className="w-3 h-3 text-zinc-800 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
                        </Link>
                    )
                }) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-8">
                        <History className="w-5 h-5 text-zinc-600 mb-2" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 font-inter">{t('act.no.activity')}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Link href="/dashboard/activity"
                className="mt-4 block w-full py-2.5 border border-white/[0.05] rounded-xl text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter hover:bg-white hover:text-black transition-all text-center">
                {t('act.view.all')}
            </Link>
        </div>
    )
}
