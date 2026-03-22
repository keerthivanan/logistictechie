'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Clock, ChevronDown, ShieldAlert, ShieldCheck,
    Scale, Calendar, Building2, ArrowRight, Plus, CheckCircle2
} from 'lucide-react'
import { apiFetch } from '@/lib/config'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'

interface Quotation {
    quotation_id: string
    forwarder_company: string
    total_price: number
    currency: string
    transit_days: number
    ai_summary: string
    received_at: string
}

interface FreightRequest {
    request_id: string
    origin: string
    destination: string
    cargo_type: string
    commodity: string
    cargo_specification: string
    quantity: number
    weight_kg: number | null
    is_hazardous: boolean
    needs_insurance: boolean
    target_date: string | null
    status: string
    quotation_count: number
    submitted_at: string
    quotations: Quotation[]
}

type Filter = 'ALL' | 'OPEN' | 'CLOSED'

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const d = Math.floor(diff / 86400000)
    const h = Math.floor(diff / 3600000)
    const m = Math.floor(diff / 60000)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    if (m > 0) return `${m}m ago`
    return 'Just now'
}

export default function OpenRequestsPanel() {
    const [requests, setRequests] = useState<FreightRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [filter, setFilter] = useState<Filter>('ALL')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await apiFetch('/api/marketplace/my-requests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data.success) {
                        const sorted = (data.requests || []).sort(
                            (a: FreightRequest, b: FreightRequest) =>
                                new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
                        )
                        setRequests(sorted)
                        // Auto-expand first open request
                        const firstOpen = sorted.find((r: FreightRequest) => r.status === 'OPEN')
                        if (firstOpen) setExpandedId(firstOpen.request_id)
                    }
                } else {
                    setError(true)
                }
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchRequests()
    }, [])

    const openCount = requests.filter(r => r.status === 'OPEN').length
    const closedCount = requests.filter(r => r.status !== 'OPEN').length

    const filtered = filter === 'ALL'
        ? requests
        : filter === 'OPEN'
            ? requests.filter(r => r.status === 'OPEN')
            : requests.filter(r => r.status !== 'OPEN')

    // Auto-expand first item whenever filter changes
    useEffect(() => {
        if (filtered.length > 0) {
            setExpandedId(filtered[0].request_id)
        } else {
            setExpandedId(null)
        }
    }, [filter, requests.length])

    return (
        <div className="h-full flex flex-col min-h-0 overflow-hidden">

            {/* ── Panel Header ── */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-white tracking-widest uppercase font-outfit">My Requests</h3>
                    {openCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                            <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-inter">{openCount} Open</span>
                        </div>
                    )}
                </div>
                <Link
                    href="/search"
                    className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                    <Plus className="w-3 h-3" /> New
                </Link>
            </div>

            {/* ── Filter Tabs ── */}
            <div className="flex items-center gap-1 mb-3 flex-shrink-0">
                {(['ALL', 'OPEN', 'CLOSED'] as Filter[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all font-inter ${filter === f
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                    >
                        {f}
                        <span className="ml-1.5 text-[9px]">
                            {f === 'ALL' ? requests.length : f === 'OPEN' ? openCount : closedCount}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── List ── */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Spinner size="sm" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <p className="text-xs text-red-400">Failed to load requests. Please refresh.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState filter={filter} />
                ) : (
                    filtered.map(req => (
                        <RequestAccordion
                            key={req.request_id}
                            request={req}
                            isExpanded={expandedId === req.request_id}
                            onToggle={() => setExpandedId(expandedId === req.request_id ? null : req.request_id)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function RequestAccordion({
    request,
    isExpanded,
    onToggle,
}: {
    request: FreightRequest
    isExpanded: boolean
    onToggle: () => void
}) {
    const isOpen = request.status === 'OPEN'
    const sortedQuotes = [...(request.quotations || [])].sort((a, b) => a.total_price - b.total_price)

    return (
        <div className={`rounded-2xl border overflow-hidden transition-all ${isExpanded
            ? 'border-white/10 bg-[#0c0c0c]'
            : 'border-white/5 bg-[#0a0a0a] hover:border-white/10'
            }`}>

            {/* ── Collapsed Row (always visible) ── */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                {/* Status indicator */}
                <div className="flex-shrink-0">
                    {isOpen ? (
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 text-zinc-600" />
                    )}
                </div>

                {/* Route + cargo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-semibold text-white font-outfit uppercase tracking-tight truncate">
                            {request.origin} → {request.destination}
                        </p>
                        {isOpen ? (
                            <span className="flex-shrink-0 text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-lg uppercase tracking-widest font-inter">Open</span>
                        ) : (
                            <span className="flex-shrink-0 text-[9px] font-bold text-zinc-600 bg-white/[0.03] border border-white/[0.05] px-1.5 py-0.5 rounded-lg uppercase tracking-widest font-inter">Closed</span>
                        )}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-inter truncate">
                        {request.cargo_type}{request.commodity ? ` · ${request.commodity}` : ''} · {timeAgo(request.submitted_at)}
                    </p>
                </div>

                {/* Quote count + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {request.quotation_count > 0 && (
                        <div className="text-right">
                            <p className="text-sm font-semibold text-white font-inter leading-none">{request.quotation_count}</p>
                            <p className="text-[9px] text-zinc-600 font-inter uppercase tracking-widest">quotes</p>
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* ── Expanded Detail ── */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-white/[0.06]">

                            {/* Cargo spec chips */}
                            <div className="px-4 pt-3 pb-3 flex flex-wrap gap-2">
                                {request.weight_kg && (
                                    <Chip icon={<Scale className="w-3 h-3" />} label={`${request.weight_kg.toLocaleString()} kg`} />
                                )}
                                {request.quantity > 0 && (
                                    <Chip icon={<Package className="w-3 h-3" />} label={`Qty ${request.quantity}`} />
                                )}
                                {request.target_date && (
                                    <Chip icon={<Calendar className="w-3 h-3" />} label={new Date(request.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                                )}
                                {request.is_hazardous && (
                                    <Chip icon={<ShieldAlert className="w-3 h-3 text-red-400" />} label="Hazardous" className="bg-red-500/10 border-red-500/20 text-red-400" />
                                )}
                                {request.needs_insurance && (
                                    <Chip icon={<ShieldCheck className="w-3 h-3 text-blue-400" />} label="Insurance" className="bg-blue-500/10 border-blue-500/20 text-blue-400" />
                                )}
                                <span className="inline-flex items-center text-[9px] font-mono text-zinc-700 px-2 py-1">{request.request_id}</span>
                            </div>

                            {request.cargo_specification && (
                                <p className="px-4 pb-3 text-[10px] text-zinc-600 font-inter leading-relaxed">{request.cargo_specification}</p>
                            )}

                            {/* Quotes */}
                            <div className="border-t border-white/[0.05]">
                                {sortedQuotes.length > 0 ? (
                                    <>
                                        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">
                                                Forwarder Quotes · Sorted Cheapest First
                                            </p>
                                        </div>
                                        <div className="divide-y divide-white/[0.04]">
                                            {sortedQuotes.map((quote, i) => (
                                                <QuoteRow key={quote.quotation_id} quote={quote} rank={i + 1} requestId={request.request_id} />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="px-4 py-5 flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-zinc-500 font-inter">Awaiting forwarder quotes</p>
                                            <p className="text-[9px] text-zinc-700 font-inter mt-0.5">Verified forwarders on CargoLink are reviewing your request</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <Link
                                href={`/marketplace/${request.request_id}`}
                                className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05] hover:bg-white/[0.03] transition-colors group"
                            >
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter group-hover:text-white transition-colors">
                                    Open full request
                                </span>
                                <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-white transition-colors" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function QuoteRow({ quote, rank, requestId }: { quote: Quotation; rank: number; requestId: string }) {
    const isBest = rank === 1
    return (
        <div className={`px-4 py-3 transition-colors ${isBest ? 'bg-emerald-500/[0.03]' : 'hover:bg-white/[0.02]'}`}>
            {/* Top row: rank + company + price */}
            <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[9px] font-semibold font-mono flex-shrink-0 w-5 text-center py-0.5 rounded ${isBest ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-700'}`}>
                        {String(rank).padStart(2, '0')}
                    </span>
                    <div className="w-6 h-6 bg-white/[0.03] border border-white/[0.06] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3 h-3 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-white font-inter truncate">{quote.forwarder_company}</p>
                            {isBest && (
                                <span className="flex-shrink-0 text-[8px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-inter">Best</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[9px] text-zinc-600 font-inter flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />{quote.transit_days} days transit
                            </span>
                            <span className="text-[9px] text-zinc-700 font-inter">{timeAgo(quote.received_at)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <p className={`text-sm font-semibold font-inter leading-none ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                        ${quote.total_price.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-zinc-600 font-inter uppercase">{quote.currency}</p>
                </div>
            </div>
            {/* AI summary */}
            {quote.ai_summary && (
                <p className="text-[10px] text-zinc-500 font-inter leading-relaxed pl-[52px] italic line-clamp-2">
                    &ldquo;{quote.ai_summary}&rdquo;
                </p>
            )}
        </div>
    )
}

function Chip({ icon, label, className = '' }: { icon: React.ReactNode; label: string; className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1 text-[10px] font-bold text-zinc-400 font-inter ${className}`}>
            {icon}{label}
        </span>
    )
}

function EmptyState({ filter }: { filter: Filter }) {
    return (
        <div className="h-40 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 opacity-50">
            <Package className="w-5 h-5 text-zinc-600" />
            <div className="text-center">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">
                    {filter === 'OPEN' ? 'No open requests' : filter === 'CLOSED' ? 'No closed requests' : 'No requests yet'}
                </p>
                {filter !== 'CLOSED' && (
                    <Link href="/search" className="text-[10px] text-zinc-600 font-inter hover:text-white transition-colors underline underline-offset-4 mt-1 block">
                        Get an instant quote
                    </Link>
                )}
            </div>
        </div>
    )
}
