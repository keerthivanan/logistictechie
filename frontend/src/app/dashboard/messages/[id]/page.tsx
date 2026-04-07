'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Send, CheckCircle2, X, ArrowLeft, Ship, TrendingDown, Lock, MessageSquare } from 'lucide-react'
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
    if (diff < 120) return 'Online now'
    if (diff < 3600) return `Last seen ${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)}h ago`
    return `Last seen ${Math.floor(diff / 86400)}d ago`
}

type Tab = 'chat' | 'offer'

export default function ChatPage() {
    const { id } = useParams<{ id: string }>()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

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
    const [dealLocked, setDealLocked] = useState(false)
    const [closingDeal, setClosingDeal] = useState(false)
    const [error, setError] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    const isShipper = user?.role !== 'forwarder'

    useEffect(() => {
        if (!authLoading && user?.role === 'forwarder') {
            const fwdId = user.forwarder_id || user.sovereign_id
            if (fwdId) localStorage.setItem('cl_fwd_id', fwdId)
            if (user.email) localStorage.setItem('cl_fwd_email', user.email)
            router.replace(`/forwarders/chat/${id}`)
        }
    }, [authLoading, user, id, router])

    const fetchMessages = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.status === 401) { router.push('/login?returnUrl=' + encodeURIComponent('/dashboard/messages/' + id)); return }
            if (!res.ok) return
            const data = await res.json()
            setConv(data.conversation)
            setMessages(data.messages)
            try {
                sessionStorage.setItem(`chat_conv_${id}`, JSON.stringify(data.conversation))
                sessionStorage.setItem(`chat_msgs_${id}`, JSON.stringify(data.messages))
            } catch {}
        } catch {}
        finally { setLoading(false) }
    }, [id])

    useEffect(() => {
        if (authLoading || !user) return
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [fetchMessages, authLoading, user])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (tab === 'offer' && conv && !offerAmount) {
            setOfferAmount(String(Math.floor(conv.original_price * 0.9)))
        }
    }, [tab, conv, offerAmount])

    const sendText = async () => {
        if (!text.trim() || sending) return
        setSending(true); setError('')
        try {
            const token = localStorage.getItem('token')
            await apiFetch(`/api/conversations/${id}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text.trim() }),
            })
            setText('')
        } catch { setError('Failed to send.') }
        finally { setSending(false) }
    }

    const sendOffer = async () => {
        if (!offerAmount || sending) return
        const amount = parseFloat(offerAmount)
        if (isNaN(amount) || amount <= 0) return
        setSending(true); setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/offer`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer_amount: amount }),
            })
            const data = await res.json()
            if (!res.ok) setError(data.detail || 'Offer failed.')
            else { setTab('chat'); setOfferAmount('') }
        } catch { setError('Failed to send offer.') }
        finally { setSending(false) }
    }

    const closeDeal = async () => {
        if (closingDeal) return
        setClosingDeal(true); setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/close`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) { const data = await res.json(); setError(data.detail || 'Could not close deal.') }
        } catch { setError('Failed to close deal.') }
        finally { setClosingDeal(false) }
    }

    const acceptCounter = async () => {
        if (sending) return
        setSending(true); setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/accept-counter`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) { const data = await res.json(); setError(data.detail || 'Failed to accept counter.') }
        } catch { setError('Failed to accept counter.') }
        finally { setSending(false) }
    }

    const confirmBooking = async () => {
        if (sending) return
        setSending(true); setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch(`/api/conversations/${id}/confirm-booking`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (res.ok && data.status === 'LOCKED') setDealLocked(true)
            else if (!res.ok) setError(data.detail || 'Failed to lock deal.')
        } catch { setError('Failed to lock deal.') }
        finally { setSending(false) }
    }

    const getPriceStep = (price: number) => {
        const raw = price * 0.01
        const mag = Math.pow(10, Math.floor(Math.log10(raw)))
        const n = raw / mag
        const nice = n < 1.5 ? 1 : n < 3.5 ? 2.5 : n < 7.5 ? 5 : 10
        return nice * mag
    }

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

    const isLocked = conv?.status === 'BOOKED' || dealLocked
    const isClosed = conv?.status === 'CLOSED'
    const hasPendingOffer = !!conv?.current_offer && !conv?.agreed_price
    const forwarderCountered = conv?.offer_side === 'FORWARDER'
    const activePriceLabel = conv?.agreed_price ? 'Agreed Price' : conv?.current_offer ? 'Counter Offer' : 'Quoted Price'
    const activePrice = conv?.agreed_price ?? conv?.current_offer ?? conv?.original_price
    const iAlreadyRequestedClose = conv?.shipper_close_req ?? false
    const otherRequestedClose = conv?.forwarder_close_req ?? false
    const fwdInitials = conv?.forwarder_company?.slice(0, 2).toUpperCase() || '??'
    const isOnline = conv?.forwarder_last_seen
        ? (Date.now() - new Date(conv.forwarder_last_seen + 'Z').getTime()) < 120000
        : false

    if ((loading || authLoading) && !conv) return <FullPageSpinner />
    if (!conv) return (
        <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
            Conversation not found.
        </div>
    )

    return (
        <div className="h-full bg-[#0a0a0a] border border-white/[0.05] rounded-2xl overflow-hidden flex">

            {/* ── LEFT: Chat Column ── */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.05]">

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-[#0d0d0d] flex-shrink-0">
                    <button
                        onClick={() => router.push('/dashboard/messages')}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-zinc-500" />
                    </button>

                    {/* Forwarder avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center text-xs font-bold font-outfit">
                            {fwdInitials}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0d0d0d] ${isOnline ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white font-outfit truncate">{conv.forwarder_company}</p>
                        <p className="text-[10px] text-zinc-600 font-mono">{lastSeenLabel(conv.forwarder_last_seen)}</p>
                    </div>

                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0 ${
                        isLocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isClosed ? 'bg-zinc-900 text-zinc-600 border border-white/[0.06]'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                    }`}>
                        {isLocked ? '🔒 Locked' : isClosed ? 'Closed' : 'Negotiating'}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col justify-end gap-3 min-h-0">

                    {/* Empty state */}
                    {messages.filter(m => m.message_type !== 'SYSTEM').length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white font-outfit uppercase mb-1">Start Negotiating</p>
                                <p className="text-[11px] text-zinc-600 max-w-[200px] leading-relaxed">Send a message or make an offer to begin the deal</p>
                            </div>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            // SYSTEM
                            if (msg.message_type === 'SYSTEM') return (
                                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                    <p className="text-[10px] text-zinc-600 font-inter italic text-center max-w-sm bg-white/[0.02] px-4 py-2.5 rounded-2xl border border-white/[0.04] leading-relaxed">
                                        {msg.content}
                                    </p>
                                </motion.div>
                            )

                            // OFFER
                            if (msg.message_type === 'OFFER') {
                                const isMyOffer = msg.sender_role === 'shipper'
                                return (
                                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMyOffer ? 'justify-end' : 'justify-start'}`}>
                                        <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-4 max-w-[240px]">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <TrendingDown className="w-3 h-3 text-blue-400" />
                                                <p className="text-[9px] font-semibold text-blue-400 uppercase tracking-widest">Your Offer</p>
                                            </div>
                                            <p className="text-2xl font-semibold font-mono text-white">
                                                {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                            </p>
                                            <p className="text-[9px] text-zinc-600 mt-1">
                                                {isMyOffer ? 'Waiting for forwarder response' : 'Offered by shipper'}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            }

                            // COUNTER_OFFER
                            if (msg.message_type === 'COUNTER_OFFER') {
                                const latestCounterId = Math.max(...messages.filter(m => m.message_type === 'COUNTER_OFFER').map(m => m.id))
                                const isActivePending = forwarderCountered && msg.id === latestCounterId
                                return (
                                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                        <div className="bg-[#0d0d0d] border border-amber-500/20 rounded-2xl p-4 max-w-[260px]">
                                            <p className="text-[9px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Counter Offer</p>
                                            <p className="text-2xl font-semibold font-mono text-white">
                                                {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                            </p>
                                            <p className="text-[9px] text-zinc-600 mt-1">{conv.forwarder_company} wants this price</p>
                                            {isShipper && isActivePending && !isLocked && !isClosed && (
                                                <div className="flex gap-2 mt-3">
                                                    <button onClick={acceptCounter} disabled={sending}
                                                        className="flex-1 bg-white text-black text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-zinc-100 transition-all disabled:opacity-50">
                                                        Accept
                                                    </button>
                                                    <button onClick={() => { setTab('offer'); setOfferAmount('') }} disabled={sending}
                                                        className="flex-1 bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50">
                                                        Counter
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            }

                            // ACCEPTED
                            if (msg.message_type === 'ACCEPTED') return (
                                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3 text-center">
                                        <p className="text-xs font-semibold text-emerald-400">✅ {msg.content}</p>
                                    </div>
                                </motion.div>
                            )

                            // REJECTED
                            if (msg.message_type === 'REJECTED') return (
                                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-center">
                                        <p className="text-xs font-semibold text-red-400">❌ {msg.content}</p>
                                    </div>
                                </motion.div>
                            )

                            // TEXT
                            const isMine = msg.sender_role === 'shipper'
                            return (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    {!isMine && (
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-black flex items-center justify-center text-[8px] font-bold flex-shrink-0 mb-0.5">
                                            {fwdInitials}
                                        </div>
                                    )}
                                    <div className={`max-w-[68%] px-4 py-2.5 rounded-2xl ${
                                        isMine
                                            ? 'bg-white text-black rounded-br-sm'
                                            : 'bg-[#111] border border-white/[0.07] text-white rounded-bl-sm'
                                    }`}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                        <p className={`text-[9px] mt-1 ${isMine ? 'text-black/40' : 'text-zinc-600'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    <div ref={bottomRef} />
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mx-5 mb-2 flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                            <p className="text-xs text-red-400">{error}</p>
                            <button onClick={() => setError('')}><X className="w-3.5 h-3.5 text-red-400" /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input area */}
                {!isLocked && !isClosed ? (
                    <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#0d0d0d]">
                        {isShipper && !conv.agreed_price && (
                            <div className="flex border-b border-white/[0.04]">
                                {(['chat', 'offer'] as Tab[]).map(t => (
                                    <button key={t} onClick={() => setTab(t)}
                                        className={`flex-1 py-3 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                                            tab === t ? 'text-white border-b-2 border-white' : 'text-zinc-600 hover:text-zinc-400'
                                        }`}>
                                        {t === 'chat' ? 'Chat' : 'Make Offer'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {(tab === 'chat' || !isShipper) && (
                            <div className="flex items-center gap-3 px-5 py-3">
                                <input
                                    type="text" value={text} onChange={e => setText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() } }}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-white/15 transition-colors"
                                />
                                <button onClick={sendText} disabled={!text.trim() || sending}
                                    className="w-11 h-11 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-30 flex-shrink-0">
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        )}

                        {tab === 'offer' && isShipper && (
                            <div className="px-5 py-4 space-y-4">
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {getOfferChips().map(price => (
                                        <button key={price} onClick={() => setOfferAmount(String(price))}
                                            className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-semibold font-mono tracking-wider transition-all ${
                                                offerAmount === String(price)
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                                            }`}>
                                            {price.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-500 text-sm font-bold font-mono">{conv.currency}</span>
                                    <input type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)}
                                        className="flex-1 bg-transparent text-3xl font-semibold font-mono text-white outline-none border-b border-white/10 focus:border-white/30 transition-colors pb-1"
                                        placeholder={String(Math.floor(conv.original_price * 0.9))}
                                    />
                                </div>
                                {offerAmount && (() => {
                                    const fb = getOfferFeedback()
                                    if (!fb) return null
                                    return (
                                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${fb.bg}`}>
                                            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${fb.color}`} />
                                            <p className={`text-[10px] font-bold ${fb.color}`}>{fb.text}</p>
                                        </div>
                                    )
                                })()}
                                <button onClick={sendOffer} disabled={sending || !offerAmount}
                                    className="w-full bg-white text-black text-xs font-semibold uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2">
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Offer'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-shrink-0 border-t border-white/[0.06] px-5 py-4 bg-[#0d0d0d] text-center">
                        <p className="text-xs text-zinc-600">
                            {isLocked ? '🔒 Deal locked — contact details sent to your email.' : 'This conversation is closed.'}
                        </p>
                    </div>
                )}
            </div>

            {/* ── RIGHT: Deal Details Panel ── */}
            <div className="w-80 flex-shrink-0 flex flex-col bg-black/20 overflow-y-auto border-l border-white/[0.05]">

                {/* Price card */}
                <div className="p-5 border-b border-white/[0.05]">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-3">Deal Summary</p>

                    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                        <div>
                            <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">{activePriceLabel}</p>
                            <p className={`text-3xl font-semibold font-mono mt-0.5 ${conv.agreed_price ? 'text-emerald-400' : conv.current_offer ? 'text-amber-400' : 'text-white'}`}>
                                {conv.currency} {Number(activePrice).toLocaleString()}
                            </p>
                            {conv.current_offer && !conv.agreed_price && (
                                <p className="text-[10px] text-zinc-600 mt-1">
                                    Original: {conv.currency} {Number(conv.original_price).toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Status rows */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">You</span>
                                <span className={`text-[9px] font-semibold ${conv.shipper_book_req ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                    {conv.shipper_book_req ? '✓ Ready to lock' : 'Negotiating'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{conv.forwarder_company}</span>
                                <span className={`text-[9px] font-semibold ${conv.forwarder_book_req ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                    {conv.forwarder_book_req ? '✓ Ready to lock' : 'Negotiating'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deal locked */}
                {isLocked && (
                    <div className="mx-5 mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <p className="text-xs font-semibold text-emerald-400">Deal Locked</p>
                        </div>
                        <p className="text-[10px] text-emerald-500/70 leading-relaxed">Contact details have been sent to your email.</p>
                    </div>
                )}

                {/* Actions */}
                {isShipper && !isLocked && !isClosed && (
                    <div className="p-5 space-y-3">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Actions</p>

                        {/* Lock deal */}
                        {!hasPendingOffer && (
                            conv.shipper_book_req && !conv.forwarder_book_req ? (
                                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 text-center">
                                    <p className="text-[10px] text-zinc-500 animate-pulse">Waiting for forwarder to lock...</p>
                                </div>
                            ) : conv.forwarder_book_req && !conv.shipper_book_req ? (
                                <button onClick={confirmBooking} disabled={sending}
                                    className="w-full bg-amber-500 text-black text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 animate-pulse flex items-center justify-center gap-2">
                                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Lock className="w-3.5 h-3.5" /> Forwarder confirmed — Lock Deal</>}
                                </button>
                            ) : (
                                <button onClick={confirmBooking} disabled={sending}
                                    className="w-full bg-white text-black text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Lock className="w-3.5 h-3.5" /> Lock Deal</>}
                                </button>
                            )
                        )}

                        {/* Close deal */}
                        {iAlreadyRequestedClose ? (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 text-center">
                                <p className="text-[10px] text-zinc-600 italic">Waiting for forwarder to confirm close...</p>
                            </div>
                        ) : otherRequestedClose ? (
                            <button onClick={closeDeal} disabled={closingDeal}
                                className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-amber-500/20 transition-all animate-pulse disabled:opacity-50">
                                {closingDeal ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Forwarder wants to close — Confirm?'}
                            </button>
                        ) : (
                            <button onClick={closeDeal} disabled={closingDeal}
                                className="w-full bg-white/[0.04] border border-white/[0.06] text-zinc-500 text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-white/[0.07] hover:text-zinc-300 transition-all disabled:opacity-50">
                                {closingDeal ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Close Deal'}
                            </button>
                        )}
                    </div>
                )}

                {/* Request info */}
                <div className="p-5 mt-auto border-t border-white/[0.05]">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-3">Request</p>
                    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Ship className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                            <span className="text-[10px] font-mono text-zinc-500 truncate">{conv.request_id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
