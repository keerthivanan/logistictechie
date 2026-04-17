'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import { X, Mail } from 'lucide-react'

import DashboardHeader from './_components/DashboardHeader'
import { useT } from '@/lib/i18n/t'
import MetricCards from './_components/MetricCards'
import CommandFeed from './_components/CommandFeed'
import SovereignFlow from './_components/SovereignFlow'
import OpenRequestsPanel from './_components/OpenRequestsPanel'
import { DashboardStats } from './_components/types'

export default function DashboardPage() {
    const t = useT()
    const { user, loading: authLoading, logout } = useAuth()
    const router = useRouter()

    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [, setActivityLoading] = useState(true)
    const [, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [emailToast, setEmailToast] = useState(false)
    const toastChecked = useRef(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

                // Fetch stats (fast — no activity)
                const response = await apiFetch(`/api/dashboard/stats/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.status === 401) {
                    logout()
                    router.push('/login')
                    return
                }

                if (!response.ok) throw new Error('Failed to load dashboard data')

                const data = await response.json()
                setStats(data)
                setError(null)
                setLoading(false)

                // Lazy-load activity separately so dashboard renders instantly
                setActivityLoading(true)
                try {
                    const actRes = await apiFetch(`/api/dashboard/activity/full?limit=20`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    if (actRes.ok) {
                        const actData = await actRes.json()
                        setStats(prev => prev ? { ...prev, recent_activity: actData.activities || [] } : prev)
                        // Show email toast once if a submission happened within last 60s
                        if (!toastChecked.current) {
                            toastChecked.current = true
                            const recent = (actData.activities || []).find((a: any) =>
                                (a.action === 'MARKETPLACE_SUBMIT' || a.action === 'BOOKING_CREATED') &&
                                (Date.now() - new Date(a.timestamp).getTime()) < 60000
                            )
                            if (recent) {
                                setEmailToast(true)
                                setTimeout(() => setEmailToast(false), 8000)
                            }
                        }
                    }
                } catch { /* activity failing silently is fine */ } finally {
                    setActivityLoading(false)
                }
            } catch (err: any) {
                setError(err.message)
                setLoading(false)
            }
        }

        if (user) {
            fetchDashboardData()
            const iv = setInterval(fetchDashboardData, 30000)
            return () => clearInterval(iv)
        }
    }, [user, authLoading, router, logout])

    if (authLoading) return <PageSpinner />

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto text-center">
                <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-white border-b border-white px-2 py-1"
                >
                    {t('dash.retry.btn')}
                </button>
            </div>
        )
    }

    const isForwarder = user?.role === 'forwarder'

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Email sent toast */}
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
            {/* Header row: name + metrics */}
            <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-4 border-b border-white/5">
                <DashboardHeader userName={user?.name} />
                <MetricCards stats={stats} />
            </div>

            {/* Activity + main panel */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 flex-1 min-h-0">
                <div className="xl:col-span-1 min-h-0 overflow-hidden">
                    <CommandFeed
                        activities={stats?.recent_activity || []}
                        title={t('act.recent')}
                    />
                </div>
                <div className="xl:col-span-3 min-h-0 overflow-hidden">
                    {isForwarder ? (
                        <SovereignFlow
                            shipments={stats?.kanban_shipments || []}
                            activeCount={stats?.active_shipments || 0}
                            title={t('dash.live.bids')}
                        />
                    ) : (
                        <OpenRequestsPanel />
                    )}
                </div>
            </div>
        </div>
    )
}
