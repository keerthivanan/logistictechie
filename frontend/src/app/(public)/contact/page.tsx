"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone, Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 pt-48 pb-48 relative z-10">
                <div className="grid lg:grid-cols-2 gap-32 items-start">

                    {/* Tactical Contact Info */}
                    <div className="space-y-32">
                        <div className="space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-[1px] bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">COMMUNICATION_LINK</span>
                                </div>
                                <h1 className="titan-text mb-8">
                                    Secure. <br />
                                    <span className="text-zinc-900 group">Connection.</span>
                                </h1>
                                <p className="max-w-xl text-zinc-600 text-sm md:text-xl font-black uppercase tracking-[0.4em] leading-relaxed">
                                    Direct encryption access to our specialized logistics operations and global intelligence network.
                                </p>
                            </motion.div>
                        </div>

                        <div className="space-y-20">
                            {[
                                { icon: MapPin, title: "OPERATIONS_HQ", lines: ["600 CALIFORNIA STREET", "SAN FRANCISCO, CA 94108"] },
                                { icon: Mail, title: "SATELLITE_LINK", lines: ["OPS@PHOENIX.IO", "CORE@PHOENIX.IO"] },
                                { icon: Phone, title: "TACTICAL_SUPPORT", lines: ["+1 (888) PHOENIX", "AVAILABLE_24/7/365"] }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-start gap-12 group cursor-default"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 + (i * 0.1) }}
                                >
                                    <div className="w-20 h-20 bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0 transition-all duration-700 group-hover:bg-white group-hover:text-black group-hover:-rotate-12">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500 mb-6">{item.title}</h3>
                                        {item.lines.map((line, li) => (
                                            <p key={li} className="text-white text-xl font-black italic tracking-tighter uppercase mb-2 group-hover:text-emerald-500 transition-colors">{line}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Encrypted Transmission Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="elite-card p-16 relative group"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 italic font-black text-6xl text-white select-none pointer-events-none uppercase">
                            Mail_Unit
                        </div>

                        <div className="flex items-center gap-4 mb-16 border-b border-white/5 pb-8">
                            <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.6em]">INITIATE_TRANSMISSION_PROTOCOL</span>
                        </div>

                        <form className="space-y-12 relative z-10">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4 group/input">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within/input:text-emerald-500 transition-colors">FIRST_NAME</label>
                                    <Input className="bg-zinc-950/40 border-white/5 h-16 rounded-none text-white focus:border-white transition-all uppercase font-black tracking-widest text-[10px] ring-0 outline-none" placeholder="SYSTEM_USER" />
                                </div>
                                <div className="space-y-4 group/input">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within/input:text-emerald-500 transition-colors">LAST_NAME</label>
                                    <Input className="bg-zinc-950/40 border-white/5 h-16 rounded-none text-white focus:border-white transition-all uppercase font-black tracking-widest text-[10px] ring-0 outline-none" placeholder="OPERATOR" />
                                </div>
                            </div>

                            <div className="space-y-4 group/input">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within/input:text-emerald-500 transition-colors">ACCESS_EMAIL</label>
                                <Input className="bg-zinc-950/40 border-white/5 h-16 rounded-none text-white focus:border-white transition-all uppercase font-black tracking-widest text-[10px] ring-0 outline-none" placeholder="USER@NETWORK.COM" />
                            </div>

                            <div className="space-y-4 group/input">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within/input:text-emerald-500 transition-colors">MESSAGE_PAYLOAD</label>
                                <Textarea className="bg-zinc-950/40 border-white/5 min-h-[200px] rounded-none text-white focus:border-white transition-all uppercase font-black tracking-widest text-[10px] ring-0 outline-none resize-none" placeholder="STATE YOUR OBJECTIVES..." />
                            </div>

                            <Button className="w-full h-20 text-black font-black uppercase tracking-[0.6em] text-[11px] bg-white hover:bg-emerald-500 rounded-none transition-all shadow-[0_20px_60px_rgba(255,255,255,0.05)] flex items-center justify-center gap-6">
                                TRANSMIT_MESSAGE <ArrowRight className="h-5 w-5" />
                            </Button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-white/5 text-center">
                            <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] flex items-center justify-center gap-4">
                                <Shield className="w-3 h-3" /> END_TO_END_ENCRYPTION_ENFORCED
                            </span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}
