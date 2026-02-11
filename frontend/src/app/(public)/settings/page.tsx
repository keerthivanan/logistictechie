"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, Lock, Globe, Shield, ArrowLeft, LogOut, Zap, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { language, setLanguage, t, direction } = useLanguage();
    const isRTL = direction === 'rtl';
    const [loading, setLoading] = useState(false);

    // Password state
    const [passwords, setPasswords] = useState({ current: "", new: "" });
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState("");

    // Notification state
    const [notifications, setNotifications] = useState({
        email: true,
        shipment: true,
        marketing: false
    });

    React.useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated" && session?.user) {
            const fetchProfile = async () => {
                try {
                    const token = (session.user as any).accessToken;
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                    const res = await axios.get(`${apiUrl}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.preferences) {
                        try {
                            const prefs = JSON.parse(res.data.preferences);
                            setNotifications(prev => ({ ...prev, ...prefs }));
                        } catch (e) {
                            console.error("Failed to parse preferences", e);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch profile", err);
                }
            };
            fetchProfile();
        }
    }, [status, session, router]);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    const handlePasswordUpdate = async () => {
        if (!passwords.current || !passwords.new || !session) return;
        setUpdatingPassword(true);
        setPasswordFeedback("");
        try {
            const token = (session.user as any).accessToken;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await axios.post(`${apiUrl}/api/auth/change-password`, {
                current_password: passwords.current,
                new_password: passwords.new
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPasswordFeedback("SUCCESS: Security Baseline Updated.");
            setPasswords({ current: "", new: "" });
        } catch (e: any) {
            setPasswordFeedback(e.response?.data?.detail || "PROTOCOL_ERROR: Update Inhibited.");
        } finally {
            setUpdatingPassword(false);
        }
    };

    const toggleNotification = async (key: keyof typeof notifications) => {
        if (!session) return;
        const newValue = !notifications[key];
        setNotifications({ ...notifications, [key]: newValue });

        try {
            const token = (session.user as any).accessToken;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await axios.put(`${apiUrl}/api/auth/update-profile`, {
                preferences: JSON.stringify({ ...notifications, [key]: newValue })
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            console.error("Failed to sync notifications", e);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden bg-grid-premium" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 pt-48 pb-48 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex flex-col mb-16">
                        <Button onClick={() => router.back()} variant="ghost" className="mb-12 p-0 text-zinc-700 hover:text-white hover:bg-transparent rounded-none h-12 w-fit font-black text-[10px] uppercase tracking-[0.4em]">
                            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-4 rotate-180' : 'mr-4'}`} /> REVERT_TO_NODE
                        </Button>
                        <h1 className="titan-text mb-4">
                            System. <br />
                            <span className="text-zinc-900 group">Parameters.</span>
                        </h1>
                        <div className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.8em] mt-8">OPERATIONAL_PROTOCOL_CONTROL</div>
                    </div>

                    <div className="grid gap-12">
                        {/* Language & Dialect */}
                        <div className="elite-card p-12 relative overflow-hidden group hover:bg-zinc-950/40 transition-all duration-700">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                <Globe className="h-24 w-24 text-white" />
                            </div>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="h-14 w-14 bg-zinc-900 flex items-center justify-center transition-all duration-700 group-hover:bg-white group-hover:text-black group-hover:rotate-12">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter transition-all duration-700 group-hover:translate-x-2">INTERFACE_DIALECT</h2>
                                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Select your primary neural interface language</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-8 bg-zinc-950 border border-white/5 group hover:border-white/10 transition-all duration-700">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-white uppercase tracking-[0.3em]">ACTIVE_TRANSLATION</div>
                                    <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em]">CURRENT_LOCALE: {language.toUpperCase()}</div>
                                </div>
                                <div className="flex gap-4">
                                    {['EN', 'AR'].map((lang) => (
                                        <Button
                                            key={lang}
                                            onClick={() => setLanguage(lang.toLowerCase() as any)}
                                            className={`h-16 px-10 rounded-none font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-700 ${language === lang.toLowerCase()
                                                    ? 'bg-white text-black'
                                                    : 'bg-zinc-950 text-zinc-800 border-white/5 border hover:text-white'
                                                }`}
                                        >
                                            {lang}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Security Keys */}
                        <div className="elite-card p-12 relative overflow-hidden group hover:bg-zinc-950/40 transition-all duration-700">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                <Shield className="h-24 w-24 text-white" />
                            </div>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="h-14 w-14 bg-zinc-900 flex items-center justify-center transition-all duration-700 group-hover:bg-emerald-500 group-hover:text-black group-hover:-rotate-12">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter transition-all duration-700 group-hover:translate-x-2">SOVEREIGN_ENCRYPTION</h2>
                                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Rotate your strategic access credentials</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4 group/input">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within/input:text-emerald-500 transition-colors">PRIMARY_KEY</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-zinc-950/40 border border-white/5 h-16 px-8 text-white uppercase tracking-[0.4em] focus:border-white transition-all ring-0 outline-none rounded-none"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4 group/input">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within/input:text-emerald-500 transition-colors">NEW_SOVEREIGN_KEY</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-zinc-950/40 border border-white/5 h-16 px-8 text-white uppercase tracking-[0.4em] focus:border-white transition-all ring-0 outline-none rounded-none"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {passwordFeedback && (
                                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] text-center p-4 bg-zinc-950 border border-white/5 ${passwordFeedback.includes("SUCCESS") ? "text-emerald-500" : "text-emerald-900"}`}>
                                        {passwordFeedback}
                                    </p>
                                )}
                                <Button
                                    onClick={handlePasswordUpdate}
                                    disabled={updatingPassword}
                                    className="w-full h-20 bg-white text-black hover:bg-emerald-500 transition-all rounded-none font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_20px_60px_rgba(255,255,255,0.05)]"
                                >
                                    {updatingPassword ? "ROTATING_KEYS..." : "COMMIT_SECURITY_RECONFIG"}
                                </Button>
                            </div>
                        </div>

                        {/* Oracle Signals */}
                        <div className="elite-card p-12 relative overflow-hidden group hover:bg-zinc-950/40 transition-all duration-700">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                <Bell className="h-24 w-24 text-white" />
                            </div>
                            <div className="flex items-center gap-6 mb-12">
                                <div className="h-14 w-14 bg-zinc-900 flex items-center justify-center transition-all duration-700 group-hover:bg-amber-500 group-hover:text-black group-hover:rotate-12">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter transition-all duration-700 group-hover:translate-x-2">ORACLE_SIGNALS</h2>
                                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Manage real-time operational push telemetry</p>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {[
                                    { id: 'email', label: 'UNIVERSAL_EMAIL_LINK' },
                                    { id: 'shipment', label: 'TRANSIT_TELEMETRY' },
                                    { id: 'marketing', label: 'MARKET_INTELLIGENCE' }
                                ].map((note) => (
                                    <div key={note.id} className="flex items-center justify-between p-8 bg-zinc-950 border border-white/5 group/note hover:border-white/10 transition-all duration-500">
                                        <span className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px] group-hover/note:text-white transition-colors">{note.label}</span>
                                        <Switch
                                            checked={notifications[note.id as keyof typeof notifications]}
                                            onCheckedChange={() => toggleNotification(note.id as keyof typeof notifications)}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Session Termination */}
                        <div className="p-16 border-2 border-emerald-900/10 bg-emerald-950/5 relative group overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                                <div className="text-center md:text-left space-y-4">
                                    <h2 className="text-3xl font-black text-emerald-950 uppercase italic tracking-tighter">TERMINATE_SESSION</h2>
                                    <p className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.4em] max-w-sm leading-loose">Disconnect all strategic nodes and clear local identity cache.</p>
                                </div>
                                <Button
                                    onClick={handleLogout}
                                    className="h-20 px-16 bg-white text-black hover:bg-emerald-950 hover:text-white transition-all duration-700 rounded-none font-black text-[11px] uppercase tracking-[0.8em] flex items-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                                >
                                    <LogOut className="h-5 w-5" /> DISCONNECT
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
