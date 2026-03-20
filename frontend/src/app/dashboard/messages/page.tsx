'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/config'
import { MessageSquare, ArrowRight, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface ConversationSummary {
    public_id: string
    request_id: string
    forwarder_company: string
    original_price: number
    current_offer: number | null
    agreed_price: number | null
    currency: string
    status: string
    created_at: string
    last_message: {
        content: string
        sender_role: string
        created_at: string
    } | null
}

export default function MessagesPage() {
    const { user, logout, loading: authLoading } = useAuth()
    const router = useRouter()
    const [conversations, setConversations] = useState<ConversationSummary[]>([])
    const [loading, setLoading] = useState(true)

    const fetchConversations = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch('/api/conversations/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.status === 401) { logout(); return }
            const data = await res.json()
            if (data.conversations) setConversations(data.conversations)
        } catch {
            // silent
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        if (authLoading) return
        if (!user) { router.push('/login'); return }
        fetchConversations()
    }, [user, authLoading, router, fetchConversations])

    const displayPrice = (conv: ConversationSummary) => {
        if (conv.agreed_price) return { label: 'Agreed', price: conv.agreed_price, color: 'text-emerald-400' }
        if (conv.current_offer) return { label: 'Offer', price: conv.current_offer, color: 'text-amber-400' }
        return { label: 'Quoted', price: conv.original_price, color: 'text-white' }
    }

    if (loading || authLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="border-b border-white/5 pb-4 flex-shrink-0">
                <h1 className="text-lg font-bold tracking-tight text-white font-outfit">Messages</h1>
                <p className="text-zinc-500 text-xs font-inter mt-0.5">
                    {user?.role === 'forwarder'
                        ? 'Shippers who are interested in your quotes.'
                        : 'Your negotiations with forwarders.'}
                </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {conversations.length === 0 ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-7 h-7 text-zinc-700" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1 font-outfit uppercase tracking-tight">No conversations yet</h3>
                            <p className="text-xs text-zinc-600 font-inter max-w-xs">
                                {user?.role === 'forwarder'
                                    ? 'When shippers express interest in your quotes, conversations appear here.'
                                    : 'Click "Chat with Forwarder" on any quote in your Shipments page.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        {conversations.map((conv, idx) => {
                            const priceInfo = displayPrice(conv)
                            const isBooked = conv.status === 'BOOKED'

                            return (
                                <motion.div
                                    key={conv.public_id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    onClick={() => router.push(`/dashboard/messages/${conv.public_id}`)}
                                    className="flex items-center gap-4 px-4 py-4 bg-[#0a0a0a] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 hover:bg-[#0d0d0d] transition-all"
                                >
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isBooked ? 'bg-emerald-500/10' : 'bg-white/[0.04] border border-white/5'}`}>
                                        {isBooked
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            : <MessageSquare className="w-4 h-4 text-zinc-500" />
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-black text-white font-outfit truncate">{conv.forwarder_company}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                isBooked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-zinc-500'
                                            }`}>
                                                {isBooked ? 'Booked' : 'Open'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-zinc-600 font-mono mb-1">{conv.request_id}</p>
                                        {conv.last_message && (
                                            <p className="text-xs text-zinc-500 font-inter truncate">
                                                {conv.last_message.sender_role === 'SYSTEM'
                                                    ? conv.last_message.content.slice(0, 60) + '...'
                                                    : conv.last_message.content.slice(0, 60)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price + time */}
                                    <div className="text-right flex-shrink-0">
                                        <p className={`text-sm font-black font-mono ${priceInfo.color}`}>
                                            {conv.currency} {Number(priceInfo.price).toLocaleString()}
                                        </p>
                                        <p className="text-[9px] text-zinc-700 font-inter">{priceInfo.label}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <Clock className="w-2.5 h-2.5 text-zinc-700" />
                                            <span className="text-[9px] text-zinc-700 font-inter">
                                                {conv.last_message
                                                    ? new Date(conv.last_message.created_at).toLocaleDateString()
                                                    : new Date(conv.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
