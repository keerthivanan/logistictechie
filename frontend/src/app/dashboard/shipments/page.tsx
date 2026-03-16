'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ArrowUpRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ShipmentsPage() {
    const { user, logout, loading: authLoading } = useAuth()
    const router = useRouter()
    const [shipments, setShipments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchShipments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/marketplace/my-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()
            if (data.success) {
                setShipments(data.requests)
            }
        } catch (e) {
            console.error('Failed to fetch shipments', e)
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            router.push('/login')
        } else {
            fetchShipments()
        }
    }, [user, authLoading, router, fetchShipments])

    if (loading || authLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-white opacity-10" />
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Synchronizing Ledger...</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 flex-shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold tracking-tight text-white uppercase font-outfit">
                            Logistics <span className="text-zinc-600">Ledger</span>
                        </h1>
                        <div className="h-3 w-px bg-white/10" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] font-inter">Vector: Active Shipments</p>
                    </div>
                    <p className="text-zinc-600 font-medium font-inter text-xs">Executive oversight of all physical vectors currently in transit.</p>
                </div>
                <Link href="/marketplace"
                    className="bg-white text-black px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all font-inter self-start md:self-auto">
                    New Booking Protocol
                </Link>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0 bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                {shipments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-full mb-6">
                            <Search className="w-10 h-10 text-zinc-700" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tight font-outfit">No active shipments found</h3>
                        <p className="text-[10px] text-zinc-600 max-w-sm mb-8 font-medium font-inter leading-relaxed">
                            Start a new search to lock in a quote and begin your shipment journey.
                        </p>
                        <Link href="/"
                            className="text-[9px] font-black text-white hover:text-emerald-400 underline-offset-8 underline decoration-zinc-800 hover:decoration-emerald-500 transition-all uppercase tracking-widest font-inter">
                            Return to Command Center
                        </Link>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#0a0a0a] z-10">
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="pl-8 pr-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Reference</th>
                                    <th className="px-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Route Matrix</th>
                                    <th className="px-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Modal Type</th>
                                    <th className="px-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Protocol Date</th>
                                    <th className="px-6 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter">Status</th>
                                    <th className="pr-8 py-5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter text-right">Commit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {shipments.map((s) => (
                                    <tr key={s.request_id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="pl-8 pr-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-mono font-bold text-white tracking-widest">{s.request_id}</span>
                                                <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-1 font-inter">Marketplace Verified</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-300 font-inter tracking-tight">
                                                    <span>{s.origin || 'Unknown'}</span>
                                                    <ArrowUpRight className="w-3 h-3 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                                    <span>{s.destination || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest font-inter">Global Vector Path</span>
                                                    {s.commodity && (
                                                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest font-inter px-1.5 py-0.5 bg-emerald-500/10 rounded-sm">
                                                            {s.commodity}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5 font-inter">
                                                {s.cargo_type} MODAL
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-zinc-400 font-inter">{new Date(s.submitted_at).toLocaleDateString()}</span>
                                                <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1 font-inter">Submission Point</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${s.status === 'SHIPPED' || s.status === 'CLOSED' ? 'bg-emerald-500' :
                                                        s.status === 'OPEN' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] font-inter ${s.status === 'SHIPPED' || s.status === 'CLOSED' ? 'text-emerald-400' :
                                                        s.status === 'OPEN' ? 'text-amber-400' : 'text-blue-400'}`}>
                                                        {s.status}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {s.is_hazardous && (
                                                        <span className="text-[7px] font-black bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">HAZ</span>
                                                    )}
                                                    {s.needs_insurance && (
                                                        <span className="text-[7px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">INS</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="pr-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/marketplace/${s.request_id}`}
                                                    className="w-9 h-9 flex items-center justify-center rounded-full border border-white/5 bg-white/[0.01] text-zinc-700 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all group-hover:scale-110">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Link>
                                                <div className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-xl text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] font-inter">
                                                    {s.quotation_count} QUOTES
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
