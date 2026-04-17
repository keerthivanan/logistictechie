'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import { X, Mail, Package, Clock, Truck, ClipboardList, ArrowRight, Plus, MessageSquare, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { useT } from '@/lib/i18n/t'
import CommandFeed from './_components/CommandFeed'
import OpenRequestsPanel from './_components/OpenRequestsPanel'
import { DashboardStats } from './_components/types'

type Tab = 'overview' | 'requests' | 'messages'

interface ConvSummary {
    public_id: string
    request_id: string
    forwarder_company: string
    original_price: number
    current_offer: number | null
    agreed_price: number | null
    currency: string
    status: string
    unread_count?: number
    last_message: { content: string; sender_role: string; created_at: string } | null
}

export default function DashboardPage() {
    const t = useT()
    const { user, loading: authLoading, logout } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<Tab>('overview')

    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [, setActivityLoading] = useState(true)
    const [, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [emailToast, setEmailToast] = useState(false)
    const toastChecked = useRef(false)

    // Messages tab state
    const [conversations, setConversations] = useState<ConvSummary[]>([])
    const [convLoading, setConvLoading] = useState(false)

    const fetchConversations = useCallback(async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await apiFetch('/api/conversations/', { headers: { Authorization: `Bearer ${token}` } })
            if (res.status === 401) { logout(); return }
            const data = await res.json()
            if (data.conversations) setConversations(data.conversations)
        } catch { } finally { setConvLoading(false) }
    }, [logout])

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return }

        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                const response = await apiFetch(`/api/dashboard/stats/me`, { headers: { 'Authorization': `Bearer ${token}` } })
                if (response.status === 401) { logout(); router.push('/login'); return }
                if (!response.ok) throw new Error('Failed to load dashboard data')
                const data = await response.json()
                setStats(data)
                setError(null)
                setLoading(false)
                setActivityLoading(true)
                try {
                    const actRes = await apiFetch(`/api/dashboard/activity/full?limit=20`, { headers: { 'Authorization': `Bearer ${token}` } })
                    if (actRes.ok) {
                        const actData = await actRes.json()
                        setStats(prev => prev ? { ...prev, recent_activity: actData.activities || [] } : prev)
                        if (!toastChecked.current) {
                            toastChecked.current = true
                            const recent = (actData.activities || []).find((a: any) =>
                                (a.action === 'MARKETPLACE_SUBMIT' || a.action === 'BOOKING_CREATED') &&
                                (Date.now() - new Date(a.timestamp).getTime()) < 60000
                            )
                            if (recent) { setEmailToast(true); setTimeout(() => setEmailToast(false), 8000) }
                        }
                    }
                } catch { } finally { setActivityLoading(false) }
            } catch (err: any) { setError(err.message); setLoading(false) }
        }

        if (user) {
            fetchDashboardData()
            const iv = setInterval(fetchDashboardData, 30000)
            return () => clearInterval(iv)
        }
    }, [user, authLoading, router, logout])

    // Load conversations when messages tab is active
    useEffect(() => {
        if (activeTab !== 'messages' || !user) return
        setConvLoading(true)
        fetchConversations()
        const iv = setInterval(fetchConversations, 10000)
        return () => clearInterval(iv)
    }, [activeTab, user, fetchConversations])

    if (authLoading) return <PageSpinner />
    if (error) return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto text-center">
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{error}</p>
            <button onClick={() => window.location.reload()}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white border-b border-white px-2 py-1">
                {t('dash.retry.btn')}
            </button>
        </div>
    )

    const metrics = [
        { icon: Package, value: stats?.active_shipments ?? 0, label: 'Active Loads' },
        { icon: Clock, value: stats?.total_shipments ?? 0, label: 'Total Shipments' },
        { icon: ClipboardList, value: stats?.pending_tasks_count ?? 0, label: 'Active Tasks' },
        { icon: Truck, value: stats?.delivered_shipments ?? 0, label: 'Delivered' },
    ]

    const convDisplay = (c: ConvSummary) => {
        if (c.agreed_price) return { label: 'Agreed', price: c.agreed_price, color: 'text-white' }
        if (c.current_offer) return { label: 'Offer', price: c.current_offer, color: 'text-amber-400' }
        return { label: 'Quoted', price: c.original_price, color: 'text-white' }
    }

    const totalUnread = conversations.reduce((n, c) => n + (c.unread_count || 0), 0)

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">

            {/* Email toast */}
            {emailToast && (
                <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs font-medium text-white">
                            Confirmation email sent to <span className="font-bold">{user?.email}</span>
                        </p>
                    </div>
                    <button onClick={() => setEmailToast(false)} className="text-zinc-600 hover:text-white transition-colors flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Header: name + status + metric pills */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold font-outfit text-white tracking-tight">
                        {user?.name ? `${user.name}'s Dashboard` : 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {metrics.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 hover:border-white/10 transition-all">
                            <m.icon className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                            <span className="text-sm font-bold text-white tabular-nums">{m.value}</span>
                            <span className="text-[9px] font-semibold text-zinc-700 uppercase tracking-widest hidden sm:block">{m.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Portal-style tab bar */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1 flex-shrink-0">
                {([
                    { key: 'overview', label: 'Overview' },
                    { key: 'requests', label: 'Shipper Requests' },
                    { key: 'messages', label: 'Messages', badge: totalUnread },
                ] as { key: Tab; label: string; badge?: number }[]).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 relative py-2 px-3 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${activeTab === tab.key ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                        {tab.label}
                        {tab.badge ? <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" /> : null}
                    </button>
                ))}
            </div>

            {/* OVERVIEW tab */}
            {activeTab === 'overview' && (
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                    {/* Recent Activity */}
                    <div className="xl:col-span-1 min-h-0 overflow-hidden">
                        <CommandFeed activities={stats?.recent_activity || []} title={t('act.recent')} />
                    </div>

                    {/* Quick Actions + Stats */}
                    <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 min-h-0 overflow-y-auto">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex-shrink-0">Quick Actions</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { href: '/marketplace', icon: Plus, title: 'New Shipment', desc: 'Post a freight request' },
                                { href: '/dashboard/shipments', icon: Package, title: 'My Shipments', desc: 'View all requests & quotes' },
                                { href: '/dashboard/messages', icon: MessageSquare, title: 'Messages', desc: 'Chat with forwarders' },
                                { href: '/forwarders', icon: Truck, title: 'Find Forwarders', desc: 'Browse partner directory' },
                            ].map(({ href, icon: Icon, title, desc }) => (
                                <Link key={href} href={href}
                                    className="flex items-center gap-4 p-4 bg-black border border-white/5 rounded-xl hover:border-white/15 hover:bg-white/[0.02] transition-all group">
                                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.08] transition-all">
                                        <Icon className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{title}</p>
                                        <p className="text-[10px] text-zinc-600">{desc}</p>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-700 ml-auto group-hover:text-zinc-400 transition-colors" />
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {metrics.map(m => (
                                <div key={m.label}>
                                    <p className="text-2xl font-bold text-white tabular-nums">{m.value}</p>
                                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SHIPPER REQUESTS tab */}
            {activeTab === 'requests' && (
                <div className="flex-1 min-h-0 overflow-hidden">
                    <OpenRequestsPanel />
                </div>
            )}

            {/* MESSAGES tab — forwarder conversations inline */}
            {activeTab === 'messages' && (
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Forwarder Conversations</span>
                        </div>
                        <Link href="/dashboard/messages"
                            className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {convLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-16">
                                <MessageSquare className="w-8 h-8 text-zinc-600" />
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">No conversations yet</p>
                                    <p className="text-xs text-zinc-600">When you accept a quote, chat opens here</p>
                                </div>
                            </div>
                        ) : conversations.map(conv => {
                            const { label, price, color } = convDisplay(conv)
                            return (
                                <Link key={conv.public_id} href={`/dashboard/messages/${conv.public_id}`}
                                    className="block p-4 rounded-xl border bg-black border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white">{conv.forwarder_company}</span>
                                            <span className="text-[10px] font-mono text-zinc-600">{conv.request_id}</span>
                                            {(conv.unread_count ?? 0) > 0 && (
                                                <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{conv.unread_count}</span>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            conv.status === 'BOOKED' ? 'bg-white/[0.06] text-white'
                                            : conv.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-500'
                                            : 'bg-white/5 text-zinc-500'}`}>
                                            {conv.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                                            {conv.last_message?.content || 'No messages yet'}
                                        </p>
                                        <div className="text-right flex-shrink-0 ml-3">
                                            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">{label}</p>
                                            <p className={`text-sm font-bold font-mono ${color}`}>{conv.currency} {Number(price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
