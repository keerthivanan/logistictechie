'use client'
import { useState, useRef, useEffect, Fragment } from 'react'
import { Send, Loader2, X, ChevronDown } from 'lucide-react'
import { API_URL } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'

interface Message {
    role: 'user' | 'assistant'
    content: string
    ts: number
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function parseBold(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/)
    return parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold">{p}</strong> : <Fragment key={i}>{p}</Fragment>
    )
}

function renderMarkdown(text: string) {
    const lines = text.split('\n')
    const out: React.ReactNode[] = []
    let listItems: string[] = []
    let listType: 'ul' | 'ol' = 'ul'
    let k = 0

    const flush = () => {
        if (!listItems.length) return
        const Tag = listType === 'ul' ? 'ul' : 'ol'
        out.push(
            <Tag key={k++} className={`${listType === 'ul' ? 'list-disc' : 'list-decimal'} pl-4 my-1 space-y-0.5`}>
                {listItems.map((it, i) => <li key={i} className="leading-snug">{parseBold(it)}</li>)}
            </Tag>
        )
        listItems = []
    }

    for (const line of lines) {
        const bullet = line.match(/^[-•*]\s+(.+)/)
        const numbered = line.match(/^\d+\.\s+(.+)/)
        if (bullet) {
            if (listType !== 'ul') { flush(); listType = 'ul' }
            listItems.push(bullet[1])
        } else if (numbered) {
            if (listType !== 'ol') { flush(); listType = 'ol' }
            listItems.push(numbered[1])
        } else {
            flush()
            if (line.trim() === '') out.push(<div key={k++} className="h-1.5" />)
            else out.push(<p key={k++} className="leading-relaxed">{parseBold(line)}</p>)
        }
    }
    flush()
    return out
}

function timeAgo(ts: number) {
    const d = Math.floor((Date.now() - ts) / 1000)
    if (d < 10) return 'just now'
    if (d < 3600) return `${Math.floor(d / 60)}m ago`
    return `${Math.floor(d / 3600)}h ago`
}

function isArabic(text: string) {
    return (text.match(/[؀-ۿ]/g) || []).length / Math.max(text.length, 1) > 0.2
}

