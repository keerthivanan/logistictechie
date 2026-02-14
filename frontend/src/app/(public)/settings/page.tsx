"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock, Bell, Globe, ArrowLeft, Check, Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "@/lib/logistics";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { t } = useLanguage();
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
            const apiUrl = BACKEND_URL.replace('/api', '');
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
        { id: "01", label: t('settings.security.title').toUpperCase(), value: 'security', icon: Lock, desc: t('settings.security.desc') },
        { id: "02", label: t('settings.notifications.title').toUpperCase(), value: 'notifications', icon: Bell, desc: t('settings.notifications.desc') },
        { id: "03", label: t('settings.language.title').toUpperCase(), value: 'localization', icon: Globe, desc: t('settings.language.desc') }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-64 group"
                >
                    <div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">SYSTEM_CONFIGURATION_INTERFACE</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            {t('audit.sysParams').split(' ')[0]} <br /><span className="text-white/20 italic">{t('audit.sysParams').split(' ').slice(1).join(' ')}.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="bg-zinc-950/40 border border-white/5 rounded-[48px] p-10 backdrop-blur-3xl group-hover:border-white/10 transition-all duration-700">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-6 block">SECURE_CLEARANCE_ALPHA</span>
                            <div className="flex items-center gap-6">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                <p className="text-3xl font-black uppercase tracking-tighter text-white italic">INTEGRITY_SHIELD_V4</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-[1.2fr,2fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative group/mesh">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

                    {/* Navigation Sidebar - Tactical List */}
                    <div className="space-y-8">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => setActiveTab(section.value)}
                                className={cn(
                                    "bg-zinc-950/40 rounded-[48px] border p-12 flex items-center gap-12 group/nav cursor-pointer backdrop-blur-3xl transition-all duration-700",
                                    activeTab === section.value ? "border-white bg-white/5 scale-105" : "border-white/5 opacity-40 hover:opacity-100 hover:border-white/20 shadow-none"
                                )}
                            >
                                <span className="text-6xl font-black text-white/[0.03] group-hover/nav:text-white/10 transition-colors tracking-tighter tabular-nums leading-none">0{section.id.replace('0', '')}</span>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter group-hover/nav:pl-4 group-hover/nav:italic transition-all duration-700 leading-none">
                                        {section.label}
                                    </h3>
                                    <p className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase group-hover/nav:text-white/40 transition-colors">{section.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Area - Tactical Dashboard Fragment */}
                    <div className="min-h-[600px] bg-zinc-950/40 border border-white/5 rounded-[64px] p-12 md:p-20 relative overflow-hidden backdrop-blur-3xl shadow-2xl group hover:border-white/10 transition-all duration-1000">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none italic text-7xl font-black tracking-tighter uppercase text-white">{activeTab}_CONTEXT</div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-16 max-w-2xl relative z-10"
                                >
                                    <div className="pb-8 border-b border-white/5">
                                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">{t('settings.security.title')} Sync</h2>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em] mt-4">CREDENTIAL_SYNCHRONIZATION_PROTOCOL</p>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-12">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">{t('settings.security.currentPwd').toUpperCase().replace(' ', '_')}</label>
                                            <input
                                                type="password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="bg-black/40 border border-white/5 w-full py-6 px-8 text-2xl font-black text-white italic outline-none focus:border-white transition-all rounded-[32px] uppercase tracking-tighter placeholder:text-white/5 backdrop-blur-3xl"
                                                placeholder="CURRENT_KEY"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">{t('settings.security.newPwd').toUpperCase().replace(' ', '_')}</label>
                                            <input
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                className="bg-black/40 border border-white/5 w-full py-6 px-8 text-2xl font-black text-white italic outline-none focus:border-white transition-all rounded-[32px] uppercase tracking-tighter placeholder:text-white/5 backdrop-blur-3xl"
                                                placeholder="NEW_ALLOCATION"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">CONFIRM_NEW_KEY_PARITY</label>
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="bg-black/40 border border-white/5 w-full py-6 px-8 text-2xl font-black text-white italic outline-none focus:border-white transition-all rounded-[32px] uppercase tracking-tighter placeholder:text-white/5 backdrop-blur-3xl"
                                                placeholder="VERIFY_PARITY"
                                            />
                                        </div>
                                        <div className="pt-8">
                                            <button className="h-24 px-20 bg-white text-black font-black uppercase tracking-[1em] text-[12px] transition-all hover:bg-zinc-200 rounded-full shadow-2xl active:scale-95">
                                                {t('settings.security.update').toUpperCase().replace(' ', '_')}
                                            </button>
                                        </div>
                                        {msg.text && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-10 rounded-[32px] border-l-4 ${msg.type === 'success' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' : 'border-red-500 bg-red-500/5 text-red-500'} text-[11px] font-black uppercase tracking-[0.6em] backdrop-blur-3xl`}
                                            >
                                                {msg.text}
                                            </motion.div>
                                        )}
                                    </form>
                                </motion.div>
                            )}

                            {activeTab !== 'security' && (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-[500px] text-center"
                                >
                                    <div className="p-16 bg-white shadow-2xl shadow-white/5 rounded-full mb-12 animate-pulse">
                                        <Zap className="w-16 h-16 text-black fill-black" />
                                    </div>
                                    <p className="text-[12px] font-black text-white uppercase tracking-[1em] mb-4">{t('settingsPage.lockedLabel')}</p>
                                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">{t('settingsPage.overrideLabel')}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">SYSTEM_INTEGRITY_SHIELD</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">{t('legal.privacy.security_title')}</h2>
                    <div className="flex justify-center gap-16 mt-24 opacity-20">
                        <Lock className="w-12 h-12 hover:text-white transition-colors cursor-crosshair" />
                        <Shield className="w-12 h-12 hover:text-white transition-colors cursor-crosshair" />
                        <Zap className="w-12 h-12 hover:text-white transition-colors cursor-crosshair" />
                    </div>
                </div>
            </div>

            {/* Sub-footer Metric Array */}
            <div className="border-t border-white/5 py-32 bg-black">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-black tracking-[1.2em] text-white/5 uppercase">
                    <span>SECURITY_LEVEL_P7_CERTIFIED</span>
                    <span>© 2026 PHOENIX_LOGISTICS_OS</span>
                </div>
            </div>
        </main>
    );
}
