"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
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
    Bot
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
    const { user, logout } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isThinking]);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: "assistant",
                    content: `Greetings, ${user?.name || "Global Operator"}. I am the Sovereign Oracle. accessing real-time logistics nodes... \n\nHow may I optimize your supply chain today?`,
                    timestamp: new Date(),
                }
            ]);
        }
    }, [user, messages.length]);

    const handleSendMessage = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: Message = { role: "user", content: input, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        const aiMsg: Message = { role: "assistant", content: "", timestamp: new Date(), isStreaming: true };
        setMessages((prev) => [...prev, aiMsg]);

        try {
            // Prepare history for backend
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            history.push({ role: "user", content: userMsg.content });

            await fetchEventSource("http://localhost:8000/api/ai/chat/stream?message=" + encodeURIComponent(userMsg.content) + "&history=" + encodeURIComponent(JSON.stringify(history)), {
                method: "GET",
                headers: {
                    "Accept": "text/event-stream",
                },
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

                    // Append token
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        lastMsg.content += ev.data; // Token stream
                        return newMsgs;
                    });
                },
                onerror(err) {
                    console.error("Stream error:", err);
                    setIsThinking(false);
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].content += "\n\n[Connection Interrupted. Re-establishing neural link...]";
                        newMsgs[newMsgs.length - 1].isStreaming = false;
                        return newMsgs;
                    });
                }
            });

        } catch (error) {
            console.error("AI Error:", error);
            setIsThinking(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Sidebar - Context & Actions */}
            <aside className="w-80 border-r border-white/5 bg-zinc-950/50 hidden lg:flex flex-col p-6 backdrop-blur-xl z-20">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <Cpu className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="font-outfit font-bold text-xl tracking-tight">Oracle AI</h1>
                        <p className="text-xs text-zinc-500 font-medium">Sovereign Intelligence</p>
                    </div>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider text-zinc-600 font-bold ml-1">Active Neural Nodes</h3>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-zinc-300">
                                <Globe className="w-4 h-4 text-emerald-400" />
                                <span>Global Market Data</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-300">
                                <TrendingUp className="w-4 h-4 text-amber-400" />
                                <span>Rate Prediction Engine</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-300">
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                <span>Risk Assessment 2.0</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider text-zinc-600 font-bold ml-1">System Status</h3>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-400">Database</span>
                                <span className="text-emerald-400 font-bold">PERFECT</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-400">Auth Stream</span>
                                <span className="text-emerald-400 font-bold">SECURE</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-400">Latency</span>
                                <span className="text-indigo-400 font-bold">12ms</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all text-zinc-400"
                    onClick={() => router.push('/dashboard')}
                >
                    Return to Dashboard
                </Button>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-[url('/grid.svg')] bg-cover">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

                {/* Header */}
                <header className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md z-10 sticky top-0">
                    <div className="lg:hidden flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-indigo-400" />
                        <span className="font-outfit font-bold">Oracle AI</span>
                    </div>
                </header>

                <ScrollArea className="flex-1 px-4 lg:px-20 py-8 scroll-smooth hover:pr-2">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0 mt-1">
                                            <Sparkles className="w-4 h-4 text-indigo-400" />
                                        </div>
                                    )}

                                    <div className={`
                                        relative group max-w-[85%] lg:max-w-[75%] rounded-2xl p-5 text-sm leading-relaxed shadow-lg
                                        ${msg.role === "user"
                                            ? "bg-white text-black rounded-tr-none ml-12"
                                            : "bg-zinc-900 border border-white/10 text-zinc-200 rounded-tl-none mr-12"}
                                    `}>
                                        <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                                        {msg.isStreaming && (
                                            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-400 animate-pulse" />
                                        )}
                                        <div className={`absolute bottom-1 ${msg.role === 'user' ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-zinc-500`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0 mt-1">
                                            <div className="font-bold text-xs">{user?.name?.[0] || "U"}</div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isThinking && !messages[messages.length - 1].isStreaming && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="bg-zinc-900 border border-white/10 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={scrollRef} className="h-4" />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-black/80 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Ask the Oracle (e.g., 'Analyze the shipping route from Shanghai to LA')..."
                            className="bg-zinc-900/50 border-white/10 h-14 pl-6 pr-14 rounded-full text-base focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium text-white placeholder:text-zinc-600"
                        />
                        <Button
                            size="icon"
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isThinking}
                            className={`
                                absolute right-2 top-2 h-10 w-10 rounded-full transition-all
                                ${input.trim() ? "bg-white text-black hover:bg-indigo-50 hover:text-indigo-600 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-zinc-800 text-zinc-500"}
                            `}
                        >
                            {isThinking ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                            AI-Generated Logistics Advice • Verify Critical Data
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
