"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, Mail, ShieldCheck, User, Building2, Globe, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SignupPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("PROTOCOL_ERROR: Passwords mismatch.");
            setIsLoading(false);
            return;
        }

        try {
            const apiUrl = BACKEND_URL.replace('/api', '');
            const response = await axios.post(`${apiUrl}/api/auth/register`, {
                email,
                password,
                confirm_password: confirmPassword,
                full_name: fullName,
                company_name: companyName
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "REGISTRATION_FAILURE: Access denied.");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">NEW_OPERATIVE_ENROLLMENT_PROTOCOL</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">{t('auth.signup.title').split('. ')[0]}. <br /><span className="text-white/20 italic">{t('auth.signup.title').split('. ').slice(1).join(' ')}.</span></h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl md:text-3xl font-bold text-white/40 leading-tight max-w-xl md:text-right md:ml-auto uppercase tracking-tighter opacity-80">
                            {t('auth.signup.subtitle').split('global logistics nodes')[0]} <strong className="text-white">global logistics nodes</strong> {t('auth.signup.subtitle').split('global logistics nodes')[1]}
                        </p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr,1.5fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

                    {/* Left: Enrollment Intelligence */}
                    <div className="space-y-32">
                        <div className="space-y-16">
                            {[
                                { id: "01", title: t('auth.signup.feature1_title'), desc: t('auth.signup.feature1_desc') },
                                { id: "02", title: t('auth.signup.feature2_title'), desc: t('auth.signup.feature2_desc') },
                                { id: "03", title: t('auth.signup.feature3_title'), desc: t('auth.signup.feature3_desc') }
                            ].map((item) => (
                                <div key={item.id} className="group border-b border-white/5 pb-16 last:border-0 hover:border-white/20 transition-all duration-700">
                                    <span className="text-6xl font-black text-white/[0.03] group-hover:text-white/10 transition-all tracking-tighter tabular-nums leading-none block mb-6">0{item.id.replace('0', '')}</span>
                                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter group-hover:pl-4 group-hover:italic transition-all duration-700 leading-none">{item.title}</h3>
                                    <p className="text-white/30 text-[13px] font-bold uppercase tracking-widest leading-loose max-w-sm group-hover:text-white/60 transition-colors">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12">
                            <Link href="/login" className="group block">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">{t('auth.signup.alreadyEnrolled')}</span>
                                <span className="text-4xl font-black text-white flex items-center gap-8 uppercase tracking-tighter group-hover:pl-8 group-hover:italic transition-all duration-700 leading-none">
                                    {t('auth.signup.signIn')} <ArrowRight className="w-12 h-12 group-hover:translate-x-6 transition-transform text-white/40" />
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Enrollment Form */}
                    <div className="p-10 md:p-16 bg-zinc-950/40 rounded-[64px] border border-white/5 shadow-2xl backdrop-blur-3xl relative overflow-hidden group hover:border-white/10 transition-all duration-1000">
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-32 text-center space-y-16"
                                >
                                    <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 group-hover:border-white/30 transition-all shadow-2xl">
                                        <ShieldCheck className="h-20 w-20 text-emerald-500" />
                                    </div>
                                    <div className="space-y-6">
                                        <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter group-hover:italic transition-all leading-none">{t('auth.signup.success.title')}</h2>
                                        <p className="text-[14px] font-black text-white/20 uppercase tracking-[1em]">{t('auth.signup.success.subtitle')}</p>
                                    </div>
                                    <div className="w-full max-w-sm mx-auto bg-white/5 h-[4px] rounded-full overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3, ease: "linear" }}
                                            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-24"
                                >
                                    <div className="flex justify-between items-center pb-8 border-b border-white/5">
                                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter group-hover:pl-6 group-hover:italic transition-all duration-700 leading-none">Access_Request_Portal</h2>
                                        <div className="px-6 py-3 bg-white/5 rounded-full flex items-center gap-4 border border-white/10 group-hover:border-white/30 transition-all">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] font-black text-emerald-500 tracking-[0.6em] uppercase">SECURE_SSL_PROTOCOL</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-8 border-l-4 border-red-500 bg-red-500/5 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-r-2xl backdrop-blur-3xl"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSignup} className="space-y-12">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">NAME_IDENTIFIER</label>
                                                <input
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    required
                                                    className="bg-black/40 border border-white/5 w-full py-6 px-8 text-xl font-black text-white outline-none focus:border-white transition-all rounded-[32px] uppercase tracking-tighter placeholder:text-white/5 backdrop-blur-3xl"
                                                    placeholder="NAME_NODE"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">ENTITY_ID</label>
                                                <input
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="bg-black/40 border border-white/5 w-full py-6 px-8 text-xl font-black text-white outline-none focus:border-white transition-all rounded-[32px] uppercase tracking-tighter placeholder:text-white/5 backdrop-blur-3xl"
                                                    placeholder="CORP_ENTITY"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">COMM_PROTOCOL_EMAIL</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-black/40 border border-white/5 w-full py-6 px-8 text-xl font-black text-white outline-none focus:border-white transition-all rounded-[32px] uppercase tracking-tighter placeholder:text-white/5 backdrop-blur-3xl"
                                                placeholder="EMAIL_COMM_LINK"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">ACCESS_SECURE_KEY</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="bg-black/40 border border-white/5 w-full py-6 px-8 text-xl font-black text-white outline-none focus:border-white transition-all rounded-[32px] tracking-widest placeholder:text-white/5 backdrop-blur-3xl"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">VERIFY_KEY_SYNC</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    className="bg-black/40 border border-white/5 w-full py-6 px-8 text-xl font-black text-white outline-none focus:border-white transition-all rounded-[32px] tracking-widest placeholder:text-white/5 backdrop-blur-3xl"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-28 bg-white text-black font-black uppercase tracking-[1em] text-[12px] rounded-full transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 mt-12 shadow-2xl"
                                        >
                                            {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-black" /> : "REQUEST_ACCESS_LINK"}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">GLOBAL_NETWORK_EXPANSION</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:text-white/40 transition-all duration-700 leading-none">Initialize.</h2>
                </div>
            </div>
        </main>
    );
}
