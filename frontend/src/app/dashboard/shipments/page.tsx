'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ArrowRight, Ship, Zap, CheckCircle2, Clock, Package, MessageSquare } from 'lucide-react'
import { PageSpinner, Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'
import { apiFetch } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useT } from '@/lib/i18n/t'

function isOnline(lastSeen: string | null): boolean {
    if (!lastSeen) return false
    return (Date.now() - new Date(lastSeen + 'Z').getTime()) < 120000
}

function lastSeenLabel(lastSeen: string | null): string {
    if (!lastSeen) return ''
    const diff = Date.now() - new Date(lastSeen + 'Z').getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    if (diff < 120000) return 'Online now'
    if (h < 1) return `Last seen ${m}m ago`
    return `Last seen ${h}h ago`
}

interface Quotation {
    quotation_id: string
    forwarder_company: string
    total_price: number
    currency: string
    transit_days: number | null
    ai_summary: string | null
    carrier: string | null
    received_at: string
    forwarder_last_seen: string | null
    conv_public_id: string | null
}

interface ShipmentRequest {
    request_id: string
    origin: string
    destination: string
    cargo_type: string
    commodity: string
    weight_kg: number
    container_type: string | null
    is_hazardous: boolean
    needs_insurance: boolean
    status: string
    quotation_count: number
    submitted_at: string
    quotations: Quotation[]
}

