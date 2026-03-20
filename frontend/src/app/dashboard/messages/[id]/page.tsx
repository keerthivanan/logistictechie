'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import { Loader2, Send, CheckCircle2, X, ArrowLeft } from 'lucide-react'

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
    shipper_close_req: boolean
    forwarder_close_req: boolean
}

type Tab = 'chat' | 'offer'

export default function ChatPage() {
    const { id } = useParams<{ id: string }>()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [conv, setConv] = useState<ConvMeta | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
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
        } catch {
            // silent poll failure
        } finally {
            setLoading(false)
        }
    }, [id])

    // Initial load + 1-second polling
    useEffect(() => {
        if (authLoading || !user) return
        fetchMessages()
        const interval = setInterval(fetchMessages, 1000)
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

    // OLX-style offer chips: 0%, -5%, -10%, -15%, -20%
    const getOfferChips = () => {
        if (!conv) return []
        const floor = conv.original_price * 0.80
        return [
            { label: 'Quoted', value: conv.original_price, pct: 0 },
            { label: '-5%', value: Math.floor(conv.original_price * 0.95), pct: 5 },
            { label: '-10%', value: Math.floor(conv.original_price * 0.90), pct: 10 },
            { label: '-15%', value: Math.floor(conv.original_price * 0.85), pct: 15 },
            { label: '-20%', value: Math.ceil(floor), pct: 20 },
        ]
    }

    const getOfferFeedback = () => {
        if (!conv || !offerAmount) return null
        const amount = parseFloat(offerAmount)
        const floor = conv.original_price * 0.80
        if (isNaN(amount) || amount < floor) return { text: 'Too low — minimum is ' + conv.currency + ' ' + Math.ceil(floor).toLocaleString(), color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' }
        const pct = ((conv.original_price - amount) / conv.original_price) * 100
        if (pct <= 5) return { text: 'Very likely to be accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
        if (pct <= 12) return { text: 'Good offer — forwarder may accept', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' }
        return { text: 'Fair offer — forwarder may counter', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
    }

    const isBooked = conv?.status === 'BOOKED'
    const isClosed = conv?.status === 'CLOSED'
    const hasPendingOffer = !!conv?.current_offer && !conv?.agreed_price
    const activePriceLabel = conv?.agreed_price ? 'Agreed' : conv?.current_offer ? 'Counter Offer' : 'Quoted'
    const activePrice = conv?.agreed_price ?? conv?.current_offer ?? conv?.original_price

    // Close deal state (shipper perspective)
    const iAlreadyRequestedClose = conv?.shipper_close_req ?? false
    const otherRequestedClose = conv?.forwarder_close_req ?? false

    if (loading || authLoading) {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
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
                        <span className="text-sm font-black text-white font-outfit truncate">{conv.forwarder_company}</span>
                    </div>
                    <p className="text-[10px] text-zinc-700 font-mono mt-0.5">{conv.request_id}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0 ${
                    isBooked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-zinc-500'
                }`}>
                    {isBooked ? 'Booked' : 'Open'}
                </span>
            </div>

            {/* ── Price Bar ──────────────────────────────── */}
            <div className="px-4 py-3 border-b border-white/[0.04] bg-[#080808] flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{activePriceLabel}</p>
                        <p className={`text-xl font-black font-mono leading-tight ${conv.agreed_price ? 'text-emerald-400' : conv.current_offer ? 'text-amber-400' : 'text-white'}`}>
                            {conv.currency} {Number(activePrice).toLocaleString()}
                        </p>
                        {conv.current_offer && !conv.agreed_price && (
                            <p className="text-[9px] text-zinc-600 font-inter">
                                Original: {conv.currency} {Number(conv.original_price).toLocaleString()}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Confirm Booking — shipper only, OPEN, no pending offer */}
                        {isShipper && !isBooked && !isClosed && !hasPendingOffer && !bookingResult && (
                            <button
                                onClick={confirmBooking}
                                disabled={sending}
                                className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Booking'}
                            </button>
                        )}

                        {/* Close Deal — shipper only, OPEN */}
                        {isShipper && !isBooked && !isClosed && !bookingResult && (
                            iAlreadyRequestedClose ? (
                                <span className="text-[9px] text-zinc-600 italic">Waiting for forwarder to confirm close...</span>
                            ) : otherRequestedClose ? (
                                <button
                                    onClick={closeDeal}
                                    disabled={closingDeal}
                                    className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-amber-400 transition-all animate-pulse disabled:opacity-50"
                                >
                                    Forwarder wants to close. Confirm?
                                </button>
                            ) : (
                                <button
                                    onClick={closeDeal}
                                    disabled={closingDeal}
                                    className="bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
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
                        <p className="text-xs font-black text-emerald-400">✅ Booking Confirmed — {bookingResult.reference}</p>
                        <p className="text-[10px] text-emerald-300/70 mt-0.5">Forwarder: {bookingResult.forwarder_email}</p>
                    </div>
                )}

                {/* Deal closed banner (off-platform close, not booking) */}
                {isClosed && !isBooked && !bookingResult && (
                    <div className="mt-3 bg-zinc-800/60 border border-white/5 rounded-xl px-4 py-3">
                        <p className="text-xs font-black text-zinc-400">Deal closed by both parties. This conversation is archived.</p>
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

                    // OFFER message (special card)
                    if (msg.message_type === 'OFFER') {
                        const isMyOffer = msg.sender_id === user?.sovereign_id
                        const isPending = hasPendingOffer && msg.id === Math.max(...messages.filter(m => m.message_type === 'OFFER').map(m => m.id))
                        return (
                            <div key={msg.id} className={`flex ${isMyOffer ? 'justify-end' : 'justify-start'}`}>
                                <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 max-w-[260px]">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Counter Offer</p>
                                    <p className="text-2xl font-black font-mono text-white">
                                        {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-zinc-600 font-inter mt-1">
                                        {isMyOffer ? 'Sent by you' : `From ${conv.forwarder_company}`}
                                    </p>

                                    {/* Forwarder sees Accept/Reject on the latest pending offer */}
                                    {!isMyOffer && !isShipper && isPending && !isBooked && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => respondOffer('ACCEPT')}
                                                disabled={sending}
                                                className="flex-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => respondOffer('REJECT')}
                                                disabled={sending}
                                                className="flex-1 bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                                            >
                                                Reject
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
                                    <p className="text-xs font-black text-emerald-400">✅ {msg.content}</p>
                                </div>
                            </div>
                        )
                    }

                    // REJECTED message
                    if (msg.message_type === 'REJECTED') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center">
                                    <p className="text-xs font-black text-red-400">❌ {msg.content}</p>
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

                    {/* Tab switcher — shipper only */}
                    {isShipper && (
                        <div className="flex border-b border-white/[0.04]">
                            <button
                                onClick={() => setTab('chat')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    tab === 'chat' ? 'text-white border-b-2 border-white' : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setTab('offer')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
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
                            {/* Quick-select chips */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {getOfferChips().map(chip => (
                                    <button
                                        key={chip.pct}
                                        onClick={() => setOfferAmount(String(chip.value))}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                                            offerAmount === String(chip.value)
                                                ? 'bg-white text-black border-white'
                                                : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        {chip.pct === 0 ? 'Original' : chip.label} · {conv.currency} {chip.value.toLocaleString()}
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
                                    className="flex-1 bg-transparent text-3xl font-black font-mono text-white outline-none border-b border-white/10 focus:border-white/30 transition-colors pb-1"
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
                                className="w-full bg-white text-black text-xs font-black uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
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
