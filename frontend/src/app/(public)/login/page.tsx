"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, Mail, ShieldCheck, Globe, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam === "CredentialsSignin") {
            setError(t('auth.errors.credentialsMismatch'));
        } else if (errorParam) {
            setError(t('auth.errors.unexpectedFailure'));
        }
    }, [searchParams, t]);

    const handleCredentialsLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t('auth.errors.credentialsMismatch'));
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError(t('auth.errors.offline'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="space-y-16">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-light text-white uppercase tracking-tight">Access_Port</h2>
                {isLoading && <Loader2 className="w-6 h-6 animate-spin text-white" />}
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-8 border-l border-white bg-white/5 text-white text-[10px] font-bold uppercase tracking-[0.4em]"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleCredentialsLogin} className="space-y-12">
                <div className="space-y-4">
                    <label className="arch-label">NEURAL_ID</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light text-white italic outline-none focus:border-white transition-all"
                        placeholder="EMAIL_ADDR"
                    />
                </div>

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

                <div className="flex justify-between items-center">
                    <Link href="/forgot-password" title="Recover Access" className="arch-label hover:text-white transition-colors">
                        LOST_KEY?
                    </Link>
                </div>

                <div className="space-y-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-24 bg-white text-black font-bold uppercase tracking-[1em] text-[12px] transition-all hover:bg-zinc-200"
                    >
                        {isLoading ? t('auth.login.authenticating') : t('auth.login.initSession')}
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-20 border border-white/10 text-white font-bold uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-6 transition-all hover:bg-white/5"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" />
                        </svg>
                        OAUTH_GOOGLE
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function LoginPage() {
    const { t } = useLanguage();

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
                        <span className="arch-label mb-12 block">AUTHENTICATION</span>
                        <h1 className="arch-heading">{t('audit.welcomeBack').split(' ')[0]} <br />{t('audit.welcomeBack').split(' ').slice(1).join(' ')}</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl">
                            {t('auth.login.subtitle_part1')} <strong className="text-white">{t('auth.login.subtitle_highlight')}</strong>. {t('auth.login.subtitle_part2')}
                        </p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr,1.5fr] gap-32 border-t border-white/5 pt-32">

                    {/* Left: Security Brief */}
                    <div className="space-y-32">
                        <div className="space-y-16">
                            {[
                                { id: "01", title: t('auth.login.feature1_title'), desc: t('auth.login.feature1_desc') },
                                { id: "02", title: t('auth.login.feature2_title'), desc: t('auth.login.feature2_desc') }
                            ].map((item) => (
                                <div key={item.id} className="arch-detail-line">
                                    <span className="arch-number block mb-4">{item.id}</span>
                                    <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">{item.title}</h3>
                                    <p className="text-zinc-500 max-w-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-24">
                            <Link href="/signup" className="group inline-flex items-center gap-6">
                                <span className="arch-label text-zinc-800 group-hover:text-white transition-colors">NEW_OPERATIVE?</span>
                                <span className="text-xl font-light italic text-white flex items-center gap-4">
                                    {t('auth.login.createAccount')} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Login Box */}
                    <div className="p-16 bg-zinc-950/20 border border-white/5 relative overflow-hidden">
                        <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white/10" /></div>}>
                            <LoginForm />
                        </Suspense>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">SECURE_BY_DESIGN</span>
                    <h2 className="arch-heading italic mb-16">Phoenix OS.</h2>
                </div>
            </div>
        </main>
    );
}
