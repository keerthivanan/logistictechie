'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Send, ArrowLeft, X, MessageSquare, Lock, Ship, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useT, TKey } from '@/lib/i18n/t'

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

function lastSeenLabel(isoString: string | null, t: (key: TKey) => string): string {
    if (!isoString) return t('chat.not.yet.active')
    const diff = Math.floor((Date.now() - new Date(isoString + 'Z').getTime()) / 1000)
    if (diff < 120) return t('chat.online.now')
    if (diff < 3600) return t('chat.last.seen.m').replace('{n}', String(Math.floor(diff / 60)))
    if (diff < 86400) return t('chat.last.seen.h').replace('{n}', String(Math.floor(diff / 3600)))
    return t('chat.last.seen.d').replace('{n}', String(Math.floor(diff / 86400)))
}

const CONV_CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'JPY', 'CNY', 'SGD', 'INR', 'AUD', 'CAD', 'CHF', 'TRY', 'EGP', 'NZD', 'HKD']

export default function ForwarderDashboardChatPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const t = useT()

    const [fwdId, setFwdId] = useState('')
    const [fwdEmail, setFwdEmail] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)

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
    const containerRef = useRef<HTMLDivElement>(null)
    const prevCountRef = useRef(0)
    const isInitialRef = useRef(true)

    const [convTo, setConvTo] = useState('EUR')
    const [convResult, setConvResult] = useState<string | null>(null)
    const [convLoading, setConvLoading] = useState(false)

    // Load credentials from localStorage — redirect if missing
    useEffect(() => {
        const storedId = localStorage.getItem('cl_fwd_id')
        const storedEmail = localStorage.getItem('cl_fwd_email')
        if (storedId && storedEmail) {
            setFwdId(storedId)
            setFwdEmail(storedEmail)
            setIsAuthenticated(true)
        } else {
            router.replace('/dashboard/messages')
        }
    }, [router])

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
                    router.replace('/dashboard/messages')
                }
                return
            }
            const data = await res.json()
            setConv(data.conversation)
            setMessages(data.messages)
            try {
                sessionStorage.setItem(`fwd_conv_${id}`, JSON.stringify(data.conversation))
                sessionStorage.setItem(`fwd_msgs_${id}`, JSON.stringify(data.messages))
            } catch {}
        } catch {}
        finally { setLoading(false) }
    }, [id, fwdId, fwdEmail, router])

    useEffect(() => {
        if (!isAuthenticated || !fwdId || !fwdEmail) return
        setLoading(true)
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [isAuthenticated, fetchMessages, fwdId, fwdEmail])

    // Smart auto-scroll
    useEffect(() => {
        const newCount = messages.length
        const el = containerRef.current
        if (isInitialRef.current && newCount > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'instant' })
            isInitialRef.current = false
        } else if (newCount > prevCountRef.current && el) {
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
            if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
        prevCountRef.current = newCount
    }, [messages])

    // Auto-switch convTo if it matches deal currency
    useEffect(() => {
        if (!conv?.currency) return
        if (convTo === conv.currency) {
            const fallback = CONV_CURRENCIES.find(c => c !== conv.currency) ?? 'USD'
            setConvTo(fallback)
        }
    }, [conv?.currency])

    // Currency conversion
    useEffect(() => {
        const price = conv?.agreed_price ?? conv?.current_offer ?? conv?.original_price
        if (!conv || !price) { setConvResult(null); return }
        if (convTo === conv.currency) {
            setConvResult(Number(price).toLocaleString(undefined, { maximumFractionDigits: 2 }))
            return
        }
        const controller = new AbortController()
        setConvResult(null)
        setConvLoading(true)
        fetch(`https://open.er-api.com/v6/latest/${conv.currency}`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                const rate = data.rates?.[convTo]
                setConvResult(rate != null
                    ? Number(rate * price).toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : null)
            })
            .catch(() => {})
            .finally(() => setConvLoading(false))
        return () => controller.abort()
    }, [conv?.agreed_price, conv?.current_offer, conv?.original_price, convTo, conv?.currency])

    const sendText = async () => {
        if (!text.trim() || sending) return
        setSending(true); setError('')
        try {
            await apiFetch(`/api/forwarders/conversations/${id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail },
                body: JSON.stringify({ content: text.trim() }),
            })
            setText('')
        } catch { setError(t('chat.send.failed')) }
        finally { setSending(false) }
    }

    const respondOffer = async (action: 'ACCEPT' | 'REJECT') => {
        setSending(true); setError('')
        try {
            const res = await apiFetch(`/api/forwarders/conversations/${id}/respond-offer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail },
                body: JSON.stringify({ action }),
            })
            if (!res.ok) { const data = await res.json(); setError(data.detail || t('chat.action.failed')) }
        } catch { setError(t('chat.request.failed')) }
        finally { setSending(false) }
    }

    const sendCounter = async () => {
        const amount = parseFloat(counterAmount)
        if (isNaN(amount) || amount <= 0 || !conv) return
        setSending(true); setError('')
        try {
            const res = await apiFetch(`/api/forwarders/conversations/${id}/respond-offer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail },
                body: JSON.stringify({ action: 'COUNTER', counter_amount: amount }),
            })
            if (res.ok) { setShowCounterInput(false); setCounterAmount('') }
            else { const data = await res.json(); setError(data.detail || t('chat.counter.failed')) }
        } catch { setError(t('chat.counter.failed')) }
        finally { setSending(false) }
    }

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

    const confirmBooking = async () => {
        if (sending) return
        setSending(true); setError('')
        try {
            const res = await apiFetch(`/api/forwarders/conversations/${id}/confirm-booking`, {
                method: 'POST',
                headers: { 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail },
            })
            if (!res.ok) { const data = await res.json(); setError(data.detail || 'Booking confirmation failed.') }
        } catch { setError('Booking confirmation failed.') }
        finally { setSending(false) }
    }

    const closeDeal = async () => {
        if (closingDeal) return
        setClosingDeal(true); setError('')
        try {
            const res = await apiFetch(`/api/forwarders/conversations/${id}/close`, {
                method: 'POST',
                headers: { 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail },
            })
            if (!res.ok) { const data = await res.json(); setError(data.detail || t('chat.close.failed')) }
        } catch { setError(t('chat.close.deal.failed')) }
        finally { setClosingDeal(false) }
    }

    const isLocked = conv?.status === 'BOOKED'
    const isClosed = conv?.status === 'CLOSED'
    const shipperWaiting = conv?.offer_side === 'SHIPPER'
    const activePriceLabel = conv?.agreed_price ? 'Agreed Price' : conv?.current_offer ? 'Counter Offer' : 'Quoted Price'
    const activePrice = conv?.agreed_price ?? conv?.current_offer ?? conv?.original_price
    const iAlreadyRequested = conv?.forwarder_close_req ?? false
    const otherRequested = conv?.shipper_close_req ?? false
    const shipperInitials = 'SH'
    const isShipperOnline = conv?.shipper_last_seen
        ? (Date.now() - new Date(conv.shipper_last_seen + 'Z').getTime()) < 120000
        : false

    if (loading && !conv) return (
        <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
        </div>
    )
    if (!conv) return (
        <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
            {t('chat.not.found')}
        </div>
    )

    return (
        <div className="h-full bg-[#0a0a0a] border border-white/[0.05] rounded-2xl overflow-hidden flex">

            {/* ── LEFT: Chat Column ── */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.05]">

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-[#0d0d0d] flex-shrink-0">
                    <button onClick={() => router.push('/dashboard/messages')}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors flex-shrink-0">
                        <ArrowLeft className="w-4 h-4 text-zinc-500" />
                    </button>

                    {/* Shipper avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center text-xs font-bold font-outfit">
                            {shipperInitials}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0d0d0d] ${isShipperOnline ? 'bg-white' : 'bg-zinc-700'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white font-outfit truncate">{t('chat.shipper')}</p>
                        <p className="text-[10px] text-zinc-600 font-mono">{lastSeenLabel(conv.shipper_last_seen, t)}</p>
                    </div>

                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0 ${
                        isLocked ? 'bg-white/[0.08] text-white border border-white/20'
                        : isClosed ? 'bg-zinc-900 text-zinc-600 border border-white/[0.06]'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                    }`}>
                        {isLocked ? <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Locked</span> : isClosed ? t('chat.closed') : 'Negotiating'}
                    </span>
                </div>

                {/* Messages */}
                <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3 min-h-0">

                    <div className="flex-1" />

                    {messages.filter(m => m.message_type !== 'SYSTEM').length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white font-outfit uppercase mb-1">Awaiting Messages</p>
                                <p className="text-[11px] text-zinc-600 max-w-[200px] leading-relaxed">The shipper will message you here to begin negotiating</p>
                            </div>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {

                            if (msg.message_type === 'SYSTEM') return (
                                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                    <p className="text-[10px] text-zinc-600 font-inter italic text-center max-w-sm bg-white/[0.02] px-4 py-2.5 rounded-2xl border border-white/[0.04] leading-relaxed">
                                        {msg.content}
                                    </p>
                                </motion.div>
                            )

                            if (msg.message_type === 'OFFER') {
                                const latestOfferId = Math.max(...messages.filter(m => m.message_type === 'OFFER').map(m => m.id))
                                const isActivePending = shipperWaiting && msg.id === latestOfferId
                                return (
                                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                        <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-4 max-w-[300px]">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <TrendingUp className="w-3 h-3 text-zinc-500" />
                                                <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">{t('chat.shipper.offer')}</p>
                                            </div>
                                            <p className="text-2xl font-semibold font-mono text-white">
                                                {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                            </p>
                                            <p className="text-[9px] text-zinc-600 mt-1">
                                                Original: {conv.currency} {Number(conv.original_price).toLocaleString()}
                                            </p>

                                            {isActivePending && !isLocked && !isClosed && !showCounterInput && (
                                                <div className="flex gap-2 mt-3">
                                                    <button onClick={() => respondOffer('ACCEPT')} disabled={sending}
                                                        className="flex-1 bg-white text-black text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-zinc-100 transition-all disabled:opacity-50">
                                                        {t('chat.accept')}
                                                    </button>
                                                    <button onClick={() => setShowCounterInput(true)} disabled={sending}
                                                        className="flex-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50">
                                                        {t('chat.counter')}
                                                    </button>
                                                    <button onClick={() => respondOffer('REJECT')} disabled={sending}
                                                        className="flex-1 bg-white/[0.04] border border-white/[0.08] text-zinc-500 text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-white/[0.08] transition-all disabled:opacity-50">
                                                        {t('chat.reject')}
                                                    </button>
                                                </div>
                                            )}

                                            {isActivePending && !isLocked && !isClosed && showCounterInput && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-widest">{t('chat.your.counter.price')}</p>
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {getCounterChips().map(p => (
                                                            <button key={p} onClick={() => setCounterAmount(String(p))}
                                                                className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold font-mono transition-all ${
                                                                    counterAmount === String(p)
                                                                        ? 'bg-white text-black border-white'
                                                                        : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                                                                }`}>
                                                                {p.toLocaleString()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-zinc-500 text-xs font-mono">{conv.currency}</span>
                                                        <input type="number" value={counterAmount} onChange={e => setCounterAmount(e.target.value)}
                                                            placeholder={String(Math.round(((conv.current_offer ?? conv.original_price) + conv.original_price) / 2))}
                                                            className="flex-1 bg-transparent text-xl font-semibold font-mono text-white outline-none border-b border-white/10 focus:border-white/30 transition-colors pb-0.5" />
                                                    </div>
                                                    <div className="flex gap-2 pt-1">
                                                        <button onClick={sendCounter} disabled={sending || !counterAmount}
                                                            className="flex-1 bg-white text-black text-[10px] font-semibold uppercase tracking-widest py-2 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-30">
                                                            {t('chat.send.counter')}
                                                        </button>
                                                        <button onClick={() => { setShowCounterInput(false); setCounterAmount('') }}
                                                            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-zinc-500 text-[10px] font-semibold rounded-xl hover:bg-white/[0.08] transition-all">
                                                            {t('chat.cancel')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            }

                            if (msg.message_type === 'COUNTER_OFFER') return (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                                    <div className="bg-[#0d0d0d] border border-amber-500/20 rounded-2xl p-4 max-w-[260px]">
                                        <p className="text-[9px] font-semibold text-amber-400 uppercase tracking-widest mb-2">{t('chat.your.counter')}</p>
                                        <p className="text-2xl font-semibold font-mono text-white">
                                            {conv.currency} {Number(msg.offer_amount).toLocaleString()}
                                        </p>
                                        <p className="text-[9px] text-zinc-600 mt-1">{t('chat.waiting.resp')}</p>
                                    </div>
                                </motion.div>
                            )

                            if (msg.message_type === 'ACCEPTED') return (
                                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3 text-center">
                                        <p className="text-xs font-semibold text-white flex items-center justify-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />{msg.content}</p>
                                    </div>
                                </motion.div>
                            )

                            if (msg.message_type === 'REJECTED') return (
                                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-center">
                                        <p className="text-xs font-semibold text-red-400 flex items-center justify-center gap-1.5"><X className="w-3.5 h-3.5 flex-shrink-0" />{msg.content}</p>
                                    </div>
                                </motion.div>
                            )

                            const isMine = msg.sender_role === 'FORWARDER'
                            return (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    {!isMine && (
                                        <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 flex items-center justify-center text-[8px] font-bold flex-shrink-0 mb-0.5">
                                            {shipperInitials}
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

                {/* Input */}
                {!isLocked && !isClosed ? (
                    <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#0d0d0d]">
                        <div className="flex items-center gap-3 px-5 py-3">
                            <input type="text" value={text} onChange={e => setText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() } }}
                                placeholder={t('chat.type.message')}
                                className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-white/15 transition-colors" />
                            <button onClick={sendText} disabled={!text.trim() || sending}
                                className="w-11 h-11 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-30 flex-shrink-0">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 border-t border-white/[0.06] px-5 py-4 bg-[#0d0d0d] text-center">
                        <p className="text-xs text-zinc-600">
                            {isLocked ? t('chat.booking.confirmed') : t('chat.deal.closed')}
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
                            <p className={`text-3xl font-semibold font-mono mt-0.5 ${conv.agreed_price ? 'text-white' : conv.current_offer ? 'text-amber-400' : 'text-white'}`}>
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
                                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Shipper</span>
                                <span className={`text-[9px] font-semibold ${conv.shipper_book_req ? 'text-white' : 'text-zinc-600'}`}>
                                    {conv.shipper_book_req ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Ready to lock</span> : 'Negotiating'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">You</span>
                                <span className={`text-[9px] font-semibold ${conv.forwarder_book_req ? 'text-white' : 'text-zinc-600'}`}>
                                    {conv.forwarder_book_req ? '✓ Ready to lock' : 'Negotiating'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Currency converter */}
                    <div className="mt-3 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl px-4 py-3">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Convert</p>
                        <div className="flex items-center gap-2">
                            <select value={convTo} onChange={e => setConvTo(e.target.value)}
                                className="bg-white/[0.04] border border-white/[0.08] rounded-lg text-[10px] text-zinc-400 px-2 py-1.5 outline-none cursor-pointer flex-shrink-0">
                                {CONV_CURRENCIES.filter(c => c !== conv.currency).map(c => (
                                    <option key={c} value={c} className="bg-black">{c}</option>
                                ))}
                            </select>
                            <span className="text-sm font-semibold font-mono text-white">
                                {convLoading ? <Loader2 className="w-3 h-3 animate-spin text-zinc-600" /> : convResult ? `${convTo} ${convResult}` : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Locked banner */}
                {isLocked && (
                    <div className="mx-5 mt-4 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-3.5 h-3.5 text-white" />
                            <p className="text-xs font-semibold text-white">Deal Locked</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">Contact details have been shared. Check your email.</p>
                    </div>
                )}

                {/* Actions */}
                {!isLocked && !isClosed && (
                    <div className="p-5 space-y-3">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Actions</p>

                        {/* Confirm booking */}
                        {!shipperWaiting && (
                            conv.forwarder_book_req && !conv.shipper_book_req ? (
                                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 text-center">
                                    <p className="text-[10px] text-zinc-500 animate-pulse">Waiting for shipper to lock...</p>
                                </div>
                            ) : conv.shipper_book_req && !conv.forwarder_book_req ? (
                                <button onClick={confirmBooking} disabled={sending}
                                    className="w-full bg-amber-500 text-black text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 animate-pulse flex items-center justify-center gap-2">
                                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Lock className="w-3.5 h-3.5" /> Shipper confirmed — Lock Deal</>}
                                </button>
                            ) : (
                                <button onClick={confirmBooking} disabled={sending}
                                    className="w-full bg-white text-black text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Lock className="w-3.5 h-3.5" /> Confirm Deal</>}
                                </button>
                            )
                        )}

                        {/* Close deal */}
                        {iAlreadyRequested ? (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 text-center">
                                <p className="text-[10px] text-zinc-600 italic">{t('chat.waiting.shipper')}</p>
                            </div>
                        ) : otherRequested ? (
                            <button onClick={closeDeal} disabled={closingDeal}
                                className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-amber-500/20 transition-all animate-pulse disabled:opacity-50">
                                {closingDeal ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : t('chat.shipper.wants.close')}
                            </button>
                        ) : (
                            <button onClick={closeDeal} disabled={closingDeal}
                                className="w-full bg-white/[0.04] border border-white/[0.06] text-zinc-500 text-[10px] font-semibold uppercase tracking-widest px-4 py-3 rounded-2xl hover:bg-white/[0.07] hover:text-zinc-300 transition-all disabled:opacity-50">
                                {closingDeal ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : t('chat.close.deal')}
                            </button>
                        )}
                    </div>
                )}

                {/* Request info */}
                <div className="p-5 mt-auto border-t border-white/[0.05]">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-3">Request</p>
                    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-4">
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
