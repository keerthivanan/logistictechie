'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import { Loader2, Send, CheckCircle2, X, ArrowLeft } from 'lucide-react'
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
    shipper_book_req: boolean
    forwarder_book_req: boolean
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

type Tab = 'chat' | 'offer'

export default function ChatPage() {
    const { id } = useParams<{ id: string }>()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    // Initialize from sessionStorage so return visits are instant (no blank spinner)
    const [conv, setConv] = useState<ConvMeta | null>(() => {
        try { return JSON.parse(sessionStorage.getItem(`chat_conv_${id}`) || 'null') } catch { return null }
    })
    const [messages, setMessages] = useState<Message[]>(() => {
        try { return JSON.parse(sessionStorage.getItem(`chat_msgs_${id}`) || '[]') } catch { return [] }
    })
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>('chat')
    const [text, setText] = useState('')
    const [offerAmount, setOfferAmount] = useState<string>('')
    const [sending, setSending] = useState(false)
    const [bookingResult, setBookingResult] = useState<{ reference: string; forwarder_email: string } | null>(null)
    const [closingDeal, setClosingDeal] = useState(false)
    const [error, setError] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    const isShipper = user?.role !== 'forwarder'

    const fetchMessages = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) return
            const data = await res.json()
            setConv(data.conversation)
            setMessages(data.messages)
            // Cache for instant revisit
            try {
                sessionStorage.setItem(`chat_conv_${id}`, JSON.stringify(data.conversation))
                sessionStorage.setItem(`chat_msgs_${id}`, JSON.stringify(data.messages))
            } catch {}
        } catch {
            // silent poll failure
        } finally {
            setLoading(false)
        }
    }, [id])

    // Initial load + polling every 3 seconds
    useEffect(() => {
        if (authLoading || !user) return
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [fetchMessages, authLoading, user])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Pre-fill offer input when switching to offer tab
    useEffect(() => {
        if (tab === 'offer' && conv && !offerAmount) {
            const suggested = Math.floor(conv.original_price * 0.9)
            setOfferAmount(String(suggested))
        }
    }, [tab, conv, offerAmount])

    const sendText = async () => {
        if (!text.trim() || sending) return
        setSending(true)
        setError('')
        try {
            const token = localStorage.getItem('token')
            await apiFetch(`/api/conversations/${id}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text.trim() }),
            })
            setText('')
        } catch {
            setError('Failed to send.')
        } finally {
            setSending(false)
        }
    }

    const sendOffer = async () => {
        if (!offerAmount || sending) return
        const amount = parseFloat(offerAmount)
        if (isNaN(amount) || amount <= 0) return
        setSending(true)
        setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/offer`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer_amount: amount }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.detail || 'Offer failed.')
            } else {
                setTab('chat')
                setOfferAmount('')
            }
        } catch {
            setError('Failed to send offer.')
        } finally {
            setSending(false)
        }
    }

    const respondOffer = async (action: 'ACCEPT' | 'REJECT') => {
        setSending(true)
        try {
            const token = localStorage.getItem('token')
            await apiFetch(`/api/conversations/${id}/respond-offer`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })
        } catch {
            // silent
        } finally {
            setSending(false)
        }
    }

    const closeDeal = async () => {
        if (closingDeal) return
        setClosingDeal(true)
        setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/close`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
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

    const acceptCounter = async () => {
        if (sending) return
        setSending(true)
        setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/accept-counter`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.detail || 'Failed to accept counter.')
            }
        } catch {
            setError('Failed to accept counter.')
        } finally {
            setSending(false)
        }
    }

    const confirmBooking = async () => {
        if (sending) return
        setSending(true)
        setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/confirm-booking`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (res.ok) {
                setBookingResult({ reference: data.reference, forwarder_email: data.forwarder_email })
            } else {
                setError(data.detail || 'Booking failed.')
            }
        } catch {
            setError('Booking failed.')
        } finally {
            setSending(false)
        }
    }

    // Returns a clean step size based on price magnitude (1% of price, rounded to a nice number)
    const getPriceStep = (price: number) => {
        const raw = price * 0.01
        const mag = Math.pow(10, Math.floor(Math.log10(raw)))
        const n = raw / mag
        const nice = n < 1.5 ? 1 : n < 3.5 ? 2.5 : n < 7.5 ? 5 : 10
        return nice * mag
    }

    // OLX-style chips: actual prices going DOWN from reference (capped at floor)
    const getOfferChips = () => {
        if (!conv) return []
        const floor = conv.original_price * 0.80
        const step = getPriceStep(conv.original_price)
        const chips: number[] = []
        let price = conv.original_price - step
        while (chips.length < 5 && price >= floor) {
            chips.push(Math.round(price / step) * step)
            price -= step
        }
        return chips
    }

    // Feedback shown under the price input
    const getOfferFeedback = () => {
        if (!conv || !offerAmount) return null
        const amount = parseFloat(offerAmount)
        const floor = conv.original_price * 0.80
        if (isNaN(amount) || amount <= 0) return null
        if (amount >= conv.original_price) return { text: 'Must be less than the quoted price', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' }
        if (amount < floor) return { text: `Too low — minimum is ${conv.currency} ${Math.ceil(floor).toLocaleString()}`, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' }
        const pct = ((conv.original_price - amount) / conv.original_price) * 100
        if (pct <= 3) return { text: 'Very likely to be accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
        if (pct <= 10) return { text: 'Good offer — forwarder may accept', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' }
        return { text: 'Fair offer — forwarder may counter', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
    }

    const isBooked = conv?.status === 'BOOKED'
    const isClosed = conv?.status === 'CLOSED'
    const hasPendingOffer = !!conv?.current_offer && !conv?.agreed_price
    // offer_side tells whose turn it is
    const forwarderCountered = conv?.offer_side === 'FORWARDER' // forwarder countered, shipper must respond
    const activePriceLabel = conv?.agreed_price ? 'Agreed' : conv?.current_offer ? 'Counter Offer' : 'Quoted'
    const activePrice = conv?.agreed_price ?? conv?.current_offer ?? conv?.original_price

    // Close deal state (shipper perspective)
    const iAlreadyRequestedClose = conv?.shipper_close_req ?? false
    const otherRequestedClose = conv?.forwarder_close_req ?? false

    // Only block render on very first load (before any data arrives)
    if ((loading || authLoading) && !conv) {
        return (
            <FullPageSpinner />
        )
    }

    if (!conv) {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-500 text-sm">
                Conversation not found.
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#050505] flex flex-col max-w-2xl mx-auto">

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] flex-shrink-0 bg-[#080808]">
                <button onClick={() => router.push('/dashboard/messages')} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-zinc-500" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-600 truncate">{user?.sovereign_id || user?.email}</span>
                        <span className="text-zinc-700">↔</span>
                        <span className="text-sm font-semibold text-white font-outfit truncate">{conv.forwarder_company}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            conv.forwarder_last_seen && (Date.now() - new Date(conv.forwarder_last_seen + 'Z').getTime()) < 30000
                                ? 'bg-emerald-400'
                                : 'bg-zinc-700'
                        }`} />
                        <p className="text-[10px] text-zinc-600 font-mono">{lastSeenLabel(conv.forwarder_last_seen)}</p>
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

            {/* ── Price Bar ──────────────────────────────── */}
            <div className="px-4 py-3 border-b border-white/[0.04] bg-[#080808] flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">{activePriceLabel}</p>
                        <p className={`text-xl font-semibold font-mono leading-tight ${conv.agreed_price ? 'text-emerald-400' : conv.current_offer ? 'text-amber-400' : 'text-white'}`}>
                            {conv.currency} {Number(activePrice).toLocaleString()}
                        </p>
                        {conv.current_offer && !conv.agreed_price && (
                            <p className="text-[9px] text-zinc-600 font-inter">
                                Original: {conv.currency} {Number(conv.original_price).toLocaleString()}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Booking confirmation — mutual consent required */}
                        {isShipper && !isBooked && !isClosed && !bookingResult && (
                            <>
                                {/* Shipper already confirmed, waiting for forwarder */}
                                {conv.shipper_book_req && !conv.forwarder_book_req && (
                                    <span className="text-[9px] text-zinc-500 italic animate-pulse">
                                        Waiting for forwarder to confirm...
                                    </span>
                                )}
                                {/* Forwarder confirmed first — shipper's turn */}
                                {conv.forwarder_book_req && !conv.shipper_book_req && !hasPendingOffer && (
                                    <button
                                        onClick={confirmBooking}
                                        disabled={sending}
                                        className="bg-amber-500 text-black text-[10px] font-semibold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 animate-pulse"
                                    >
                                        {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Forwarder confirmed — Lock Deal'}
                                    </button>
                                )}
                                {/* Neither confirmed yet */}
                                {!conv.shipper_book_req && !conv.forwarder_book_req && !hasPendingOffer && (
                                    <button
                                        onClick={confirmBooking}
                                        disabled={sending}
                                        className="bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Booking'}
                                    </button>
                                )}
                            </>
                        )}

                        {/* Close Deal — shipper only, OPEN */}
                        {isShipper && !isBooked && !isClosed && !bookingResult && (
                            iAlreadyRequestedClose ? (
                                <span className="text-[9px] text-zinc-600 italic">Waiting for forwarder to confirm close...</span>
                            ) : otherRequestedClose ? (
                                <button
                                    onClick={closeDeal}
                                    disabled={closingDeal}
                                    className="bg-amber-500 text-black text-[10px] font-semibold uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-amber-400 transition-all animate-pulse disabled:opacity-50"
                                >
                                    Forwarder wants to close. Confirm?
                                </button>
                            ) : (
                                <button
                                    onClick={closeDeal}
                                    disabled={closingDeal}
                                    className="bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-semibold uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {closingDeal ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Close Deal'}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Booking success banner */}
                {bookingResult && (
                    <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-emerald-400">✅ Booking Confirmed — {bookingResult.reference}</p>
                        <p className="text-[10px] text-emerald-300/70 mt-0.5">Forwarder: {bookingResult.forwarder_email}</p>
                    </div>
                )}

                {/* Deal closed banner (off-platform close, not booking) */}
                {isClosed && !isBooked && !bookingResult && (
                    <div className="mt-3 bg-zinc-800/60 border border-white/5 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-zinc-400">Deal closed by both parties. This conversation is archived.</p>
                    </div>
                )}
            </div>

            {/* ── Messages ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                {messages.map((msg) => {
                    // SYSTEM message
                    if (msg.message_type === 'SYSTEM') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <p className="text-[10px] text-zinc-600 font-inter italic text-center max-w-xs bg-white/[0.02] px-3 py-2 rounded-xl border border-white/[0.04]">
                                    {msg.content}
                                </p>
                            </div>
                        )
                    }

                    // OFFER message — shipper's offer card (read-only for shipper, forwarder responds in their portal)
                    if (msg.message_type === 'OFFER') {
                        const isMyOffer = msg.sender_id === user?.sovereign_id
                        return (
                            <div key={msg.id} className={`flex ${isMyOffer ? 'justify-end' : 'justify-start'}`}>
                                <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 max-w-[260px]">
                                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Your Offer</p>
                                    <p className="text-2xl font-semibold font-mono text-white">
                                        {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-zinc-600 font-inter mt-1">
                                        {isMyOffer ? 'Waiting for forwarder response' : 'Offered by shipper'}
                                    </p>
                                </div>
                            </div>
                        )
                    }

                    // COUNTER_OFFER message — forwarder's counter card (shipper must respond)
                    if (msg.message_type === 'COUNTER_OFFER') {
                        const latestCounterId = Math.max(...messages.filter(m => m.message_type === 'COUNTER_OFFER').map(m => m.id))
                        const isActivePending = forwarderCountered && msg.id === latestCounterId
                        return (
                            <div key={msg.id} className="flex justify-start">
                                <div className="bg-[#0d0d0d] border border-amber-500/20 rounded-2xl p-4 max-w-[260px]">
                                    <p className="text-[9px] font-semibold text-amber-500 uppercase tracking-widest mb-2">Forwarder Counter</p>
                                    <p className="text-2xl font-semibold font-mono text-white">
                                        {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-zinc-600 font-inter mt-1">{conv.forwarder_company} wants this price</p>

                                    {/* Shipper: Accept counter OR counter lower (switch to offer tab) */}
                                    {isShipper && isActivePending && !isBooked && !isClosed && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={acceptCounter}
                                                disabled={sending}
                                                className="flex-1 bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => { setTab('offer'); setOfferAmount('') }}
                                                disabled={sending}
                                                className="flex-1 bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                                            >
                                                Counter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    // ACCEPTED message
                    if (msg.message_type === 'ACCEPTED') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center">
                                    <p className="text-xs font-semibold text-emerald-400">✅ {msg.content}</p>
                                </div>
                            </div>
                        )
                    }

                    // REJECTED message
                    if (msg.message_type === 'REJECTED') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center">
                                    <p className="text-xs font-semibold text-red-400">❌ {msg.content}</p>
                                </div>
                            </div>
                        )
                    }

                    // Regular TEXT message
                    const isMine = msg.sender_id === user?.sovereign_id
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

            {/* ── Error ──────────────────────────────────── */}
            {error && (
                <div className="mx-4 mb-2 flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-red-400 font-inter">{error}</p>
                    <button onClick={() => setError('')}><X className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
            )}

            {/* ── Bottom Input Area ──────────────────────── */}
            {!isBooked && !isClosed && !bookingResult && (
                <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#080808]">

                    {/* Tab switcher — shipper only, hidden once price is agreed */}
                    {isShipper && !conv.agreed_price && (
                        <div className="flex border-b border-white/[0.04]">
                            <button
                                onClick={() => setTab('chat')}
                                className={`flex-1 py-3 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                                    tab === 'chat' ? 'text-white border-b-2 border-white' : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setTab('offer')}
                                className={`flex-1 py-3 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                                    tab === 'offer' ? 'text-white border-b-2 border-white' : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                            >
                                Make Offer
                            </button>
                        </div>
                    )}

                    {/* CHAT tab */}
                    {(tab === 'chat' || !isShipper) && (
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
                    )}

                    {/* MAKE OFFER tab (shipper only) */}
                    {tab === 'offer' && isShipper && (
                        <div className="px-4 py-4 space-y-4">
                            {/* Quick-select price chips */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {getOfferChips().map(price => (
                                    <button
                                        key={price}
                                        onClick={() => setOfferAmount(String(price))}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-semibold font-mono tracking-wider transition-all ${
                                            offerAmount === String(price)
                                                ? 'bg-white text-black border-white'
                                                : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        {price.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            {/* Big price input */}
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-500 text-sm font-bold font-mono">{conv.currency}</span>
                                <input
                                    type="number"
                                    value={offerAmount}
                                    onChange={e => setOfferAmount(e.target.value)}
                                    className="flex-1 bg-transparent text-3xl font-semibold font-mono text-white outline-none border-b border-white/10 focus:border-white/30 transition-colors pb-1"
                                    placeholder={String(Math.floor(conv.original_price * 0.9))}
                                />
                            </div>

                            {/* Feedback indicator */}
                            {offerAmount && (() => {
                                const fb = getOfferFeedback()
                                if (!fb) return null
                                return (
                                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${fb.bg}`}>
                                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${fb.color}`} />
                                        <p className={`text-[10px] font-bold font-inter ${fb.color}`}>{fb.text}</p>
                                    </div>
                                )
                            })()}

                            {/* Send Offer button */}
                            <button
                                onClick={sendOffer}
                                disabled={sending || !offerAmount}
                                className="w-full bg-white text-black text-xs font-semibold uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Offer'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Closed — inputs disabled */}
            {(isBooked || isClosed || bookingResult) && (
                <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-4 bg-[#080808] text-center">
                    <p className="text-xs text-zinc-600 font-inter">
                        {isBooked || bookingResult ? 'This conversation is closed — booking confirmed.' : 'This deal has been closed by both parties.'}
                    </p>
                </div>
            )}
        </div>
    )
}
