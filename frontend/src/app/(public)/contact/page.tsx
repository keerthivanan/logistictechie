"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-48"
                >
                    <span className="arch-label mb-12 block">CONTACT</span>
                    <h1 className="arch-heading">Get In Touch</h1>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-32 border-t border-white/5 pt-32">

                    {/* Left Side - Transmission Details */}
                    <div className="space-y-32">
                        <div className="space-y-12">
                            <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl">
                                We are always interested in joining <strong className="text-white">new mission-critical</strong> projects.
                                Our studio is open to global collaboration.
                            </p>
                        </div>

                        <div className="space-y-16">
                            {[
                                { title: "Strategic Hub", desc: "NEOM, Saudi Arabia. High-security regional operational command.", link: "VIEW_MAP" },
                                { title: "Secure Transmission", desc: "ops@phoenix.io. Encrypted military-grade mail relay.", link: "SEND_MAIL" },
                                { title: "Voice Link", desc: "+966 800 ORA CLE. Direct operational voice override.", link: "CALL_NOW" }
                            ].map((item, idx) => (
                                <div key={idx} className="arch-detail-line group flex items-start justify-between cursor-pointer">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                        <p className="text-zinc-500 max-w-sm">{item.desc}</p>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-800 group-hover:text-white transition-colors">{item.link}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Transmission Form */}
                    <div className="p-16 bg-zinc-950/20 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none italic text-4xl">SECURE_LINK</div>
                        <h2 className="text-4xl font-light text-white mb-16 uppercase tracking-tight">Transmission_Form</h2>
                        <form className="space-y-10">
                            <div className="space-y-4">
                                <label className="arch-label">NAME_IDENTIFIER</label>
                                <Input
                                    placeholder="ENTER_FULL_NAME"
                                    className="h-20 bg-transparent border-b border-white/5 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-xl font-light italic"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="arch-label">EMAIL_NODE</label>
                                <Input
                                    placeholder="OPERATOR@NODE.COM"
                                    className="h-20 bg-transparent border-b border-white/5 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-xl font-light italic"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="arch-label">MESSAGE_PAYLOAD</label>
                                <Textarea
                                    placeholder="DESCRIBE_THE_LOGISTIC_ARCHITECTURE_REPLACEMENT"
                                    className="min-h-[200px] bg-transparent border-b border-white/5 rounded-none text-white focus:border-white transition-all ring-0 border-x-0 border-t-0 p-0 text-xl font-light italic resize-none"
                                />
                            </div>
                            <button className="w-full h-24 bg-white text-black font-bold uppercase tracking-[0.8em] text-[12px] transition-all hover:bg-zinc-200">
                                SUBMIT_MISSION_REQUEST
                            </button>
                        </form>
                    </div>
                </div>

                {/* FAQ / Secondary Matrix */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">GLOBAL_SYNC</span>
                    <h2 className="arch-heading mb-16 italic">Global Base.</h2>
                    <div className="grid md:grid-cols-3 gap-16 text-left max-w-4xl mx-auto mt-24">
                        {[
                            { id: "01", title: "London Hub", city: "United Kingdom" },
                            { id: "02", title: "Dubai Node", city: "UAE" },
                            { id: "03", title: "Singapore Unit", city: "Singapore" }
                        ].map((hub) => (
                            <div key={hub.id} className="arch-detail-line">
                                <span className="arch-number block mb-4">{hub.id}</span>
                                <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{hub.title}</h4>
                                <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-800 uppercase">{hub.city}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sub-footer Section */}
            <div className="border-t border-white/5 py-32">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-900 uppercase">
                    <span>END_TO_END_ENCRYPTION_ACTIVE</span>
                    <span>© 2026 PHOENIX_OS</span>
                </div>
            </div>
        </main>
    );
}
