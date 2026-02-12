"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cpu,
    Send,
    Sparkles,
    Zap,
    Globe,
    TrendingUp,
    ShieldCheck,
    LogOut,
    Bot,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { fetchEventSource } from "@microsoft/fetch-event-source";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

export default function AssistantPage() {
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isThinking]);

    useEffect(() => {
        if (messages.length === 0) {
            const operatorId = user?.name?.toUpperCase() || "CORE";
            setMessages([
                {
                    role: "assistant",
                    content: t('assistant.greeting').replace('{name}', operatorId),
                    timestamp: new Date(),
                }
            ]);
        }
    }, [user, messages.length, t]);

    const handleSendMessage = async () => {
        if (!input.trim() || isThinking) return;
        const userMsg: Message = { role: "user", content: input, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);
        const aiMsg: Message = { role: "assistant", content: "", timestamp: new Date(), isStreaming: true };
        setMessages((prev) => [...prev, aiMsg]);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            history.push({ role: "user", content: userMsg.content });
            await fetchEventSource("http://localhost:8000/api/ai/chat/stream?message=" + encodeURIComponent(userMsg.content) + "&history=" + encodeURIComponent(JSON.stringify(history)), {
                method: "GET",
                headers: { "Accept": "text/event-stream" },
                onmessage(ev) {
                    if (ev.data === "[DONE]") {
                        setIsThinking(false);
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1].isStreaming = false;
                            return newMsgs;
                        });
                        return;
                    }
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        lastMsg.content += ev.data;
                        return newMsgs;
                    });
                }
            });
        } catch (error) {
            setIsThinking(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
            <div className="container max-w-[1400px] mx-auto px-8 py-24 flex-1 flex flex-col">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-[1fr,2fr] gap-32 mb-32"
                >
                    <div>
                        <span className="arch-label mb-12 block">NEURAL_INTERFACE</span>
                        <h1 className="arch-heading">{t('audit.oracleIntel').split(' ')[0]} <br />{t('audit.oracleIntel').split(' ').slice(1).join(' ')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="grid grid-cols-3 gap-8">
                            {[
                                { label: "LATENCY", value: "12MS", status: "PERFECT" },
                                { label: "NODES", value: "GLOBAL", status: "SYNCED" },
                                { label: "UPTIME", value: "99.9%", status: "OPTIMAL" }
                            ].map((stat, i) => (
                                <div key={i} className="arch-detail-line">
                                    <span className="arch-label block mb-2">{stat.label}</span>
                                    <div className="text-2xl font-light text-white italic">{stat.value}</div>
                                    <div className="text-[9px] font-bold text-emerald-500 tracking-[0.4em] mt-1">{stat.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Main Interaction Area */}
                <div className="grid lg:grid-cols-[1fr,2.5fr] gap-32 border-t border-white/5 pt-32 flex-1 min-h-0">

                    {/* Left: System Parameters */}
                    <div className="space-y-32 hidden lg:block">
                        <div className="space-y-16">
                            {[
                                { id: "01", label: "MARKET_SYNC", desc: t('assistant.parameters.market_desc') },
                                { id: "02", label: "RISK_VIVID", desc: t('assistant.parameters.risk_desc') },
                                { id: "03", label: "SECURE_LINK", desc: t('assistant.parameters.secure_desc') }
                            ].map((item) => (
                                <div key={item.id} className="arch-detail-line opacity-40">
                                    <span className="arch-number block mb-2">{item.id}</span>
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">{item.label}</p>
                                    <p className="text-zinc-600 text-[9px] uppercase tracking-widest">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            className="w-full h-16 border border-white/10 bg-transparent text-white font-bold uppercase tracking-[0.6em] text-[10px] transition-all hover:bg-white hover:text-black"
                        >
                            RETURN_TO_BASE
                        </Button>
                    </div>

                    {/* Right: Message Stream */}
                    <div className="flex flex-col h-full min-h-[500px] border border-white/5 bg-zinc-950/10 relative overflow-hidden">
                        <ScrollArea className="flex-1 p-12">
                            <div className="space-y-24 max-w-3xl">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`arch-detail-line ${msg.role === "user" ? "border-white ml-24" : "border-white/10"}`}
                                        >
                                            <span className="arch-label mb-4 block">{msg.role === "user" ? "OPERATIVE_CMD" : "ORACLE_RESPONSE"}</span>
                                            <p className={`text-2xl font-light leading-relaxed ${msg.role === "user" ? "text-white italic" : "text-zinc-400"}`}>
                                                {msg.content}
                                                {msg.isStreaming && <span className="inline-block w-2 h-6 ml-2 bg-white animate-pulse align-middle" />}
                                            </p>
                                            <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest mt-4 block">
                                                TIMESTAMP: {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {isThinking && !messages[messages.length - 1].isStreaming && (
                                    <div className="arch-detail-line opacity-20">
                                        <span className="arch-label mb-4 block">THINKING</span>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-6 bg-white animate-pulse" />)}
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Node */}
                        <div className="p-8 border-t border-white/5 bg-black/50">
                            <div className="relative group">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="INPUT_CMD"
                                    className="bg-transparent border-b border-white/10 w-full py-8 text-3xl font-light text-white italic outline-none focus:border-white transition-all tracking-tighter"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isThinking}
                                    className="absolute right-0 bottom-8 h-12 w-12 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all"
                                >
                                    {isThinking ? <Zap className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.6em] mt-4 text-center">
                                AI_LINK_ACTIVE • SYNCHRONIZING_GLOBAL_NODES
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-48 text-center border-t border-white/5 pt-24 pb-12">
                    <span className="arch-label mb-8 block">ORACLE_CORE_OS</span>
                    <h2 className="arch-heading italic opacity-20">Phoenix. AI.</h2>
                </div>
            </div>
        </main>
    );
}
