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
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">ENROLLMENT</span>
                        <h1 className="arch-heading italic">{t('auth.signup.title').split('. ')[0]}. <br />{t('auth.signup.title').split('. ').slice(1).join(' ')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl">
                            {t('auth.signup.subtitle').split('global logistics nodes')[0]} <strong className="text-white">global logistics nodes</strong> {t('auth.signup.subtitle').split('global logistics nodes')[1]}
                        </p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr,1.5fr] gap-32 border-t border-white/5 pt-32">

                    {/* Left: Enrollment Intelligence */}
                    <div className="space-y-32">
                        <div className="space-y-16">
                            {[
                                { id: "01", title: t('auth.signup.feature1_title'), desc: t('auth.signup.feature1_desc') },
                                { id: "02", title: t('auth.signup.feature2_title'), desc: t('auth.signup.feature2_desc') },
                                { id: "03", title: t('auth.signup.feature3_title'), desc: t('auth.signup.feature3_desc') }
                            ].map((item) => (
                                <div key={item.id} className="arch-detail-line">
                                    <span className="arch-number block mb-4">{item.id}</span>
                                    <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">{item.title}</h3>
                                    <p className="text-zinc-500 max-w-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-24">
                            <Link href="/login" className="group inline-flex items-center gap-6">
                                <span className="arch-label text-zinc-800 group-hover:text-white transition-colors">{t('auth.signup.alreadyEnrolled')}</span>
                                <span className="text-xl font-light italic text-white flex items-center gap-4">
                                    {t('auth.signup.signIn')} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Enrollment Form */}
                    <div className="p-16 bg-zinc-950/20 border border-white/5 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-24 text-center space-y-12"
                                >
                                    <div className="w-24 h-24 border border-white flex items-center justify-center mx-auto">
                                        <ShieldCheck className="h-10 w-10 text-white" />
                                    </div>
                                    <h2 className="text-4xl font-light text-white uppercase italic tracking-tighter">{t('auth.signup.success.title')}</h2>
                                    <p className="arch-label">{t('auth.signup.success.subtitle')}</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-16"
                                >
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-4xl font-light text-white uppercase tracking-tight italic">Access_Request</h2>
                                        {isLoading && <Loader2 className="w-6 h-6 animate-spin text-white" />}
                                    </div>

                                    {error && (
                                        <div className="p-8 border-l border-white bg-white/5 text-white text-[10px] font-bold uppercase tracking-[0.4em]">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSignup} className="space-y-12">
                                        <div className="grid md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <label className="arch-label">NAME_IDENTIFIER</label>
                                                <input
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    required
                                                    className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                                    placeholder="NAME"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="arch-label">ENTITY_ID</label>
                                                <input
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                                    placeholder="ENTITY"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="arch-label">COMM_PROTO_EMAIL</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                                placeholder="EMAIL_ADDR"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <label className="arch-label">ACCESS_KEY</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="arch-label">VERIFY_KEY</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-24 bg-white text-black font-bold uppercase tracking-[1em] text-[12px] transition-all hover:bg-zinc-200"
                                        >
                                            {isLoading ? "ENUMERATING..." : "REQUEST_ACCESS"}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sub-footer Metric Context */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">GLOBAL_SYNC</span>
                    <h2 className="arch-heading mb-16 italic">Join.</h2>
                    <div className="flex justify-center gap-12 mt-24 opacity-20">
                        <Lock className="w-8 h-8" />
                        <ShieldCheck className="w-8 h-8" />
                        <Zap className="w-8 h-8" />
                    </div>
                </div>
            </div>
        </main>
    );
}
