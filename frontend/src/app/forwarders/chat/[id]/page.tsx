'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/config'
import { Loader2, Send, ArrowLeft, X, BarChart3, ArrowRight } from 'lucide-react'
import { FullPageSpinner } from '@/components/ui/Spinner'

interface Message {
    id: number
    sender_role: string
    sender_id: string
    message_type: string
    content: string
    offer_amount: number | null
    created_at: string
}

interface ConvMeta {
    public_id: string
    request_id: string
    forwarder_company: string
    original_price: number
    current_offer: number | null
    agreed_price: number | null
    currency: string
    status: string
    booking_id: string | null
    offer_side: 'SHIPPER' | 'FORWARDER' | null
    shipper_close_req: boolean
    forwarder_close_req: boolean
    shipper_last_seen: string | null
    forwarder_last_seen: string | null
}

function lastSeenLabel(isoString: string | null): string {
    if (!isoString) return 'Not yet active'
    const diff = Math.floor((Date.now() - new Date(isoString + 'Z').getTime()) / 1000)
    if (diff < 30) return 'Online now'
    if (diff < 3600) return `Last seen ${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)}h ago`
    return `Last seen ${Math.floor(diff / 86400)}d ago`
}

export default function ForwarderChatPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    // Portal auth state
    const [fwdId, setFwdId] = useState('')
    const [fwdEmail, setFwdEmail] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)
    const [authError, setAuthError] = useState('')

    // Chat state — initialized from sessionStorage so return visits are instant
    const [conv, setConv] = useState<ConvMeta | null>(() => {
        try { return JSON.parse(sessionStorage.getItem(`fwd_conv_${id}`) || 'null') } catch { return null }
    })
    const [messages, setMessages] = useState<Message[]>(() => {
        try { return JSON.parse(sessionStorage.getItem(`fwd_msgs_${id}`) || '[]') } catch { return [] }
    })
    const [loading, setLoading] = useState(false)
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const [closingDeal, setClosingDeal] = useState(false)
    const [counterAmount, setCounterAmount] = useState('')
    const [showCounterInput, setShowCounterInput] = useState(false)
    const [error, setError] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    // Currency converter state
    const [convTo, setConvTo] = useState('USD')
    const [convResult, setConvResult] = useState<string | null>(null)
    const [convLoading, setConvLoading] = useState(false)

    // On mount: check localStorage for saved portal credentials
    useEffect(() => {
        const storedId = localStorage.getItem('cl_fwd_id')
        const storedEmail = localStorage.getItem('cl_fwd_email')
        if (storedId && storedEmail) {
            setFwdId(storedId)
            setFwdEmail(storedEmail)
            setIsAuthenticated(true)
        }
    }, [])

    const fetchMessages = useCallback(async () => {
        if (!fwdId || !fwdEmail) return
        try {
            const res = await apiFetch(
                `/api/forwarders/conversations/${id}/messages`,
                { headers: { 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail } }
            )
            if (!res.ok) {
                if (res.status === 401) {
                    setIsAuthenticated(false)
                    localStorage.removeItem('cl_fwd_id')
                    localStorage.removeItem('cl_fwd_email')
                }
                return
            }
            const data = await res.json()
            setConv(data.conversation)
            setMessages(data.messages)
            // Cache for instant revisit
            try {
                sessionStorage.setItem(`fwd_conv_${id}`, JSON.stringify(data.conversation))
                sessionStorage.setItem(`fwd_msgs_${id}`, JSON.stringify(data.messages))
            } catch {}
        } catch {
            // silent poll failure
        } finally {
            setLoading(false)
        }
    }, [id, fwdId, fwdEmail])

    // Start polling when authenticated
    useEffect(() => {
        if (!isAuthenticated || !fwdId || !fwdEmail) return
        setLoading(true)
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [isAuthenticated, fetchMessages, fwdId, fwdEmail])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Currency converter — uses conv directly to avoid temporal dead zone with activePrice
    useEffect(() => {
        const price = conv?.agreed_price ?? conv?.current_offer ?? conv?.original_price
        if (!conv || !price) { setConvResult(null); return }
        if (convTo === conv.currency) {
            setConvResult(Number(price).toLocaleString(undefined, { maximumFractionDigits: 2 }))
            return
        }
        const controller = new AbortController()
        setConvLoading(true)
        fetch(`https://api.frankfurter.app/latest?amount=${price}&from=${conv.currency}&to=${convTo}`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                const rate = data.rates?.[convTo]
                setConvResult(rate != null ? Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) : null)
            })
            .catch(() => {})
            .finally(() => setConvLoading(false))
        return () => controller.abort()
    }, [conv?.agreed_price, conv?.current_offer, conv?.original_price, convTo, conv?.currency])

    // ── Auth ──────────────────────────────────────────────────────────────────

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setAuthLoading(true)
        setAuthError('')
        try {
            const res = await apiFetch('/api/forwarders/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: fwdId.toUpperCase(), email: fwdEmail }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                const normalizedId = fwdId.toUpperCase()
                localStorage.setItem('cl_fwd_id', normalizedId)
                localStorage.setItem('cl_fwd_email', fwdEmail)
                setFwdId(normalizedId)
                setIsAuthenticated(true)
            } else {
                setAuthError(data.detail || 'Invalid credentials. Check your Partner ID and email.')
            }
        } catch {
            setAuthError('Network error. Please try again.')
        } finally {
            setAuthLoading(false)
        }
    }

    // ── Chat actions ──────────────────────────────────────────────────────────

    const sendText = async () => {
        if (!text.trim() || sending) return
        setSending(true)
        setError('')
        try {
            await apiFetch(`/api/forwarders/conversations/${id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: fwdId, email: fwdEmail, content: text.trim() }),
            })
            setText('')
        } catch {
            setError('Failed to send.')
        } finally {
            setSending(false)
        }
    }

    const respondOffer = async (action: 'ACCEPT' | 'REJECT') => {
        setSending(true)
        setError('')
        try {
            const res = await apiFetch(`/api/forwarders/conversations/${id}/respond-offer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: fwdId, email: fwdEmail, action }),
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.detail || 'Failed.')
            }
        } catch {
            setError('Request failed.')
        } finally {
            setSending(false)
        }
    }

    const sendCounter = async () => {
        const amount = parseFloat(counterAmount)
        if (isNaN(amount) || amount <= 0 || !conv) return
        setSending(true)
        setError('')
        try {
            const res = await apiFetch(`/api/forwarders/conversations/${id}/respond-offer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: fwdId, email: fwdEmail, action: 'COUNTER', counter_amount: amount }),
            })
            if (res.ok) {
                setShowCounterInput(false)
                setCounterAmount('')
            } else {
                const data = await res.json()
                setError(data.detail || 'Counter failed.')
            }
        } catch {
            setError('Counter failed.')
        } finally {
            setSending(false)
        }
    }

    // Counter chips: prices between shipper's offer and original (going UP)
    const getCounterChips = (): number[] => {
        if (!conv?.current_offer) return []
        const low = conv.current_offer
        const high = conv.original_price
        const range = high - low
        if (range <= 0) return []
        const step = Math.max(1, Math.round(range / 5))
        const chips: number[] = []
        let p = low + step
        while (chips.length < 4 && p < high) {
            chips.push(Math.round(p / step) * step)
            p += step
        }
        return chips
    }

    const closeDeal = async () => {
        if (closingDeal) return
        setClosingDeal(true)
        setError('')
        try {
            const res = await apiFetch(`/api/forwarders/conversations/${id}/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: fwdId, email: fwdEmail }),
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.detail || 'Could not close deal.')
            }
        } catch {
            setError('Failed to close deal.')
        } finally {
            setClosingDeal(false)
        }
    }

    // ── Derived state ─────────────────────────────────────────────────────────

    const isBooked = conv?.status === 'BOOKED'
    const isClosed = conv?.status === 'CLOSED'
    const shipperWaiting = conv?.offer_side === 'SHIPPER'   // shipper sent offer → forwarder must respond
    const activePriceLabel = conv?.agreed_price ? 'Agreed' : conv?.current_offer ? 'Counter Offer' : 'Quoted'
    const activePrice = conv?.agreed_price ?? conv?.current_offer ?? conv?.original_price

    // Close deal button state
    const iAlreadyRequested = conv?.forwarder_close_req ?? false
    const otherRequested = conv?.shipper_close_req ?? false

    // ── Login screen ──────────────────────────────────────────────────────────

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">Partner Chat</h1>
                        <p className="text-xs text-zinc-500">Sign in to access this conversation</p>
                    </div>

                    <form onSubmit={handleLogin} className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4">
                        {authError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs">
                                {authError}
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">Partner ID</label>
                            <input
                                type="text"
                                placeholder="REG-OMEGO-XXXX"
                                value={fwdId}
                                onChange={e => setFwdId(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-white/20 outline-none transition-colors placeholder-zinc-700 uppercase"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="company@email.com"
                                value={fwdEmail}
                                onChange={e => setFwdEmail(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-colors placeholder-zinc-700"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Access Chat <ArrowRight className="w-3.5 h-3.5" /></>}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading && !conv) {
        return (
            <FullPageSpinner />
        )
    }

    if (!conv) {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-500 text-sm">
                Conversation not found or you don&apos;t have access.
            </div>
        )
    }

    // ── Chat UI ───────────────────────────────────────────────────────────────

    return (
        <div className="h-screen bg-[#050505] flex flex-col max-w-2xl mx-auto">

            {/* ── Header ────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] flex-shrink-0 bg-[#080808]">
                <button
                    onClick={() => router.push('/forwarders/portal')}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-zinc-500" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white font-outfit truncate">{conv.forwarder_company}</span>
                        <span className="text-zinc-700">↔</span>
                        <span className="text-xs font-mono text-zinc-600 truncate">Shipper</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            conv.shipper_last_seen && (Date.now() - new Date(conv.shipper_last_seen + 'Z').getTime()) < 30000
                                ? 'bg-emerald-400'
                                : 'bg-zinc-700'
                        }`} />
                        <p className="text-[10px] text-zinc-600 font-mono">{lastSeenLabel(conv.shipper_last_seen)}</p>
                    </div>
                </div>
                <span className={`text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0 ${
                    isBooked ? 'bg-emerald-500/10 text-emerald-400'
                    : isClosed ? 'bg-zinc-800 text-zinc-500'
                    : 'bg-white/5 text-zinc-500'
                }`}>
                    {isBooked ? 'Booked' : isClosed ? 'Closed' : 'Open'}
                </span>
            </div>

            {/* ── Price Bar ─────────────────────────────── */}
            <div className="px-4 py-3 border-b border-white/[0.04] bg-[#080808] flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">{activePriceLabel}</p>
                        <p className={`text-xl font-semibold font-mono leading-tight ${
                            conv.agreed_price ? 'text-emerald-400'
                            : conv.current_offer ? 'text-amber-400'
                            : 'text-white'
                        }`}>
                            {conv.currency} {Number(activePrice).toLocaleString()}
                        </p>
                        {conv.current_offer && !conv.agreed_price && (
                            <p className="text-[9px] text-zinc-600 font-inter">
                                Original: {conv.currency} {Number(conv.original_price).toLocaleString()}
                            </p>
                        )}
                        {/* Currency converter */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[9px] text-zinc-700">≈</span>
                            <select
                                value={convTo}
                                onChange={e => setConvTo(e.target.value)}
                                className="bg-black border border-white/[0.06] rounded-lg text-[10px] text-zinc-500 px-1.5 py-0.5 outline-none cursor-pointer"
                            >
                                {['USD','EUR','GBP','JPY','CNY','AED','SGD','INR','SAR','AUD','CAD','CHF'].filter(c => c !== conv.currency).map(c => (
                                    <option key={c} value={c} className="bg-black">{c}</option>
                                ))}
                            </select>
                            <span className="text-[10px] font-mono text-zinc-500">
                                {convLoading ? '...' : convResult ? `${convTo} ${convResult}` : '—'}
                            </span>
                        </div>
                    </div>

                    {/* Close Deal button — forwarder side */}
                    {!isBooked && !isClosed && (
                        <div className="flex-shrink-0">
                            {iAlreadyRequested ? (
                                <span className="text-[9px] text-zinc-600 font-inter italic">
                                    Waiting for shipper to confirm...
                                </span>
                            ) : otherRequested ? (
                                <button
                                    onClick={closeDeal}
                                    disabled={closingDeal}
                                    className="bg-amber-500 text-black text-[10px] font-semibold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-amber-400 transition-all animate-pulse disabled:opacity-50"
                                >
                                    Shipper wants to close. Confirm?
                                </button>
                            ) : (
                                <button
                                    onClick={closeDeal}
                                    disabled={closingDeal}
                                    className="bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-semibold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {closingDeal ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Close Deal'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Closed banner */}
                {isClosed && !isBooked && (
                    <div className="mt-3 bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-zinc-400">Deal closed. This conversation is archived.</p>
                    </div>
                )}
            </div>

            {/* ── Messages ──────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                {messages.map((msg) => {

                    if (msg.message_type === 'SYSTEM') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <p className="text-[10px] text-zinc-600 font-inter italic text-center max-w-xs bg-white/[0.02] px-3 py-2 rounded-xl border border-white/[0.04]">
                                    {msg.content}
                                </p>
                            </div>
                        )
                    }

                    if (msg.message_type === 'OFFER') {
                        const latestOfferId = Math.max(...messages.filter(m => m.message_type === 'OFFER').map(m => m.id))
                        const isActivePending = shipperWaiting && msg.id === latestOfferId
                        return (
                            <div key={msg.id} className="flex justify-start">
                                <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 max-w-[280px]">
                                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Shipper's Offer</p>
                                    <p className="text-2xl font-semibold font-mono text-white">
                                        {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-zinc-600 font-inter mt-1">
                                        Original: {conv.currency} {Number(conv.original_price).toLocaleString()}
                                    </p>

                                    {isActivePending && !isBooked && !isClosed && !showCounterInput && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => respondOffer('ACCEPT')}
                                                disabled={sending}
                                                className="flex-1 bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => setShowCounterInput(true)}
                                                disabled={sending}
                                                className="flex-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50"
                                            >
                                                Counter
                                            </button>
                                            <button
                                                onClick={() => respondOffer('REJECT')}
                                                disabled={sending}
                                                className="flex-1 bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {/* Counter input panel */}
                                    {isActivePending && !isBooked && !isClosed && showCounterInput && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-widest">Your Counter Price</p>
                                            {/* Counter chips */}
                                            <div className="flex gap-1.5 flex-wrap">
                                                {getCounterChips().map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setCounterAmount(String(p))}
                                                        className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold font-mono transition-all ${
                                                            counterAmount === String(p)
                                                                ? 'bg-white text-black border-white'
                                                                : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                                                        }`}
                                                    >
                                                        {p.toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-500 text-xs font-mono">{conv.currency}</span>
                                                <input
                                                    type="number"
                                                    value={counterAmount}
                                                    onChange={e => setCounterAmount(e.target.value)}
                                                    placeholder={String(Math.round(((conv.current_offer ?? conv.original_price) + conv.original_price) / 2))}
                                                    className="flex-1 bg-transparent text-xl font-semibold font-mono text-white outline-none border-b border-white/10 focus:border-white/30 transition-colors pb-0.5"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={sendCounter}
                                                    disabled={sending || !counterAmount}
                                                    className="flex-1 bg-white text-black text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-30"
                                                >
                                                    Send Counter
                                                </button>
                                                <button
                                                    onClick={() => { setShowCounterInput(false); setCounterAmount('') }}
                                                    className="px-3 py-2 bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-semibold rounded-xl hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    // COUNTER_OFFER — forwarder's own counter, shown on right
                    if (msg.message_type === 'COUNTER_OFFER') {
                        return (
                            <div key={msg.id} className="flex justify-end">
                                <div className="bg-[#0d0d0d] border border-amber-500/20 rounded-2xl p-4 max-w-[260px]">
                                    <p className="text-[9px] font-semibold text-amber-500 uppercase tracking-widest mb-2">Your Counter</p>
                                    <p className="text-2xl font-semibold font-mono text-white">
                                        {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-zinc-600 font-inter mt-1">Waiting for shipper response</p>
                                </div>
                            </div>
                        )
                    }

                    if (msg.message_type === 'ACCEPTED') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center">
                                    <p className="text-xs font-semibold text-emerald-400">✅ {msg.content}</p>
                                </div>
                            </div>
                        )
                    }

                    if (msg.message_type === 'REJECTED') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center">
                                    <p className="text-xs font-semibold text-red-400">❌ {msg.content}</p>
                                </div>
                            </div>
                        )
                    }

                    const isMine = msg.sender_id === fwdId
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[72%] px-4 py-3 rounded-2xl ${
                                isMine
                                    ? 'bg-white text-black rounded-br-sm'
                                    : 'bg-[#141414] border border-white/[0.06] text-white rounded-bl-sm'
                            }`}>
                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                <p className={`text-[9px] mt-1 ${isMine ? 'text-black/40' : 'text-zinc-600'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* ── Error ─────────────────────────────────── */}
            {error && (
                <div className="mx-4 mb-2 flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-red-400 font-inter">{error}</p>
                    <button onClick={() => setError('')}><X className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
            )}

            {/* ── Input Area ────────────────────────────── */}
            {!isBooked && !isClosed ? (
                <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#080808]">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <input
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() } }}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-white/15 transition-colors font-inter"
                        />
                        <button
                            onClick={sendText}
                            disabled={!text.trim() || sending}
                            className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-30 flex-shrink-0"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-4 bg-[#080808] text-center">
                    <p className="text-xs text-zinc-600 font-inter">
                        {isBooked ? 'This conversation is closed — booking confirmed.' : 'This deal has been closed.'}
                    </p>
                </div>
            )}
        </div>
    )
}
