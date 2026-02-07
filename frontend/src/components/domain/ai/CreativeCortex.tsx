"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Terminal, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function CreativeCortex() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "SYSTEM INITIALIZED: The Creative Cortex is online. How can I optimize your logistics stream today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/api/ai/chat", {
                message: userMsg,
                history: messages.map(m => ({ role: m.role, content: m.content }))
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "ERROR: Synchronization failed. Please verify neural link." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        onClick={() => setIsOpen(true)}
                        className="h-16 w-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
                        <Bot className="h-8 w-8 relative z-10" />
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-black animate-ping" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className={`ultra-card bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-500 ${isMinimized ? 'h-20 w-80' : 'h-[600px] w-[90vw] sm:w-[400px]'}`}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-2xl">
                                    <Sparkles className="h-6 w-6 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">Creative Cortex</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Neural Link Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white">
                                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={idx}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed uppercase tracking-widest ${msg.role === 'user'
                                                ? 'bg-white text-black font-black'
                                                : 'bg-white/5 border border-white/10 text-gray-300'}`}>
                                                {msg.role === 'assistant' && (
                                                    <div className="flex items-center gap-2 mb-2 text-[8px] text-gray-500 font-black">
                                                        <Terminal className="h-3 w-3" />
                                                        <span>LOG_STREAM_0x{idx.toString(16).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-1">
                                                <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" />
                                                <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce delay-75" />
                                                <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce delay-150" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                                    <div className="relative flex gap-3">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="SYNC QUERY..."
                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 font-black uppercase tracking-widest text-[10px] rounded-xl focus-visible:ring-white/20"
                                        />
                                        <Button
                                            onClick={handleSend}
                                            disabled={isLoading}
                                            className="h-12 w-12 bg-white text-black hover:bg-gray-100 rounded-xl flex-shrink-0 shadow-2xl"
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-3 w-3" />
                                            <span>Processing Latency: 45ms</span>
                                        </div>
                                        <span>Phoenix_Engine_v1.0</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
