'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Loader2, Link2 } from 'lucide-react'
import Link from 'next/link'
import { API_URL } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ShipmentsPage() {
    const { user, logout, loading: authLoading } = useAuth()
    const router = useRouter()
    const [shipments, setShipments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return; // Wait until auth is resolved

        if (!user) {
            router.push('/login')
        } else {
            fetchShipments()
        }
    }, [user, authLoading, router])

    const fetchShipments = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/bookings/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()
            if (data.success) {
                setShipments(data.data)
            }
        } catch (e) {
            console.error('Failed to fetch shipments', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Shipments</h2>
                <Link href="/" className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all">
                    New Booking
                </Link>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[400px] text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Synchronizing Ledger...
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                        <div className="p-4 bg-white/5 rounded-full mb-4">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No active shipments found</h3>
                        <p className="text-gray-400 max-w-sm mb-6">
                            Start a new search on the homepage to lock in a quote and begin your journey.
                        </p>
                        <Link href="/" className="text-white underline font-bold hover:text-gray-300 transition-colors">
                            Return to Command Center
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black/50 text-gray-400 text-sm uppercase">
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Route</th>
                                    <th className="px-6 py-4">Mode</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {shipments.map((s) => {
                                    let cargo = s.cargo_details
                                    if (typeof cargo === 'string') {
                                        try {
                                            cargo = JSON.parse(cargo)
                                        } catch (e) {
                                            cargo = {}
                                        }
                                    }
                                    return (
                                        <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-mono font-bold text-white">{s.booking_reference}</td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {cargo?.origin || 'Unknown'} → {cargo?.destination || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{cargo?.containerSize || 'FCL'}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(s.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === 'SHIPPED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    s.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Link
                                                        href={`/booking/confirmation?id=${s.booking_reference}`}
                                                        className="text-sm font-bold text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors"
                                                    >
                                                        Details <Link2 className="w-3 h-3" />
                                                    </Link>
                                                    <Link
                                                        href={`/tracking?id=${s.booking_reference}`}
                                                        className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]"
                                                    >
                                                        Track
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
