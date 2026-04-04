'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import {
    Search, Package, TrendingUp, CheckCircle2,
    ArrowRight, Clock, AlertCircle, Star,
    DollarSign, Ship, Truck, Info, Loader2,
    Zap, X
} from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'
import { useT } from '@/lib/i18n/t'

interface Quote {
    request_id: string
    origin: string
    destination: string
    cargo_type: string
    your_price?: number
}

interface Metrics {
    total_quotes_submitted: number
    active_bids: number
    won_bids: number
    reliability_score: number
}

export default function PartnerDashboard() {
    const t = useT()
    const { user } = useAuth()
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [companyName, setCompanyName] = useState('')
    const [loading, setLoading] = useState(true)
    const [appStatus, setAppStatus] = useState<string | null>(null)

    const [search, setSearch] = useState('')
    const [selectedRequest, setSelectedRequest] = useState<Quote | null>(null)
    const [bidPrice, setBidPrice] = useState('')
    const [submittingBid, setSubmittingBid] = useState(false)
    const [bidSuccess, setBidSuccess] = useState(false)
    const [bidError, setBidError] = useState('')

    const fetchData = useCallback(async () => {
        if (!user) return
        const token = localStorage.getItem('token')
        const fwdId = user.forwarder_id || user.sovereign_id

        try {
            const res = await apiFetch(
                `/api/forwarders/portal-dashboard/${fwdId}?email=${encodeURIComponent(user.email)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.ok) {
                const data = await res.json()
                setCompanyName(data.company_name || user.name || '')
                setQuotes(data.open_requests || [])
                setMetrics(data.metrics || null)
            }
        } catch { /* silent */ } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!user) return
        // Sync portal credentials to localStorage so forwarder chat works without re-login
        if (user.role === 'forwarder') {
            const fwdId = user.forwarder_id || user.sovereign_id
            if (fwdId) localStorage.setItem('cl_fwd_id', fwdId)
            if (user.email) localStorage.setItem('cl_fwd_email', user.email)
        }
        if (user.role !== 'forwarder') {
            const token = localStorage.getItem('token')
            apiFetch('/api/forwarders/my-status', { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json())
                .then(d => setAppStatus(d.status))
                .catch(() => {})
                .finally(() => setLoading(false))
            return
        }
        fetchData()
    }, [user, fetchData])

    const submitBid = async () => {
        if (!selectedRequest || !bidPrice || !user) return
        setSubmittingBid(true)
        setBidError('')
        try {
            const res = await apiFetch('/api/forwarders/portal-bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: selectedRequest.request_id,
                    forwarder_id: user.forwarder_id || user.sovereign_id,
                    email: user.email,
                    status: 'ANSWERED',
                    price: parseFloat(bidPrice)
                })
            })
            if (res.ok) {
                setBidSuccess(true)
                setBidPrice('')
                fetchData()
                setTimeout(() => {
                    setBidSuccess(false)
                    setSelectedRequest(null)
                }, 2500)
            } else {
                const err = await res.json().catch(() => null)
                setBidError(err?.detail || 'Failed to submit quote.')
            }
        } catch {
            setBidError('Network error. Please try again.')
        } finally {
            setSubmittingBid(false)
        }
    }

    // Non-forwarder states
    if (!loading && user?.role !== 'forwarder') {
        if (appStatus === 'PENDING') {
            return (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white mb-1">{t('partner.under.review')}</h2>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto">{t('partner.under.review.sub')}</p>
                    </div>
                    <span className="px-4 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-bold uppercase tracking-widest">{t('partner.pending.badge')}</span>
                </div>
            )
        }
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white mb-1">{t('partner.access.only')}</h2>
                    <p className="text-zinc-500 text-sm max-w-sm mx-auto">{t('partner.access.only.sub')}</p>
                </div>
                <Link href="/forwarders/register" className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all">
                    {t('partner.apply')}
                </Link>
            </div>
        )
    }

    // Filtered requests
    const filtered = quotes.filter(q => {
        if (!search.trim()) return true
        const s = search.toLowerCase()
        return (
            q.origin?.toLowerCase().includes(s) ||
            q.destination?.toLowerCase().includes(s) ||
            q.cargo_type?.toLowerCase().includes(s) ||
            q.request_id?.toLowerCase().includes(s)
        )
    })

    return (
        <div className="h-full flex flex-col gap-5 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">{companyName || user?.name}</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-mono text-zinc-500">{user?.sovereign_id}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Partner
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 flex-shrink-0">
                {[
                    { label: t('partner.metrics.total'), value: metrics?.total_quotes_submitted ?? 0, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/[0.07]', border: 'border-blue-500/10' },
                    { label: t('partner.metrics.active'), value: metrics?.active_bids ?? 0, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/[0.07]', border: 'border-amber-500/10' },
                    { label: t('partner.metrics.won'), value: metrics?.won_bids ?? 0, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.07]', border: 'border-emerald-500/10' },
                    { label: t('partner.metrics.score'), value: metrics?.reliability_score ? `${metrics.reliability_score}/5` : '—', icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/[0.07]', border: 'border-purple-500/10' },
                ].map(s => (
                    <div key={s.label} className="bg-zinc-950 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                            <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-white leading-none mb-0.5">{loading ? '—' : s.value}</p>
                            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main split */}
            <div className="flex-1 flex gap-4 min-h-0">

                {/* LEFT — Open Requests + Search */}
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">

                    {/* Search header */}
                    <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t('partner.search')}
                                className="w-full bg-black border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-700 focus:border-white/15 outline-none transition-colors"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="w-3.5 h-3.5 text-zinc-600 hover:text-white transition-colors" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Panel sub-header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.03] flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Package className="w-3 h-3 text-zinc-600" />
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Open Requests</span>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-700 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-md">
                            {filtered.length} {filtered.length === 1 ? 'request' : 'requests'}
                        </span>
                    </div>

                    {/* Request list */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Spinner size="sm" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16 opacity-30">
                                <Clock className="w-8 h-8 text-zinc-600" />
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">
                                        {search ? t('partner.no.results') : t('partner.no.requests')}
                                    </p>
                                    <p className="text-xs text-zinc-600">
                                        {search ? t('partner.no.results.sub') : t('partner.no.requests.sub')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filtered.map(q => {
                                const isSelected = selectedRequest?.request_id === q.request_id
                                return (
                                    <div
                                        key={q.request_id}
                                        onClick={() => { setSelectedRequest(q); setBidSuccess(false); setBidPrice('') }}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all group ${
                                            isSelected
                                                ? 'bg-emerald-500/[0.06] border-emerald-500/25 border-l-2 border-l-emerald-500'
                                                : 'bg-black/50 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                                                    isSelected ? 'bg-emerald-500 text-black' : 'bg-white/[0.03] border border-white/5 text-zinc-600'
                                                }`}>
                                                    {q.cargo_type?.includes('SEA') ? <Ship className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <span className="text-sm font-bold text-white">{q.origin}</span>
                                                        <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                                        <span className="text-sm font-bold text-white">{q.destination}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-mono text-zinc-600">{q.request_id}</span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wide">{q.cargo_type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-0.5">Your Quote</p>
                                                <p className={`text-sm font-bold font-mono ${(q.your_price ?? 0) > 0 ? 'text-emerald-400' : 'text-zinc-700'}`}>
                                                    {(q.your_price ?? 0) > 0 ? `$${q.your_price!.toLocaleString()}` : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT — Bid Form */}
                <div className="w-68 flex-shrink-0">
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 h-full flex flex-col">

                        {!selectedRequest ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 opacity-25">
                                <CheckCircle2 className="w-8 h-8 text-zinc-600" />
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Select a request from the list to submit your quote
                                </p>
                            </div>
                        ) : bidSuccess ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">Quote Submitted</p>
                                    <p className="text-xs text-zinc-500">Your bid has been sent successfully.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full gap-4">
                                {/* Form header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('partner.bid')}</span>
                                    <button onClick={() => setSelectedRequest(null)} className="text-zinc-600 hover:text-white transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Request info */}
                                <div className="bg-black border border-white/5 rounded-xl p-3 space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                        <span className="text-[10px] font-mono text-zinc-500 truncate">{selectedRequest.request_id}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                                        <span className="truncate">{selectedRequest.origin}</span>
                                        <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                        <span className="truncate">{selectedRequest.destination}</span>
                                    </div>
                                    <span className="inline-block text-[9px] font-bold text-zinc-500 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                        {selectedRequest.cargo_type}
                                    </span>
                                </div>

                                {/* Price input */}
                                <div className="flex-1 flex flex-col justify-end gap-3">
                                    <div>
                                        <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('partner.bid.price')}</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={bidPrice}
                                                onChange={e => setBidPrice(e.target.value)}
                                                className="w-full bg-black border border-white/5 rounded-xl pl-9 pr-4 py-3 text-xl font-bold text-emerald-400 placeholder-zinc-800 focus:border-emerald-500/30 outline-none transition-colors font-mono"
                                            />
                                        </div>
                                    </div>
                                    {bidError && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-[10px] text-red-400 font-inter leading-relaxed">
                                            {bidError}
                                        </div>
                                    )}
                                    <button
                                        disabled={!bidPrice || submittingBid}
                                        onClick={submitBid}
                                        className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98]"
                                    >
                                        {submittingBid
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <>{t('partner.bid.submit')} <ArrowRight className="w-3.5 h-3.5" /></>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
