'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, X, ChevronDown, MessageCircle } from 'lucide-react'
import { apiFetch } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const GREETING = "Hey there 👋 Welcome to CargoLink! Ask me anything about your requests, quotes, bookings, or negotiations."

export default function AgentChat() {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: GREETING }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, open])

    // Show preview bubble after 3 seconds
    useEffect(() => {
        if (dismissed) return
        const t = setTimeout(() => setShowPreview(true), 3000)
        return () => clearTimeout(t)
    }, [dismissed])

    const send = async () => {
        if (!input.trim() || loading) return
        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
            const res = await apiFetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: userMsg, history }),
            })
            if (res.ok) {
                const data = await res.json()
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
        } finally {
            setLoading(false)
        }
    }

    const openChat = () => {
        setOpen(true)
        setShowPreview(false)
        setDismissed(true)
    }

    return (
        <>
            {/* ── Mobile: full-screen bottom sheet ── */}
            {open && (
                <div className="fixed inset-0 z-[60] flex flex-col md:hidden">
                    {/* Backdrop */}
                    <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
                    {/* Sheet */}
                    <div className="bg-white rounded-t-2xl flex flex-col" style={{ height: '85dvh' }}>
                        {/* Header */}
                        <div className="bg-gradient-to-br from-zinc-900 to-black px-4 py-3 rounded-t-2xl flex-shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <img src="/cargolink.png" alt="CargoLink" className="h-6 w-auto object-contain opacity-90" />
                                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <img src="/cargolink.png" alt="AI" className="w-full h-full object-contain p-1" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-black" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">CargoLink AI</p>
                                    <p className="text-[10px] text-emerald-400">Online · replies instantly</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-zinc-50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mb-0.5">
                                            <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-zinc-900 text-white rounded-br-sm'
                                            : 'bg-white text-zinc-800 rounded-bl-sm shadow-sm border border-zinc-100'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
                                    </div>
                                    <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                                        {[0, 150, 300].map(delay => (
                                            <span key={delay} className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Suggestions */}
                        {messages.length === 1 && (
                            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex gap-2 flex-wrap flex-shrink-0">
                                {['How many requests?', 'Show my quotes', 'My bookings'].map(s => (
                                    <button key={s} onClick={() => setInput(s)}
                                        className="text-[11px] font-medium text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-full hover:border-zinc-400 transition-all">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-3 py-3 bg-white border-t border-zinc-100 flex-shrink-0">
                            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 focus-within:border-zinc-400 transition-colors">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                    placeholder="Ask about your shipments..."
                                    className="flex-1 bg-transparent text-[13px] text-zinc-800 placeholder-zinc-400 outline-none"
                                    disabled={loading}
                                    autoFocus
                                />
                                <button onClick={send} disabled={loading || !input.trim()}
                                    className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0">
                                    {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                                </button>
                            </div>
                            <p className="text-[9px] text-zinc-400 text-center mt-1 font-inter">Powered by GPT-4o-mini · Your live data</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Desktop: Intercom-style fixed widget ── */}
            <div className="hidden md:flex fixed bottom-6 right-6 z-[55] flex-col items-end gap-3">

                {/* Preview bubble */}
                {showPreview && !open && !dismissed && (
                    <div className="flex items-start gap-3 bg-white rounded-2xl shadow-2xl px-4 py-3 max-w-[280px] cursor-pointer hover:shadow-xl transition-all"
                        onClick={openChat}>
                        <div className="flex-shrink-0 relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-600 flex items-center justify-center overflow-hidden">
                                <img src="/cargolink.png" alt="CargoLink AI" className="w-full h-full object-contain p-1.5" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-900 truncate">{GREETING.slice(0, 40)}...</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">CargoLink AI · Just now</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setShowPreview(false); setDismissed(true) }}
                            className="text-zinc-300 hover:text-zinc-500 flex-shrink-0 -mt-1 -mr-1">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Chat window */}
                {open && (
                    <div className="w-[370px] h-[530px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-100">
                        <div className="bg-gradient-to-br from-zinc-900 to-black px-5 py-4 flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <img src="/cargolink.png" alt="CargoLink" className="h-7 w-auto object-contain opacity-90" />
                                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                        <img src="/cargolink.png" alt="AI" className="w-full h-full object-contain p-1.5" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">CargoLink AI</p>
                                    <p className="text-[10px] text-emerald-400">Online · replies instantly</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mb-0.5">
                                            <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed font-inter ${
                                        msg.role === 'user'
                                            ? 'bg-zinc-900 text-white rounded-br-sm'
                                            : 'bg-white text-zinc-800 rounded-bl-sm shadow-sm border border-zinc-100'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
                                    </div>
                                    <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                                        {[0, 150, 300].map(delay => (
                                            <span key={delay} className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {messages.length === 1 && (
                            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex gap-2 flex-wrap">
                                {["How many requests have I sent?", "Show my quotes", "What's my booking status?"].map(s => (
                                    <button key={s} onClick={() => setInput(s)}
                                        className="text-[10px] font-medium text-zinc-600 bg-white border border-zinc-200 px-2.5 py-1 rounded-full hover:border-zinc-400 hover:text-zinc-900 transition-all">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="px-3 py-3 bg-white border-t border-zinc-100">
                            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 focus-within:border-zinc-400 transition-colors">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                    placeholder="Ask about your shipments..."
                                    className="flex-1 bg-transparent text-[12px] text-zinc-800 placeholder-zinc-400 outline-none font-inter"
                                    disabled={loading}
                                    autoFocus
                                />
                                <button onClick={send} disabled={loading || !input.trim()}
                                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0 hover:bg-zinc-700">
                                    {loading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                                </button>
                            </div>
                            <p className="text-[9px] text-zinc-400 text-center mt-1.5 font-inter">Powered by GPT-4o-mini · Your live data</p>
                        </div>
                    </div>
                )}

                {/* Desktop launcher */}
                {!open && (
                    <button onClick={openChat}
                        className="relative w-14 h-14 bg-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center hover:bg-zinc-800 transition-all hover:scale-105">
                        <img src="/cargolink.png" alt="CargoLink AI" className="w-8 h-8 object-contain" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">1</span>
                    </button>
                )}
            </div>

            {/* ── Mobile: launcher button (always visible, high up from bottom) ── */}
            {!open && (
                <button
                    onClick={openChat}
                    className="md:hidden fixed bottom-24 right-4 z-[55] w-14 h-14 bg-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
                >
                    <img src="/cargolink.png" alt="CargoLink AI" className="w-8 h-8 object-contain" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">1</span>
                </button>
            )}
        </>
    )
}
