'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/lib/config'

// Professional Command Center Components
import DashboardHeader from './_components/DashboardHeader'
import MetricCards from './_components/MetricCards'
import CommandFeed from './_components/CommandFeed'
import SovereignFlow from './_components/SovereignFlow'
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

                const response = await fetch(`${API_URL}/api/dashboard/stats/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.status === 401) {
                    logout()
                    router.push('/login')
                    return
                }

                if (!response.ok) throw new Error('Failed to fetch intelligence vector')

                const data = await response.json()
                setStats(data)
                setError(null)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchDashboardData()
        }
    }, [user, authLoading, router, logout])

    if (loading || authLoading) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-white opacity-10" />
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Node Link</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto text-center">
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
        <div className="space-y-12 max-w-7xl mx-auto py-6">
            {/* Minimalist Identity & Performance Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                <DashboardHeader
                    userName={isForwarder ? `Partner: ${user?.name}` : user?.name}
                />
                <MetricCards stats={stats} />
            </div>

            {/* Strategic Layout: Activity & Flow */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* Unified Activity Core */}
                <div className="xl:col-span-1">
                    <CommandFeed
                        activities={stats?.recent_activity || []}
                        title={isForwarder ? "Partner Log" : "Command Feed"}
                    />
                </div>

                {/* Tactical Execution Core */}
                <div className="xl:col-span-3">
                    <SovereignFlow
                        shipments={stats?.kanban_shipments || []}
                        activeCount={stats?.active_shipments || 0}
                        title={isForwarder ? "Live Market Bids" : "Operational Flow"}
                    />
                </div>
            </div>
        </div>
    )
}
