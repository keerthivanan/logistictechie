'use client'

import { ArrowUpRight, Package, Truck, AlertCircle, History, ExternalLink, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Activity {
    id: string
    action: string
    entity: string
    timestamp: string
    metadata: string | null
    url: string
}

interface DashboardStats {
    active_shipments: number
    containers: number
    on_time_rate: string
    recent_activity: Activity[]
}

export default function DashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<string>('User')

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userName = localStorage.getItem('user_name')

        if (!token) {
            router.push('/login')
            return
        }

        if (userName) setUser(userName)

        fetch('http://localhost:8000/api/dashboard/stats/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.status === 401) {
                    localStorage.removeItem('token')
                    router.push('/login')
                    throw new Error('Unauthorized')
                }
                return res.json()
            })
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    Welcome back, {user}
                </h1>
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full text-xs font-mono animate-pulse">
                    SYSTEM OPERATIONAL
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid list-none md:grid-cols-3 gap-6">
                <Link href="/" className="block group">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all h-full relative overflow-hidden">
                        {stats?.active_shipments === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="flex items-center text-white font-bold border border-white/30 px-4 py-2 rounded-full bg-black">
                                    Start Booking <ExternalLink className="w-4 h-4 ml-2" />
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <span className="flex items-center text-green-400 text-sm font-bold">
                                Active
                            </span>
                        </div>
                        <div className="text-3xl font-bold mb-1 group-hover:scale-105 transition-transform origin-left">{stats?.active_shipments || 0}</div>
                        <div className="text-gray-400 text-sm">Active Shipments</div>
                    </div>
                </Link>

                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl hover:border-white/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <span className="flex items-center text-blue-400 text-sm font-bold">
                            Volume
                        </span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats?.containers || 0} TEU</div>
                    <div className="text-gray-400 text-sm">Container Volume</div>
                </div>

                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl hover:border-white/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <History className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-green-500 text-sm font-bold">
                            {stats?.on_time_rate || '100%'}
                        </span>
                    </div>
                    <div className="text-3xl font-bold mb-1">On Time</div>
                    <div className="text-gray-400 text-sm">Performance Rate</div>
                </div>
            </div>

            {/* Recent Activity / Resume Operations */}
            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" />
                        Recent Activity & Resume
                    </h2>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Real-time Stream</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/50 text-gray-400 text-sm uppercase">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4 text-right">Resume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                                stats.recent_activity.map((act) => (
                                    <tr key={act.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${act.action === 'BOOKING_CREATED' ? 'bg-green-500 animate-pulse' :
                                                    act.action === 'SEARCH' ? 'bg-blue-500' : 'bg-gray-500'
                                                    }`}></div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {act.action === 'BOOKING_CREATED' ? 'Active' : 'Logged'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            {act.action.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 text-blue-400 font-mono text-xs">
                                            {act.entity}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={act.url}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                            >
                                                RESUME <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No recent activity recorded. Start by searching specifically.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
