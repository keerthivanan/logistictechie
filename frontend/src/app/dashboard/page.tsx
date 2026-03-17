'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'

import DashboardHeader from './_components/DashboardHeader'
import MetricCards from './_components/MetricCards'
import CommandFeed from './_components/CommandFeed'
import SovereignFlow from './_components/SovereignFlow'
import OpenRequestsPanel from './_components/OpenRequestsPanel'
import { DashboardStats } from './_components/types'

export default function DashboardPage() {
    const { user, loading: authLoading, logout } = useAuth()
    const router = useRouter()

    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

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
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchDashboardData()
    }, [user, authLoading, router, logout])

    if (loading || authLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-white opacity-10" />
                <p className="text-xs text-zinc-600">Loading...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto text-center">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-[8px] font-black uppercase tracking-[0.2em] text-white border-b border-white px-2 py-1"
                >
                    Retry
                </button>
            </div>
        )
    }

    const isForwarder = user?.role === 'forwarder'

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Header row: name + metrics */}
            <div className="flex-shrink-0 flex items-center justify-between gap-6 pb-4 border-b border-white/5">
                <DashboardHeader userName={user?.name} />
                <MetricCards stats={stats} />
            </div>

            {/* Activity + main panel */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 flex-1 min-h-0">
                <div className="xl:col-span-1 min-h-0 overflow-hidden">
                    <CommandFeed
                        activities={stats?.recent_activity || []}
                        title="Recent Activity"
                    />
                </div>
                <div className="xl:col-span-3 min-h-0 overflow-hidden">
                    {isForwarder ? (
                        <SovereignFlow
                            shipments={stats?.kanban_shipments || []}
                            activeCount={stats?.active_shipments || 0}
                            title="Live Market Bids"
                        />
                    ) : (
                        <OpenRequestsPanel />
                    )}
                </div>
            </div>
        </div>
    )
}
