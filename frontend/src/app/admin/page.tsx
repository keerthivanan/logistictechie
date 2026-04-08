'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import {
    CheckCircle2, XCircle, Clock, Users, Building2, Globe,
    Phone, FileText, RefreshCw, Package,
    TrendingUp, UserCheck, UserX, Briefcase, ShoppingBag,
    AlertCircle,
} from 'lucide-react'

interface ForwarderApp {
    forwarder_id: string
    company_name: string
    contact_person: string
    email: string
    company_email: string
    phone: string
    country: string
    specializations: string
    routes: string
    tax_id: string
    website: string
    document_url: string
    logo_url: string
    registered_at: string
    status: string
    is_verified?: boolean
}

interface UserRow {
    id: string
    sovereign_id: string
    email: string
    full_name: string
    role: string
    is_active: boolean
    is_locked: boolean
    created_at: string
}

interface AdminStats {
    total_users: number
    active_users: number
    inactive_users: number
    forwarder_users: number
    regular_users: number
    total_forwarders: number
    pending_applications: number
    active_forwarders: number
    rejected_applications: number
    total_requests: number
    open_requests: number
    closed_requests: number
    total_quotes: number
}

type Tab = 'pending' | 'all' | 'users'

const statusColor = (s: string) => {
    if (s === 'ACTIVE') return 'text-white bg-white/[0.06] border-white/20'
    if (s === 'PENDING') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    if (s === 'REJECTED') return 'text-red-400 bg-red-500/10 border-red-500/20'
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
}

