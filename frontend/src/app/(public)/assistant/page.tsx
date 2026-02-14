"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Cpu,
    Send,
    Zap,
    Globe,
    ShieldCheck,
    ArrowRight,
    MessageSquare,
    Terminal,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { BACKEND_URL } from "@/lib/logistics";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

export default function AssistantPage() {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "instant" });
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
    }, [user, t]);

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
            await fetchEventSource(`${BACKEND_URL}/ai/chat/stream?message=${encodeURIComponent(userMsg.content)}&history=${encodeURIComponent(JSON.stringify(history))}&lang=${language}`, {
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
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48 flex-1 flex flex-col">

                {/* Monumental Tactical Header - Static */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 md:gap-32 mb-32 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">NEURAL_INTERFACE_COMMAND</span>
                        <h1 className="text-7xl md:text-[160px] font-black text-white tracking-tighter uppercase leading-[0.8] italic">
                            {t('audit.oracleIntel').split(' ')[0]} <br />
                            <span className="text-white/20 select-none">{t('audit.oracleIntel').split(' ').slice(1).join(' ')}.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { label: "LATENCY", value: "12MS", status: "PERFECT" },
                                { label: "NODES", value: "GLOBAL", status: "SYNCED" },
                                { label: "UPTIME", value: "99.9%", status: "OPTIMAL" },
                                { label: "PROTO", value: "L3_AI", status: "G.O.A.T" }
                            ].map((stat, i) => (
                                <div key={i} className="pb-8 border-b border-white/10 group bg-zinc-950/40 p-10 rounded-[48px] shadow-2xl backdrop-blur-3xl">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-4">{stat.label}</span>
                                    <div className="text-4xl font-black text-white italic tracking-tighter tabular-nums leading-none">{stat.value}</div>
                                    <div className="text-[9px] font-black text-white tracking-[0.6em] mt-4 uppercase underline decoration-white/10 underline-offset-8">{stat.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Interaction Area - Static Node Grid */}
                <div className="grid lg:grid-cols-[1fr,2.5fr] gap-16 md:gap-32 border-t border-white/10 pt-32 flex-1 min-h-0 relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

                    {/* Left: System Parameters - Tactical Registry */}
                    <div className="space-y-16 hidden lg:block">
                        <div className="space-y-12">
                            {[
                                { id: "01", label: "MARKET_SYNC", desc: t('assistant.parameters.market_desc') },
                                { id: "02", label: "RISK_VIVID", desc: t('assistant.parameters.risk_desc') },
                                { id: "03", label: "SECURE_LINK", desc: t('assistant.parameters.secure_desc') }
                            ].map((item) => (
                                <div key={item.id} className="bg-zinc-950/40 rounded-[48px] border border-white/10 p-12 transition-all hover:border-white/20 group backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                    <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-all tabular-nums block mb-6 leading-none italic">{item.id}</span>
                                    <p className="text-[12px] font-black tracking-[0.6em] text-white uppercase mb-4">{item.label}</p>
                                    <p className="text-white/40 text-[11px] font-black uppercase tracking-widest leading-relaxed">{item.desc}</p>
                                    <div className="absolute top-8 right-8 w-2 h-2 bg-white/20 rounded-full" />
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            className="w-full h-32 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[1em] text-[12px] transition-all hover:bg-white hover:text-black rounded-full active:scale-95 shadow-2xl"
                        >
                            RETURN_TO_BASE
                        </Button>
                    </div>

                    {/* Right: Message Stream - The Sovereign Void */}
                    <div className="flex flex-col h-full min-h-[700px] border border-white/10 bg-zinc-950/40 rounded-[80px] relative overflow-hidden backdrop-blur-3xl shadow-2xl group transition-all duration-700">
                        <div className="absolute top-12 right-12 p-12 opacity-[0.03] pointer-events-none italic text-6xl font-black tracking-tighter text-white select-none">ORACLE_OS_V2</div>

                        <ScrollArea className="flex-1 p-12 md:p-24">
                            <div className="space-y-24 max-w-5xl">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "p-16 rounded-[64px] border transition-all duration-700 relative group/msg",
                                            msg.role === "user"
                                                ? "bg-white border-white ml-auto max-w-[85%] shadow-2xl"
                                                : "bg-zinc-950/40 border-white/10 mr-auto max-w-[90%] backdrop-blur-3xl"
                                        )}
                                    >
                                        <div className="flex items-center gap-6 mb-8 uppercase text-[10px] font-black tracking-[0.8em]">
                                            {msg.role === "user" ? (
                                                <>
                                                    <Terminal className="w-5 h-5 text-black/40" />
                                                    <span className="text-black/40">OPERATIVE_CMD</span>
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare className="w-5 h-5 text-white/20" />
                                                    <span className="text-white/20">ORACLE_RESPONSE</span>
                                                </>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-3xl md:text-5xl font-black tracking-tighter leading-[0.9] italic uppercase",
                                            msg.role === "user" ? "text-black" : "text-white"
                                        )}>
                                            {msg.content}
                                            {msg.isStreaming && <span className="inline-block w-2 h-12 ml-4 bg-white/40 animate-pulse align-middle" />}
                                        </p>
                                        <div className={cn(
                                            "mt-12 pt-8 border-t flex justify-between items-center",
                                            msg.role === "user" ? "border-black/10" : "border-white/5"
                                        )}>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-[1em]",
                                                msg.role === "user" ? "text-black/20" : "text-white/10"
                                            )}>
                                                T_LOG: {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <ShieldCheck className={cn("w-5 h-5", msg.role === "user" ? "text-black/10" : "text-white/5")} />
                                        </div>
                                    </div>
                                ))}

                                {isThinking && !messages[messages.length - 1].isStreaming && (
                                    <div className="p-16 rounded-[64px] border border-white/20 bg-zinc-950/40 mr-auto min-w-[300px] backdrop-blur-3xl shadow-2xl">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[1.5em] mb-8 block">SYNAPSING...</span>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-16 bg-white/10 rounded-full animate-pulse" />)}
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Node - The Command Hub */}
                        <div className="p-12 md:p-20 border-t border-white/10 bg-black/60 backdrop-blur-3xl">
                            <div className="relative group/input flex items-end gap-12 bg-zinc-950/80 p-8 rounded-[64px] border-2 border-white/10 focus-within:border-white/40 transition-all duration-700 shadow-2xl">
                                <div className="flex-1 px-10 pb-4">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[1.2em] mb-4 block">TERMINAL_READY</label>
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder="INPUT_COMMAND_PROTOCOL"
                                        className="bg-transparent w-full py-6 text-4xl font-black text-white uppercase italic outline-none tracking-tighter placeholder:text-white/5"
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isThinking}
                                    className="h-32 w-32 flex items-center justify-center bg-white text-black rounded-full hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 mb-2 hover:scale-105"
                                >
                                    {isThinking ? <Zap className="w-12 h-12" /> : <ChevronRight className="w-16 h-16" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monumental Sub-footer - Static */}
                <div className="mt-64 text-center border-t border-white/10 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[12px] font-black text-white/40 uppercase tracking-[1.5em] mb-16 block">ORACLE_CORE_OS</span>
                    <h2 className="text-7xl md:text-[200px] font-black text-white/5 uppercase tracking-tighter transition-all duration-1000 leading-none select-none italic group-hover:text-white/10">Sovereign. Tactical.</h2>
                </div>
            </div>
        </main>
    );
}
