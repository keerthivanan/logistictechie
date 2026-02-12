"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock, Bell, Globe, ArrowLeft, Check, Zap, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("account");
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMsg({ type: "error", text: "NEW_PASSWORDS_DO_NOT_SYNC" });
            return;
        }
        setLoading(true);
        try {
            const token = (session?.user as any).accessToken;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await axios.put(`${apiUrl}/api/auth/change-password`, {
                current_password: passwords.current,
                new_password: passwords.new
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg({ type: "success", text: "SECURITY_PROTOCOL_UPDATED" });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (err) {
            setMsg({ type: "error", text: "CREDENTIAL_VERIFICATION_FAILED" });
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { id: "01", label: "SECURITY", icon: Lock, desc: "Manage cryptographic access and system credentials." },
        { id: "02", label: "NOTIFICATIONS", icon: Bell, desc: "Configure millisecond telemetry alerts and mission updates." },
        { id: "03", label: "LOCALIZATION", icon: Globe, desc: "Adjust temporal regional nodes and linguistic frameworks." }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-64"
                >
                    <span className="arch-label mb-12 block">CONFIGURATION</span>
                    <h1 className="arch-heading">System <br />Parameters</h1>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr,2fr] gap-32 border-t border-white/5 pt-32">

                    {/* Navigation Sidebar */}
                    <div className="space-y-16">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => setActiveTab(section.label.toLowerCase())}
                                className={`arch-detail-line group cursor-pointer transition-all ${activeTab === section.label.toLowerCase() ? 'border-white opacity-100' : 'opacity-40 hover:opacity-100'}`}
                            >
                                <span className="arch-number block mb-4">{section.id}</span>
                                <h3 className="text-3xl font-light text-white uppercase tracking-tight mb-2">
                                    {section.label}
                                </h3>
                                <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">{section.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[600px] p-16 bg-zinc-950/20 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none italic text-6xl uppercase">{activeTab}</div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 max-w-2xl"
                                >
                                    <h2 className="text-4xl font-light text-white uppercase tracking-tighter italic">Credential_Sync</h2>
                                    <form onSubmit={handlePasswordChange} className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="arch-label">CURRENT_KEY</label>
                                            <input
                                                type="password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="arch-label">NEW_ALLOCATION</label>
                                            <input
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="arch-label">CONFIRM_ALLOCATION</label>
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                            />
                                        </div>
                                        <button className="h-24 px-16 bg-white text-black font-bold uppercase tracking-[1em] text-[12px] transition-all hover:bg-zinc-200">
                                            COMMIT_SECURITY_UPDATE
                                        </button>
                                        {msg.text && (
                                            <div className={`p-8 border-l-2 ${msg.type === 'success' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' : 'border-red-500 bg-red-500/5 text-red-500'} text-[10px] font-bold uppercase tracking-[0.4em]`}>
                                                {msg.text}
                                            </div>
                                        )}
                                    </form>
                                </motion.div>
                            )}

                            {activeTab !== 'security' && (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-[400px] text-center"
                                >
                                    <Zap className="w-12 h-12 text-zinc-900 mb-8 animate-pulse" />
                                    <p className="arch-label">MODAL_PARAMETER_LOCKED</p>
                                    <p className="text-zinc-700 text-[10px] mt-4 uppercase tracking-[0.4em]">Awaiting high-level operational override.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sub-footer Metric Context */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">SYSTEM_INTEGRITY</span>
                    <h2 className="arch-heading mb-16 italic">Encrypted. Always.</h2>
                    <div className="flex justify-center gap-12 mt-24 opacity-20">
                        <Lock className="w-8 h-8" />
                        <Shield className="w-8 h-8" />
                        <Zap className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Sub-footer Section */}
            <div className="border-t border-white/5 py-32 bg-black">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-900 uppercase">
                    <span>SECURITY_CLEARANCE_ALPHA</span>
                    <span>© 2026 PHOENIX_OS</span>
                </div>
            </div>
        </main>
    );
}