const roleColor = (r: string) => {
    if (r === 'forwarder') return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    if (r === 'admin') return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
}

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [pending, setPending] = useState<ForwarderApp[]>([])
    const [allForwarders, setAllForwarders] = useState<ForwarderApp[]>([])
    const [allUsers, setAllUsers] = useState<UserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [tab, setTab] = useState<Tab>('pending')
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

    // GATE: redirect anyone who is not admin — no flash, no "access denied" page
    useEffect(() => {
        if (authLoading) return
        if (!user) { router.replace('/login'); return }
        if (user.role !== 'admin') { router.replace('/dashboard'); return }
    }, [user, authLoading, router])

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }
            const [statsRes, pendingRes, allRes, usersRes] = await Promise.all([
                apiFetch('/api/admin/stats', { headers }),
                apiFetch('/api/admin/pending-forwarders', { headers }),
                apiFetch('/api/admin/all-forwarders', { headers }),
                apiFetch('/api/admin/all-users', { headers }),
            ])
            // If somehow unauthorized (edge case), redirect silently
            if (statsRes.status === 401 || statsRes.status === 403) {
                router.replace('/dashboard')
                return
            }
            setStats(await statsRes.json())
            setPending(await pendingRes.json())
            setAllForwarders(await allRes.json())
            setAllUsers(await usersRes.json())
        } catch {
            showToast('Failed to load data', false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (authLoading || !user || user.role !== 'admin') return
        fetchData()
    }, [user, authLoading])

    const handleApprove = async (fwd: ForwarderApp) => {
        setActionLoading(fwd.forwarder_id)
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/admin/approve-forwarder/${fwd.forwarder_id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                showToast(`${fwd.company_name} approved! New ID: ${data.new_sovereign_id}`, true)
                fetchData()
            } else {
                showToast(data.detail || 'Approval failed', false)
            }
        } catch {
            showToast('Network error', false)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (fwd: ForwarderApp) => {
        if (!confirm(`Reject application from ${fwd.company_name}?`)) return
        setActionLoading(fwd.forwarder_id)
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/admin/reject-forwarder/${fwd.forwarder_id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                showToast(`${fwd.company_name} rejected.`, true)
                fetchData()
            } else {
                showToast(data.detail || 'Rejection failed', false)
            }
        } catch {
            showToast('Network error', false)
        } finally {
            setActionLoading(null)
        }
    }

    // Show nothing while auth is loading or user is not admin — no flash
    if (authLoading || !user || user.role !== 'admin') {
        return null
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
        )
    }

    const statGroups = stats ? [
        {
            label: 'Users',
            items: [
                { icon: Users, label: 'Total Users', value: stats.total_users, color: 'text-blue-400' },
                { icon: UserCheck, label: 'Active', value: stats.active_users, color: 'text-white' },
                { icon: UserX, label: 'Inactive / Locked', value: stats.inactive_users, color: 'text-red-400' },
                { icon: ShoppingBag, label: 'Shippers', value: stats.regular_users, color: 'text-zinc-400' },
                { icon: Briefcase, label: 'Partners', value: stats.forwarder_users, color: 'text-purple-400' },
            ],
        },
        {
            label: 'Partner Applications',
            items: [
                { icon: Building2, label: 'Total Applied', value: stats.total_forwarders, color: 'text-blue-400' },
                { icon: Clock, label: 'Pending Review', value: stats.pending_applications, color: 'text-amber-400' },
                { icon: CheckCircle2, label: 'Active Partners', value: stats.active_forwarders, color: 'text-white' },
                { icon: XCircle, label: 'Rejected', value: stats.rejected_applications, color: 'text-red-400' },
            ],
        },
        {
            label: 'Marketplace',
            items: [
                { icon: Package, label: 'Total Requests', value: stats.total_requests, color: 'text-blue-400' },
                { icon: AlertCircle, label: 'Open', value: stats.open_requests, color: 'text-amber-400' },
                { icon: CheckCircle2, label: 'Closed', value: stats.closed_requests, color: 'text-zinc-400' },
                { icon: TrendingUp, label: 'Total Quotes', value: stats.total_quotes, color: 'text-white' },
            ],
        },
    ] : []

    return (
        <div className="min-h-screen bg-[#050505] text-white font-inter">

            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-bold border shadow-2xl transition-all ${toast.ok ? 'bg-white/[0.06] border-white/20 text-white' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="border-b border-white/5 px-8 py-5 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-40">
                <div className="flex items-center gap-4">
                    <img src="/cargolink.png" alt="CargoLink" className="h-10 w-auto object-contain opacity-90" />
                    <h1 className="text-lg font-semibold uppercase tracking-tight">Admin Control Panel</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 font-mono">{user.email}</span>
                    <div className="px-2 py-1 rounded border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                        Admin
                    </div>
                    <button onClick={fetchData} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                        <RefreshCw className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

                {stats && statGroups.map(group => (
                    <div key={group.label}>
                        <h2 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.3em] mb-4">{group.label}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {group.items.map(({ icon: Icon, label, value, color }) => (
                                <div key={label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                                    <Icon className={`w-4 h-4 ${color} mb-3`} />
                                    <p className="text-2xl font-semibold font-mono text-white">{value}</p>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex gap-2 flex-wrap">
                    {([
                        { key: 'pending', label: `Pending Review (${pending.length})` },
                        { key: 'all', label: `All Partners (${allForwarders.length})` },
                        { key: 'users', label: `All Users (${allUsers.length})` },
                    ] as { key: Tab; label: string }[]).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${tab === t.key ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'pending' && (
                    <div className="space-y-4">
                        {pending.length === 0 ? (
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-16 text-center">
                                <CheckCircle2 className="w-8 h-8 text-white mx-auto mb-3" />
                                <p className="text-sm font-bold text-zinc-300">No pending applications</p>
                                <p className="text-xs text-zinc-600 mt-1">All caught up!</p>
                            </div>
                        ) : pending.map(fwd => (
                            <div key={fwd.forwarder_id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-white/10 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-white truncate">{fwd.company_name}</h3>
                                        <p className="text-xs text-zinc-500 mt-0.5">{fwd.contact_person}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border flex-shrink-0 ${statusColor(fwd.status)}`}>{fwd.status}</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                    <div className="flex items-center gap-2 text-zinc-400"><Globe className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{fwd.country || '—'}</span></div>
                                    <div className="flex items-center gap-2 text-zinc-400"><Phone className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{fwd.phone || '—'}</span></div>
                                    <div className="flex items-center gap-2 text-zinc-400"><Building2 className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{fwd.email}</span></div>
                                    {fwd.company_email && <div className="flex items-center gap-2 text-zinc-400"><Building2 className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{fwd.company_email}</span></div>}
                                    {fwd.tax_id && <div className="flex items-center gap-2 text-zinc-400"><FileText className="w-3.5 h-3.5 flex-shrink-0" />Tax: {fwd.tax_id}</div>}
                                    {fwd.website && <div className="flex items-center gap-2 text-zinc-400"><Globe className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{fwd.website}</span></div>}
                                </div>

                                {fwd.routes && (
                                    <p className="text-xs text-zinc-500"><span className="text-zinc-700">Routes:</span> {fwd.routes}</p>
                                )}

                                {fwd.specializations && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {fwd.specializations.split(',').map(s => (
                                            <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-400 uppercase">{s.trim()}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                    <p className="text-[10px] text-zinc-700 flex-1 font-mono">
                                        {fwd.forwarder_id} · Applied {new Date(fwd.registered_at).toLocaleDateString()}
                                    </p>
                                    {fwd.document_url && (
                                        <a href={fwd.document_url} target="_blank" rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-lg text-[10px] font-bold bg-white/5 text-zinc-400 hover:bg-white/10 transition-all uppercase tracking-widest">
                                            Docs
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleReject(fwd)}
                                        disabled={actionLoading === fwd.forwarder_id}
                                        className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(fwd)}
                                        disabled={actionLoading === fwd.forwarder_id}
                                        className="px-4 py-2 rounded-lg text-xs font-bold bg-white/[0.06] border border-white/20 text-white hover:bg-white/10 transition-all disabled:opacity-40"
                                    >
                                        {actionLoading === fwd.forwarder_id ? 'Processing...' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'all' && (
                    <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    {['Company', 'Contact', 'Email', 'Country', 'Specializations', 'Status', 'Verified', 'Applied'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allForwarders.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-600">No forwarders registered yet.</td></tr>
                                ) : allForwarders.map(fwd => (
                                    <tr key={fwd.forwarder_id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all">
                                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{fwd.company_name}</td>
                                        <td className="px-4 py-3 text-zinc-500">{fwd.contact_person || '—'}</td>
                                        <td className="px-4 py-3 text-zinc-400 font-mono text-[10px]">{fwd.email}</td>
                                        <td className="px-4 py-3 text-zinc-400">{fwd.country || '—'}</td>
                                        <td className="px-4 py-3 text-zinc-600 max-w-[180px] truncate">{fwd.specializations || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor(fwd.status)}`}>{fwd.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {fwd.is_verified
                                                ? <CheckCircle2 className="w-4 h-4 text-white" />
                                                : <XCircle className="w-4 h-4 text-zinc-700" />}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{new Date(fwd.registered_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'users' && (
                    <div className="overflow-x-auto rounded-2xl border border-white/5">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    {['Name', 'Email', 'Account ID', 'Role', 'Status', 'Joined'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-600">No users found.</td></tr>
                                ) : allUsers.map(u => (
                                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all">
                                        <td className="px-4 py-3 font-bold text-white">{u.full_name || '—'}</td>
                                        <td className="px-4 py-3 text-zinc-400 font-mono text-[10px]">{u.email}</td>
                                        <td className="px-4 py-3 text-zinc-500 font-mono text-[10px]">{u.sovereign_id || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleColor(u.role)}`}>{u.role}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.is_locked
                                                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-red-400 bg-red-500/10 border-red-500/20">LOCKED</span>
                                                : u.is_active
                                                    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-white bg-white/[0.06] border-white/20">ACTIVE</span>
                                                    : <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-zinc-400 bg-zinc-500/10 border-zinc-500/20">INACTIVE</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
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
