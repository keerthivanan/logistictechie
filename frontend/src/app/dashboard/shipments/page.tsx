'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Loader2, Link2, ArrowUpRight } from 'lucide-react'
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
        <div className="max-w-6xl mx-auto space-y-12 py-6">
            {/* Header section - Realigned to Dashboard Pattern */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold tracking-tight text-white uppercase font-outfit">
                            Logistics <span className="text-zinc-600">Ledger</span>
                        </h1>
                        <div className="h-4 w-px bg-white/10" />
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] font-inter">
                            Vector: Active Shipments
                        </p>
                    </div>
                    <p className="text-zinc-500 font-medium font-inter max-w-md text-xs leading-relaxed">Executive oversight of all physical vectors currently in transit across the global grid.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/" className="bg-white text-black px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all font-inter shadow-xl">
                        New Booking Protocol
                    </Link>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[500px] space-y-4 opacity-20">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Synchronizing Ledger...</p>
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-full mb-6">
                            <Search className="w-10 h-10 text-zinc-700" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tight font-outfit">No active shipments found</h3>
                        <p className="text-[10px] text-zinc-600 max-w-sm mb-8 font-medium font-inter leading-relaxed">
                            Start a new search on the homepage to lock in a quote and begin your journey.
                        </p>
                        <Link href="/" className="text-[9px] font-black text-white hover:text-emerald-400 underline-offset-8 underline decoration-zinc-800 hover:decoration-emerald-500 transition-all uppercase tracking-widest font-inter">
                            Return to Command Center
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="pl-10 pr-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Reference</th>
                                    <th className="px-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Route Matrix</th>
                                    <th className="px-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Modal Type</th>
                                    <th className="px-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Protocol Date</th>
                                    <th className="px-6 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Status</th>
                                    <th className="pr-10 py-6 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter text-right">Commit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
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
                                        <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors relative">
                                            <td className="pl-10 pr-6 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-mono font-bold text-white tracking-widest">{s.booking_reference}</span>
                                                    <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-1 font-inter">System Verified</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-300 font-inter tracking-tight">
                                                        <span>{cargo?.origin || 'Unknown'}</span>
                                                        <ArrowUpRight className="w-3 h-3 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                                        <span>{cargo?.destination || 'Unknown'}</span>
                                                    </div>
                                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1 font-inter leading-none">Global Vector Path</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5 font-inter">
                                                    {cargo?.containerSize || 'FCL'} MODAL
                                                </span>
                                            </td>
                                            <td className="px-6 py-8 text-zinc-600 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-zinc-400 font-inter">{new Date(s.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1 font-inter">Creation Point</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'SHIPPED' ? 'bg-emerald-500 animate-pulse' :
                                                        s.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500'
                                                        } shadow-[0_0_8px_currentColor]`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] font-inter ${s.status === 'SHIPPED' ? 'text-emerald-400' :
                                                        s.status === 'PENDING' ? 'text-amber-400' : 'text-blue-400'
                                                        }`}>
                                                        {s.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="pr-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={`/booking/confirmation?id=${s.booking_reference}`}
                                                        className="w-9 h-9 flex items-center justify-center rounded-full border border-white/5 bg-white/[0.01] text-zinc-700 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all shadow-sm group-hover:scale-110"
                                                    >
                                                        <Link2 className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/tracking?id=${s.booking_reference}`}
                                                        className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[8px] font-black text-zinc-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-[0.2em] font-inter"
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
            <div className="flex items-center justify-center pt-20 pb-20 opacity-20">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em]">Inventory Segment Handover</p>
            </div>
        </div>
    )
}