const SUGGESTIONS = {
    en: ['Compare my quotes', 'Show my bookings', 'What is FOB incoterm?'],
    ar: ['قارن عروض الأسعار', 'عرض حجوزاتي', 'ما هو مصطلح FOB؟'],
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AgentChat() {
    const { user } = useAuth()
    const firstName = user?.name?.split(' ')[0] || ''

    const [open, setOpen] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [streaming, setStreaming] = useState(false)
    const [progress, setProgress] = useState('')
    const [lang, setLang] = useState<'en' | 'ar'>('en')
    const bottomRef = useRef<HTMLDivElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    // Personalized greeting once user loads
    useEffect(() => {
        if (!firstName || messages.length) return
        const name = firstName ? `${firstName}` : 'there'
        setMessages([{
            role: 'assistant',
            content: `Hey ${name} 👋 I'm **CargoLink AI** — your freight assistant.\nI speak **English** and **العربية**.\n\nAsk me anything about your shipments, quotes, or bookings.`,
            ts: Date.now(),
        }])
    }, [firstName])

    // Show preview bubble after 3s
    useEffect(() => {
        if (dismissed) return
        const t = setTimeout(() => setShowPreview(true), 3000)
        return () => clearTimeout(t)
    }, [dismissed])

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, progress, open])

    // Detect language from last user message
    useEffect(() => {
        const last = [...messages].reverse().find(m => m.role === 'user')
        if (last) setLang(isArabic(last.content) ? 'ar' : 'en')
    }, [messages])

    const send = async () => {
        if (!input.trim() || streaming) return
        const userMsg = input.trim()
        setInput('')

        const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        setMessages(prev => [...prev, { role: 'user', content: userMsg, ts: Date.now() }])
        setStreaming(true)
        setProgress(lang === 'ar' ? 'جارٍ التحليل...' : 'Analyzing...')

        const ctrl = new AbortController()
        abortRef.current = ctrl

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/agent/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: userMsg, history }),
                signal: ctrl.signal,
            })

            if (!res.ok || !res.body) throw new Error('Stream failed')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let fullContent = ''
            let msgAdded = false

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = decoder.decode(value, { stream: true })
                for (const line of text.split('\n')) {
                    if (!line.startsWith('data: ')) continue
                    const data = line.slice(6).trim()
                    if (data === '[DONE]') break
                    try {
                        const ev = JSON.parse(data)
                        if (ev.progress) {
                            setProgress(ev.progress)
                        } else if (ev.token) {
                            if (!msgAdded) {
                                setMessages(prev => [...prev, { role: 'assistant', content: '', ts: Date.now() }])
                                setProgress('')
                                msgAdded = true
                            }
                            fullContent += ev.token
                            setMessages(prev => {
                                const copy = [...prev]
                                copy[copy.length - 1] = { ...copy[copy.length - 1], content: fullContent }
                                return copy
                            })
                        } else if (ev.error) {
                            setMessages(prev => [...prev, { role: 'assistant', content: ev.error, ts: Date.now() }])
                            setProgress('')
                        }
                    } catch {}
                }
            }
        } catch (e: any) {
            if (e?.name !== 'AbortError') {
                const err = lang === 'ar' ? 'خطأ في الاتصال. حاول مرة أخرى.' : 'Connection error. Please try again.'
                setMessages(prev => [...prev, { role: 'assistant', content: err, ts: Date.now() }])
            }
        } finally {
            setStreaming(false)
            setProgress('')
            abortRef.current = null
        }
    }

    const openChat = () => { setOpen(true); setShowPreview(false); setDismissed(true) }
    const closeChat = () => { setOpen(false); abortRef.current?.abort() }

    const placeholder = lang === 'ar' ? 'اسأل عن شحناتك...' : 'Ask about your shipments...'

    // ── Sub-components ────────────────────────────────────────────────────────

    const MsgBubble = ({ msg }: { msg: Message }) => (
        <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mb-4">
                    <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
                </div>
            )}
            <div className="flex flex-col gap-0.5 max-w-[80%]">
                <div dir="auto" className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                    msg.role === 'user'
                        ? 'bg-zinc-900 text-white rounded-br-sm'
                        : 'bg-white text-zinc-800 rounded-bl-sm shadow-sm border border-zinc-100'
                }`}>
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                </div>
                <span className={`text-[9px] text-zinc-400 ${msg.role === 'user' ? 'text-right' : 'text-left pl-1'}`}>
                    {timeAgo(msg.ts)}
                </span>
            </div>
        </div>
    )

    const ProgressBubble = () => progress ? (
        <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <img src="/cargolink.png" alt="AI" className="w-5 h-5 object-contain p-0.5" />
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-2">
                <Loader2 className="w-3 h-3 text-zinc-400 animate-spin flex-shrink-0" />
                <span className="text-[11px] text-zinc-500" dir="auto">{progress}</span>
            </div>
        </div>
    ) : null

    const Suggestions = () => messages.length <= 1 ? (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex gap-2 flex-wrap flex-shrink-0">
            {SUGGESTIONS[lang].map(s => (
                <button key={s} onClick={() => { setInput(s) }} dir="auto"
                    className="text-[10.5px] font-medium text-zinc-600 bg-white border border-zinc-200 px-2.5 py-1 rounded-full hover:border-zinc-400 hover:text-zinc-900 transition-all">
                    {s}
                </button>
            ))}
        </div>
    ) : null

    const InputRow = () => (
        <div className="px-3 py-3 bg-white border-t border-zinc-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 focus-within:border-zinc-400 transition-colors">
                <input
                    dir="auto"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-[12.5px] text-zinc-800 placeholder-zinc-400 outline-none"
                    disabled={streaming}
                    autoFocus
                />
                <button onClick={send} disabled={streaming || !input.trim()}
                    className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0 hover:bg-zinc-700">
                    {streaming
                        ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        : <Send className="w-3.5 h-3.5 text-white" />}
                </button>
            </div>
            <p className="text-[9px] text-zinc-400 text-center mt-1.5">
                {lang === 'ar' ? 'مدعوم بـ GPT-4o-mini · بياناتك الحية' : 'Powered by GPT-4o-mini · Your live data'}
            </p>
        </div>
    )

    const Header = ({ onClose, chevron }: { onClose: () => void; chevron?: boolean }) => (
        <div className="bg-gradient-to-br from-zinc-900 to-black px-5 py-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
                <img src="/cargolink.png" alt="CargoLink" className="h-7 w-auto object-contain opacity-90" />
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
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

    const MessagesPane = ({ cls }: { cls?: string }) => (
        <div className={`overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50 ${cls ?? ''}`}>
            {messages.map((m, i) => <MsgBubble key={i} msg={m} />)}
            <ProgressBubble />
            <div ref={bottomRef} />
        </div>
    )

    const LaunchBtn = ({ mobile }: { mobile?: boolean }) => (
        <button onClick={openChat}
            className={`relative bg-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center transition-all
                ${mobile
                    ? 'md:hidden fixed bottom-24 right-4 z-[55] w-14 h-14 active:scale-95'
                    : 'w-14 h-14 hover:bg-zinc-800 hover:scale-105'
                }`}>
            <img src="/cargolink.png" alt="CargoLink AI" className="w-8 h-8 object-contain" />
            {/* Pulsing online dot — no fake badge */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-900" />
            </span>
        </button>
    )

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Mobile bottom sheet */}
            {open && (
                <div className="fixed inset-0 z-[60] flex flex-col md:hidden">
                    <div className="flex-1 bg-black/50" onClick={closeChat} />
                    <div className="bg-white rounded-t-2xl flex flex-col" style={{ height: '88dvh' }}>
                        <Header onClose={closeChat} />
                        <MessagesPane cls="flex-1" />
                        <Suggestions />
                        <InputRow />
                    </div>
                </div>
            )}

            {/* Desktop widget */}
            <div className="hidden md:flex fixed bottom-6 right-6 z-[55] flex-col items-end gap-3">

                {/* Preview bubble */}
                {showPreview && !open && !dismissed && (
                    <div onClick={openChat}
                        className="flex items-start gap-3 bg-white rounded-2xl shadow-2xl px-4 py-3 max-w-[290px] cursor-pointer hover:shadow-xl transition-all">
                        <div className="flex-shrink-0 relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-600 flex items-center justify-center overflow-hidden">
                                <img src="/cargolink.png" alt="AI" className="w-full h-full object-contain p-1.5" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-zinc-900">
                                {firstName ? `Hey ${firstName}! 👋` : 'CargoLink AI 🌍'}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                Freight assistant · English & العربية
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
                        <Header onClose={closeChat} chevron />
                        <MessagesPane cls="flex-1" />
                        <Suggestions />
                        <InputRow />
                    </div>
                )}

                {!open && <LaunchBtn />}
            </div>

            {/* Mobile launcher */}
            {!open && <LaunchBtn mobile />}
        </>
    )
}