export default function ShipmentsPage() {
    const t = useT()
    const { user, logout, loading: authLoading } = useAuth()
    const router = useRouter()
    const [requests, setRequests] = useState<ShipmentRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState('')

    const fetchRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch('/api/marketplace/my-requests', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.status === 401) { logout(); return }
            const data = await res.json()
            if (data.success) {
                setRequests(data.requests)
            } else {
                setError(true)
            }
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        if (authLoading) return
        if (!user) { router.push('/login'); return }
        if (user.role === 'forwarder') { router.push('/dashboard/partner'); return }
        fetchRequests()
        const iv = setInterval(fetchRequests, 10000)
        return () => clearInterval(iv)
    }, [user, authLoading, router, fetchRequests])

    const openChat = async (quote: Quotation, req: ShipmentRequest) => {
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch('/api/conversations/start', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: req.request_id, quote_id: quote.quotation_id }),
            })
            const data = await res.json()
            if (res.ok && data.public_id) {
                window.open(`/dashboard/messages/${data.public_id}`, '_blank')
            }
        } catch {
            // silently fail — user can retry
        }
    }

    const filtered = requests.filter(r => {
        if (!search.trim()) return true
        const s = search.toLowerCase()
        return (
            r.request_id.toLowerCase().includes(s) ||
            r.origin.toLowerCase().includes(s) ||
            r.destination.toLowerCase().includes(s) ||
            r.cargo_type.toLowerCase().includes(s) ||
            r.commodity?.toLowerCase().includes(s)
        )
    })

    if (loading || authLoading) {
        return (
            <PageSpinner />
        )
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-red-400">Failed to load shipments. Please refresh.</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 flex-shrink-0">
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white font-outfit">{t('shipments.title')}</h1>
                    <p className="text-zinc-500 text-xs font-inter mt-0.5">{t('shipments.start')}</p>
                </div>
                <Link
                    href="/marketplace"
                    className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all font-inter self-start md:self-auto"
                >
                    {t('shipments.new')}
                </Link>
            </div>

            {/* Search */}
            <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('shipments.search.placeholder')}
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:border-white/15 outline-none transition-colors font-inter"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {filtered.length === 0 ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center">
                            <Package className="w-7 h-7 text-zinc-700" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1 font-outfit uppercase tracking-tight">{t('shipments.empty.title')}</h3>
                            <p className="text-xs text-zinc-600 font-inter max-w-xs">{t('shipments.empty.sub')}</p>
                        </div>
                        <Link href="/marketplace" className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all">
                            {t('shipments.request.quote')}
                        </Link>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filtered.map((req, idx) => {
                            const quotes = req.quotations || []
                            const bestPrice = quotes.length > 0 ? Math.min(...quotes.map(q => q.total_price)) : null
                            const validTransit = quotes.filter(q => q.transit_days != null)
                            const fastestDays = validTransit.length > 0 ? Math.min(...validTransit.map(q => q.transit_days!)) : null
                            const isBooked = req.status === 'CLOSED'

                            return (
                                <motion.div
                                    key={req.request_id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden"
                                >
                                    {/* Request Header */}
                                    <div className="px-5 py-4 border-b border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isBooked ? 'bg-emerald-500/10' : 'bg-white/[0.03] border border-white/5'}`}>
                                                    {isBooked
                                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        : <Ship className="w-4 h-4 text-zinc-600" />
                                                    }
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono font-bold text-white">{req.request_id}</span>
                                                    <span className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                        isBooked
                                                            ? 'bg-emerald-500/10 text-emerald-400'
                                                            : quotes.length >= 3
                                                            ? 'bg-blue-500/10 text-blue-400'
                                                            : 'bg-amber-500/10 text-amber-400 animate-pulse'
                                                    }`}>
                                                        {isBooked ? 'Booked' : quotes.length >= 3 ? 'Quotes Ready' : 'Collecting Quotes'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-xs font-bold text-zinc-300 truncate">{req.origin}</span>
                                                    <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                                    <span className="text-xs font-bold text-zinc-300 truncate">{req.destination}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {req.commodity && (
                                                <span className="text-[9px] font-bold text-zinc-500 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/5 uppercase tracking-wider hidden sm:block">
                                                    {req.commodity}
                                                </span>
                                            )}
                                            <span className="text-[9px] font-bold text-zinc-600 font-inter">
                                                {req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : ''}
                                            </span>
                                            <Link
                                                href={`/marketplace/${req.request_id}`}
                                                className="text-[9px] font-semibold text-zinc-600 hover:text-white uppercase tracking-widest border border-white/5 px-2.5 py-1.5 rounded-lg hover:border-white/20 transition-all"
                                            >
                                                Full View
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Quotes Section */}
                                    {quotes.length === 0 ? (
                                        <div className="px-5 py-6 flex items-center gap-4 text-center justify-center">
                                            <Spinner size="sm" className="flex-shrink-0" />
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-zinc-500 font-inter">Waiting for forwarder quotes</p>
                                                <p className="text-[10px] text-zinc-700 font-inter mt-0.5">Quotes will appear here as forwarders respond.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/[0.03]">
                                            {!isBooked && (
                                                <div className="px-5 py-3 flex items-center gap-2">
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">
                                                        {quotes.length} {quotes.length === 1 ? 'Quote' : 'Quotes'} Received
                                                        {quotes.length >= 3 ? ' — Select one to book' : ''}
                                                    </p>
                                                </div>
                                            )}
                                            {quotes.map((quote, qIdx) => {
                                                const isBest = quote.total_price === bestPrice
                                                const isFastest = quote.transit_days != null && quote.transit_days === fastestDays

                                                return (
                                                    <div
                                                        key={quote.quotation_id}
                                                        className={`px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${
                                                            isBest && !isBooked ? 'bg-emerald-500/[0.03]' : ''
                                                        }`}
                                                    >
                                                        {/* Rank */}
                                                        <div className="flex-shrink-0">
                                                            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-[10px] font-semibold text-zinc-500 font-mono">
                                                                0{qIdx + 1}
                                                            </div>
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0 space-y-1.5">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-sm font-semibold text-white font-outfit">{quote.forwarder_company}</span>
                                                                {quote.carrier && (
                                                                    <span className="text-[9px] font-bold bg-white/5 text-zinc-500 px-2 py-0.5 rounded-md border border-white/5 uppercase tracking-widest">
                                                                        {quote.carrier}
                                                                    </span>
                                                                )}
                                                                {isBest && !isBooked && (
                                                                    <span className="text-[9px] font-semibold bg-emerald-500 text-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                                        Best Price
                                                                    </span>
                                                                )}
                                                                {isFastest && !isBooked && (
                                                                    <span className="text-[9px] font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                                        Fastest
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {quote.transit_days && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="w-3 h-3 text-zinc-600" />
                                                                    <span className="text-[10px] text-zinc-500 font-inter">{quote.transit_days} days transit</span>
                                                                </div>
                                                            )}
                                                            {quote.ai_summary && (
                                                                <div className="flex items-start gap-1.5">
                                                                    <Zap className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-[10px] text-zinc-500 font-inter leading-relaxed italic line-clamp-2">{quote.ai_summary}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Price + Book */}
                                                        <div className="flex items-center gap-4 flex-shrink-0">
                                                            <div className="text-right">
                                                                <p className="text-lg font-semibold font-mono text-white leading-none">
                                                                    {quote.currency} {Number(quote.total_price).toLocaleString()}
                                                                </p>
                                                                <p className="text-[9px] text-zinc-600 font-inter mt-0.5">all-in</p>
                                                            </div>

                                                            {isBooked ? (
                                                                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    <span className="text-[9px] font-semibold uppercase tracking-widest">Booked</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-end gap-1">
                                                                    {quote.forwarder_last_seen && (
                                                                        <div className="flex items-center gap-1">
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline(quote.forwarder_last_seen) ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                                                                            <span className="text-[9px] text-zinc-600 font-inter">{lastSeenLabel(quote.forwarder_last_seen)}</span>
                                                                        </div>
                                                                    )}
                                                                    {quote.conv_public_id ? (
                                                                        <a
                                                                            href={`/dashboard/messages/${quote.conv_public_id}`}
                                                                            target="_blank"
                                                                            className="bg-white text-black px-4 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-1.5 font-inter shadow-lg"
                                                                        >
                                                                            <MessageSquare className="w-3 h-3" /> Open Chat
                                                                        </a>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => openChat(quote, req)}
                                                                            className="bg-white text-black px-4 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-1.5 font-inter shadow-lg"
                                                                        >
                                                                            <MessageSquare className="w-3 h-3" /> Chat
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
