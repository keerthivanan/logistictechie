'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, User, Sparkles, Send, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'

interface Message {
    role: 'user' | 'assistant'
    content: string
    action?: { type: string, payload: string }
}

export default function AiChatVisual() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "THE CREATIVE CORTEX IS ONLINE. I can navigate the SOVEREIGN OS for you. Ask me to 'Track', 'Get Rates', or 'View Dashboard'."
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            })

            const data = await res.json()

            if (data.response) {
                const newMsg: Message = { role: 'assistant', content: data.response }
                if (data.action) {
                    newMsg.action = data.action
                    if (data.action.type === 'NAVIGATE') {
                        setTimeout(() => router.push(data.action.payload), 2000)
                    }
                }
                setMessages(prev => [...prev, newMsg])
            }
        } catch (err) {
            console.error(err)
            setMessages(prev => [...prev, { role: 'assistant', content: "INTELLIGENCE SYNC ERROR: Link to Sovereign Node lost." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-black border border-white/10 rounded-3xl relative overflow-hidden flex flex-col h-[500px]">
            {/* Gradient Glow */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Sovereign Oracle v5.0</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-500 uppercase">Live</span>
                </div>
            </div>

            {/* Chat Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
            >
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'assistant' && (
                            <div className="mr-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className={`
                            px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed
                            ${m.role === 'user'
                                ? 'bg-zinc-800 text-white rounded-tr-sm border border-white/5'
                                : 'bg-black/80 text-gray-200 rounded-tl-sm border border-white/10 shadow-xl'
                            }
                        `}>
                            {m.role === 'assistant' && i === messages.length - 1 && loading && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Analyzing...</span>
                                </div>
                            )}
                            {m.content}
                            {m.action && m.action.type === 'NAVIGATE' && (
                                <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[10px] font-bold text-blue-400 uppercase flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Auto-navigating to {m.action.payload}
                                </div>
                            )}
                        </div>
                        {m.role === 'user' && (
                            <div className="ml-3 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 bg-black/80 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Task the Oracle (e.g. 'Track BK-1024')"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black p-2 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>
        </div>
    )
}
