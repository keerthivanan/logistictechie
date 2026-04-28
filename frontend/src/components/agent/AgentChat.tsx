'use client'
import { useState, useRef, useEffect, Fragment } from 'react'
import { Send, Loader2, X, ChevronDown } from 'lucide-react'
import { apiFetch } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const GREETING = "Hey there 👋 I'm CargoLink AI — your freight assistant.\nI speak **English** and **العربية**.\n\nAsk me anything about your shipments, quotes, or bookings."

// ── Inline markdown renderer ──────────────────────────────────────────────────
function parseBold(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/)
    return parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold">{p}</strong> : <Fragment key={i}>{p}</Fragment>
    )
}

function renderMarkdown(text: string) {
    const lines = text.split('\n')
    const output: React.ReactNode[] = []
    let listItems: string[] = []
    let listType: 'ul' | 'ol' = 'ul'
    let key = 0

    const flushList = () => {
        if (!listItems.length) return
        const Tag = listType === 'ul' ? 'ul' : 'ol'
        output.push(
            <Tag key={key++} className={`${listType === 'ul' ? 'list-disc' : 'list-decimal'} pl-4 my-1 space-y-0.5`}>
                {listItems.map((item, i) => (
                    <li key={i} className="leading-snug">{parseBold(item)}</li>
                ))}
            </Tag>
        )
        listItems = []
    }

    for (const line of lines) {
        const bulletMatch = line.match(/^[-•*]\s+(.+)/)
        const numberedMatch = line.match(/^\d+\.\s+(.+)/)

        if (bulletMatch) {
            if (listType !== 'ul' || !listItems.length) { flushList(); listType = 'ul' }
            listItems.push(bulletMatch[1])
        } else if (numberedMatch) {
            if (listType !== 'ol' || !listItems.length) { flushList(); listType = 'ol' }
            listItems.push(numberedMatch[1])
        } else {
            flushList()
            if (line.trim() === '') {
                output.push(<div key={key++} className="h-1.5" />)
            } else {
                output.push(
                    <p key={key++} className="leading-relaxed">{parseBold(line)}</p>
                )
            }
        }
    }
    flushList()
    return output
}
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS_EN = ['Compare my quotes', 'Show my bookings', 'What is FOB?']
const SUGGESTIONS_AR = ['قارن عروض الأسعار', 'عرض حجوزاتي', 'ما هو FOB؟']

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
    const [lang, setLang] = useState<'en' | 'ar'>('en')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, open])

    useEffect(() => {
        if (dismissed) return
        const t = setTimeout(() => setShowPreview(true), 3000)
        return () => clearTimeout(t)
    }, [dismissed])

    // Detect language from last user message
    useEffect(() => {
        const lastUser = [...messages].reverse().find(m => m.role === 'user')
        if (!lastUser) return
        const arabicRatio = (lastUser.content.match(/[؀-ۿ]/g) || []).length / lastUser.content.length
        setLang(arabicRatio > 0.2 ? 'ar' : 'en')
    }, [messages])

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
                setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.' }])
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'خطأ في الاتصال. حاول مرة أخرى.' : 'Connection error. Please try again.' }])
        } finally {
            setLoading(false)
        }
    }

    const openChat = () => { setOpen(true); setShowPreview(false); setDismissed(true) }

    const suggestions = lang === 'ar' ? SUGGESTIONS_AR : SUGGESTIONS_EN
    const placeholder = lang === 'ar' ? 'اسأل عن شحناتك...' : 'Ask about your shipments...'

    const MessageBubble = ({ msg }: { msg: Message }) => (
        <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
                </div>
            )}
            <div
                dir="auto"
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                    msg.role === 'user'
                        ? 'bg-zinc-900 text-white rounded-br-sm'
                        : 'bg-white text-zinc-800 rounded-bl-sm shadow-sm border border-zinc-100'
                }`}
            >
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
            </div>
        </div>
    )

    const TypingIndicator = () => (
        <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
            </div>
        </div>
    )

    const InputBar = ({ mobile }: { mobile?: boolean }) => (
        <div className={`px-3 py-3 bg-white border-t border-zinc-100 ${mobile ? 'flex-shrink-0' : ''}`}>
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 focus-within:border-zinc-400 transition-colors">
                <input
                    dir="auto"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-[12.5px] text-zinc-800 placeholder-zinc-400 outline-none"
                    disabled={loading}
                    autoFocus
                />
                <button onClick={send} disabled={loading || !input.trim()}
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0 hover:bg-zinc-700">
                    {loading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                </button>
            </div>
            <p className="text-[9px] text-zinc-400 text-center mt-1.5">
                {lang === 'ar' ? 'مدعوم بـ GPT-4o-mini · بياناتك الحية' : 'Powered by GPT-4o-mini · Your live data'}
            </p>
        </div>
    )

    const ChatHeader = ({ onClose, chevron }: { onClose: () => void; chevron?: boolean }) => (
        <div className="bg-gradient-to-br from-zinc-900 to-black px-5 py-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
                <img src="/cargolink.png" alt="CargoLink" className="h-7 w-auto object-contain opacity-90" />
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    {chevron ? <ChevronDown className="w-5 h-5" /> : <X className="w-5 h-5" />}
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
                    <p className="text-[10px] text-emerald-400">
                        {lang === 'ar' ? 'متصل · يرد فوراً 🇸🇦🌍' : 'Online · replies instantly 🌍'}
                    </p>
                </div>
            </div>
        </div>
    )

    const SuggestionsBar = () => messages.length <= 1 ? (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex gap-2 flex-wrap flex-shrink-0">
            {suggestions.map(s => (
                <button key={s} onClick={() => setInput(s)} dir="auto"
                    className="text-[10.5px] font-medium text-zinc-600 bg-white border border-zinc-200 px-2.5 py-1 rounded-full hover:border-zinc-400 hover:text-zinc-900 transition-all">
                    {s}
                </button>
            ))}
        </div>
    ) : null

    const MessagesArea = ({ className }: { className?: string }) => (
        <div className={`overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50 ${className ?? ''}`}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
        </div>
    )

    return (
        <>
            {/* ── Mobile: full-screen bottom sheet ───────────────────────────── */}
            {open && (
                <div className="fixed inset-0 z-[60] flex flex-col md:hidden">
                    <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
                    <div className="bg-white rounded-t-2xl flex flex-col" style={{ height: '88dvh' }}>
                        <ChatHeader onClose={() => setOpen(false)} />
                        <MessagesArea className="flex-1" />
                        <SuggestionsBar />
                        <InputBar mobile />
                    </div>
                </div>
            )}

            {/* ── Desktop: Intercom-style widget ─────────────────────────────── */}
            <div className="hidden md:flex fixed bottom-6 right-6 z-[55] flex-col items-end gap-3">

                {/* Preview bubble */}
                {showPreview && !open && !dismissed && (
                    <div className="flex items-start gap-3 bg-white rounded-2xl shadow-2xl px-4 py-3 max-w-[290px] cursor-pointer hover:shadow-xl transition-all"
                        onClick={openChat}>
                        <div className="flex-shrink-0 relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-600 flex items-center justify-center overflow-hidden">
                                <img src="/cargolink.png" alt="CargoLink AI" className="w-full h-full object-contain p-1.5" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-zinc-900">CargoLink AI 🌍</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                                Freight assistant in English & العربية
                            </p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setShowPreview(false); setDismissed(true) }}
                            className="text-zinc-300 hover:text-zinc-500 flex-shrink-0 -mt-1 -mr-1">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Desktop chat window */}
                {open && (
                    <div className="w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-100">
                        <ChatHeader onClose={() => setOpen(false)} chevron />
                        <MessagesArea className="flex-1" />
                        <SuggestionsBar />
                        <InputBar />
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

            {/* ── Mobile: launcher button ─────────────────────────────────────── */}
            {!open && (
                <button onClick={openChat}
                    className="md:hidden fixed bottom-24 right-4 z-[55] w-14 h-14 bg-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-transform">
                    <img src="/cargolink.png" alt="CargoLink AI" className="w-8 h-8 object-contain" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">1</span>
                </button>
            )}
        </>
    )
}
