'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/config'
import { Loader2, Send, ArrowLeft, X, BarChart3, ArrowRight } from 'lucide-react'

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

export default function ForwarderChatPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    // Portal auth state
    const [fwdId, setFwdId] = useState('')
    const [fwdEmail, setFwdEmail] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)
    const [authError, setAuthError] = useState('')

    // Chat state
    const [conv, setConv] = useState<ConvMeta | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const [closingDeal, setClosingDeal] = useState(false)
    const [error, setError] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

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
                `/api/forwarders/conversations/${id}/messages?forwarder_id=${encodeURIComponent(fwdId)}&email=${encodeURIComponent(fwdEmail)}`
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
        const interval = setInterval(fetchMessages, 1000)
        return () => clearInterval(interval)
    }, [isAuthenticated, fetchMessages, fwdId, fwdEmail])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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
        try {
            await apiFetch(`/api/forwarders/conversations/${id}/respond-offer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forwarder_id: fwdId, email: fwdEmail, action }),
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
    const hasPendingOffer = !!conv?.current_offer && !conv?.agreed_price
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
            <div className="h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
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
                        <span className="text-sm font-black text-white font-outfit truncate">{conv.forwarder_company}</span>
                        <span className="text-zinc-700">↔</span>
                        <span className="text-xs font-mono text-zinc-600 truncate">Shipper</span>
                    </div>
                    <p className="text-[10px] text-zinc-700 font-mono mt-0.5">{conv.request_id}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0 ${
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
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{activePriceLabel}</p>
                        <p className={`text-xl font-black font-mono leading-tight ${
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
                                    className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-amber-400 transition-all animate-pulse disabled:opacity-50"
                                >
                                    Shipper wants to close. Confirm?
                                </button>
                            ) : (
                                <button
                                    onClick={closeDeal}
                                    disabled={closingDeal}
                                    className="bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
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
                        <p className="text-xs font-black text-zinc-400">Deal closed. This conversation is archived.</p>
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
                        const isPending = hasPendingOffer && msg.id === Math.max(...messages.filter(m => m.message_type === 'OFFER').map(m => m.id))
                        return (
                            <div key={msg.id} className="flex justify-start">
                                <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 max-w-[260px]">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Counter Offer from Shipper</p>
                                    <p className="text-2xl font-black font-mono text-white">
                                        {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                    </p>

                                    {isPending && !isBooked && !isClosed && (
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

                    if (msg.message_type === 'ACCEPTED') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center">
                                    <p className="text-xs font-black text-emerald-400">✅ {msg.content}</p>
                                </div>
                            </div>
                        )
                    }

                    if (msg.message_type === 'REJECTED') {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center">
                                    <p className="text-xs font-black text-red-400">❌ {msg.content}</p>
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
