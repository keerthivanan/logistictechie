'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/config'
import { Loader2, Send, ArrowLeft, CheckCircle2, Users } from 'lucide-react'

interface F2FMsg {
    id: number
    sender_id: string
    sender_role: string
    content: string
    is_read: boolean
    created_at: string
}

interface F2FConv {
    public_id: string
    request_public_id: string
    my_role: string
    requester_company: string
    quoter_company: string
    other_company: string
    agreed_price: number | null
    currency: string
    status: string
    requester_confirmed: boolean
    quoter_confirmed: boolean
    other_last_seen: string | null
}

function lastSeenLabel(iso: string | null): string {
    if (!iso) return 'Not yet active'
    const diff = Math.floor((Date.now() - new Date(iso + 'Z').getTime()) / 1000)
    if (diff < 120) return 'Online now'
    if (diff < 3600) return `Last seen ${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)}h ago`
    return `Last seen ${Math.floor(diff / 86400)}d ago`
}

export default function F2FChatPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const [fwdId, setFwdId] = useState('')
    const [fwdEmail, setFwdEmail] = useState('')

    const [conv, setConv] = useState<F2FConv | null>(null)
    const [messages, setMessages] = useState<F2FMsg[]>([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [closing, setClosing] = useState(false)
    const [error, setError] = useState('')

    const bottomRef = useRef<HTMLDivElement>(null)
    const prevCount = useRef(0)

    useEffect(() => {
        const storedId = localStorage.getItem('cl_fwd_id') || ''
        const storedEmail = localStorage.getItem('cl_fwd_email') || ''
        if (!storedId || !storedEmail) {
            setLoading(false)
            router.push('/forwarders/portal')
            return
        }
        setFwdId(storedId)
        setFwdEmail(storedEmail)
    }, [router])

    const fetchMessages = useCallback(async (fi: string, fe: string) => {
        if (!fi || !fe) return
        try {
            const res = await apiFetch(`/api/f2f/conversations/${id}/messages`, {
                headers: { 'X-Forwarder-Id': fi, 'X-Forwarder-Email': fe },
            })
            if (res.ok) {
                const data = await res.json()
                setConv(data.conversation)
                setMessages(data.messages || [])
                setLoading(false)
            } else if (res.status === 401) {
                router.push('/forwarders/portal')
            }
        } catch {
            setLoading(false)
        }
    }, [id, router])

    // Initial fetch once fwdId/fwdEmail are set
    useEffect(() => {
        if (!fwdId || !fwdEmail) return
        fetchMessages(fwdId, fwdEmail)
    }, [fwdId, fwdEmail, fetchMessages])

    // Poll every 3s
    useEffect(() => {
        if (!fwdId || !fwdEmail) return
        const iv = setInterval(() => fetchMessages(fwdId, fwdEmail), 3000)
        return () => clearInterval(iv)
    }, [fwdId, fwdEmail, fetchMessages])

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > prevCount.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
        prevCount.current = messages.length
    }, [messages.length])

    const sendMessage = async () => {
        if (!text.trim() || sending || !fwdId || !fwdEmail) return
        setSending(true)
        setError('')
        try {
            const res = await apiFetch(`/api/f2f/conversations/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Forwarder-Id': fwdId,
                    'X-Forwarder-Email': fwdEmail,
                },
                body: JSON.stringify({ content: text.trim() }),
            })
            if (res.ok) {
                setText('')
                await fetchMessages(fwdId, fwdEmail)
            } else {
                const d = await res.json().catch(() => null)
                setError(d?.detail || 'Failed to send.')
            }
        } catch {
            setError('Network error.')
        } finally {
            setSending(false)
        }
    }

    const confirmDeal = async () => {
        if (confirming || !fwdId || !fwdEmail) return
        setConfirming(true)
        try {
            const res = await apiFetch(`/api/f2f/conversations/${id}/confirm`, {
                method: 'POST',
                headers: { 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail },
            })
            if (res.ok) await fetchMessages(fwdId, fwdEmail)
        } finally {
            setConfirming(false)
        }
    }

    const closeConv = async () => {
        if (closing || !fwdId || !fwdEmail) return
        setClosing(true)
        try {
            const res = await apiFetch(`/api/f2f/conversations/${id}/close`, {
                method: 'POST',
                headers: { 'X-Forwarder-Id': fwdId, 'X-Forwarder-Email': fwdEmail },
            })
            if (res.ok) await fetchMessages(fwdId, fwdEmail)
        } finally {
            setClosing(false)
        }
    }

    if (loading) {
        return (
            <div className="h-screen bg-[#080808] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
            </div>
        )
    }

    if (!conv) {
        return (
            <div className="h-screen bg-[#080808] flex flex-col items-center justify-center text-center gap-4 px-4">
                <p className="text-sm text-zinc-500">Conversation not found or access denied.</p>
                <button onClick={() => router.push('/forwarders/portal')} className="text-xs text-white underline">
                    Back to Portal
                </button>
            </div>
        )
    }

    const myConfirmed = conv.my_role === 'REQUESTER' ? conv.requester_confirmed : conv.quoter_confirmed
    const otherConfirmed = conv.my_role === 'REQUESTER' ? conv.quoter_confirmed : conv.requester_confirmed
    const isOnline = conv.other_last_seen
        ? (Date.now() - new Date(conv.other_last_seen + 'Z').getTime()) < 120000
        : false

    return (
        <div className="h-screen bg-[#080808] text-white flex flex-col">

            {/* Header */}
            <div className="flex-shrink-0 border-b border-white/5 px-4 py-4 flex items-center gap-3">
                <button
                    onClick={() => router.push('/forwarders/portal')}
                    className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-zinc-400" />
                </button>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{conv.other_company}</p>
                        <p className={`text-[10px] font-medium ${isOnline ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {lastSeenLabel(conv.other_last_seen)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.agreed_price && (
                        <div className="text-right">
                            <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Agreed</p>
                            <p className="text-sm font-bold font-mono text-white">
                                {conv.currency} {Number(conv.agreed_price).toLocaleString()}
                            </p>
                        </div>
                    )}
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        conv.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400'
                        : conv.status === 'CLOSED' ? 'bg-zinc-800 text-zinc-500'
                        : 'bg-white/5 text-zinc-400'
                    }`}>
                        {conv.status}
                    </span>
                </div>
            </div>

            {/* F2F banner */}
            <div className="flex-shrink-0 px-4 py-2 border-b border-white/[0.04] bg-amber-500/5">
                <p className="text-[10px] text-amber-400/70 font-medium text-center">
                    F2F Network — {conv.my_role === 'REQUESTER' ? 'You posted this request' : 'You quoted on this request'}
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m) => {
                    const isMe = m.sender_id === fwdId
                    const isSystem = m.sender_role === 'SYSTEM'

                    if (isSystem) {
                        return (
                            <div key={m.id} className="flex justify-center">
                                <span className="text-[10px] text-zinc-600 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full">
                                    {m.content}
                                </span>
                            </div>
                        )
                    }

                    return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                                isMe
                                    ? 'bg-white text-black rounded-br-sm'
                                    : 'bg-white/[0.06] border border-white/5 text-white rounded-bl-sm'
                            }`}>
                                <p className="text-sm leading-relaxed">{m.content}</p>
                                <p className={`text-[9px] mt-1 ${isMe ? 'text-black/40 text-right' : 'text-zinc-600'}`}>
                                    {new Date(m.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Actions bar (confirm / close) */}
            {conv.status !== 'CLOSED' && (
                <div className="flex-shrink-0 px-4 py-2 border-t border-white/[0.04] flex items-center gap-2">
                    {conv.status !== 'CONFIRMED' && (
                        <button
                            onClick={confirmDeal}
                            disabled={confirming || myConfirmed}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                                myConfirmed
                                    ? 'bg-emerald-500/10 text-emerald-400 cursor-default'
                                    : 'bg-white/[0.06] text-zinc-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            {myConfirmed ? 'You confirmed' : 'Confirm Deal'}
                        </button>
                    )}
                    {otherConfirmed && !myConfirmed && (
                        <span className="text-[10px] text-amber-400 font-medium">Other party confirmed — waiting for you</span>
                    )}
                    <div className="flex-1" />
                    <button
                        onClick={closeConv}
                        disabled={closing}
                        className="text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Input */}
            {conv.status !== 'CLOSED' && (
                <div className="flex-shrink-0 border-t border-white/5 px-4 py-3 flex gap-2">
                    {error && <p className="text-[10px] text-red-400 mb-1">{error}</p>}
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-white/15 transition-colors"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={sending || !text.trim()}
                        className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-40"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            )}

            {conv.status === 'CLOSED' && (
                <div className="flex-shrink-0 border-t border-white/5 px-4 py-4 text-center">
                    <p className="text-xs text-zinc-600">This conversation is closed.</p>
                </div>
            )}
        </div>
    )
}
