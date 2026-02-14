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
        <div className="space-y-12">
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 border-l-4 border-red-500 bg-red-500/5 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-r-2xl backdrop-blur-3xl"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleCredentialsLogin} className="space-y-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">NEURAL_ID_AUTHENTICATOR</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-black/40 border border-white/5 w-full py-6 px-8 text-xl font-black text-white outline-none focus:border-white transition-all rounded-[32px] uppercase tracking-tighter placeholder:text-white/5 backdrop-blur-3xl"
                            placeholder="EMAIL_ADDR"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">ENCRYPTED_ACCESS_KEY</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-black/40 border border-white/5 w-full py-6 px-8 text-xl font-black text-white outline-none focus:border-white transition-all rounded-[32px] tracking-widest placeholder:text-white/5 backdrop-blur-3xl"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-white/20 hover:text-white cursor-pointer uppercase tracking-[0.4em] transition-all">
                        LOST_KEY? → RECOVER_NODE
                    </span>
                    {isLoading && <Loader2 className="w-6 h-6 animate-spin text-white/20" />}
                </div>

                <div className="space-y-6 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-24 bg-white text-black font-black uppercase tracking-[0.8em] text-[12px] rounded-full transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 shadow-2xl"
                    >
                        {isLoading ? "AUTHENTICATING..." : (t('auth.login.initSession')?.toUpperCase() || "INITIALIZE_SESSION")}
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-20 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.6em] text-[10px] flex items-center justify-center gap-6 transition-all hover:bg-white hover:text-black rounded-full active:scale-95 shadow-xl"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        OAUTH_GOOGLE_LINK
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
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-64 group"
                >
                    <div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">SECURE_AUTHENTICATION_NODE</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">{t('audit.welcomeBack').split(' ')[0]} <br /><span className="text-white/20 italic">{t('audit.welcomeBack').split(' ').slice(1).join(' ')}.</span></h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-2xl md:text-3xl font-bold text-white/40 leading-tight max-w-xl md:text-right md:ml-auto uppercase tracking-tighter opacity-80">
                            {t('auth.login.subtitle_part1')} <strong className="text-white">{t('auth.login.subtitle_highlight')}</strong>. {t('auth.login.subtitle_part2')}
                        </p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr,1.5fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

                    {/* Left: Security Brief */}
                    <div className="space-y-32">
                        <div className="space-y-16">
                            {[
                                { id: "01", title: t('auth.login.feature1_title'), desc: t('auth.login.feature1_desc') },
                                { id: "02", title: t('auth.login.feature2_title'), desc: t('auth.login.feature2_desc') }
                            ].map((item) => (
                                <div key={item.id} className="group border-b border-white/5 pb-16 last:border-0 hover:border-white/20 transition-all duration-700">
                                    <span className="text-6xl font-black text-white/[0.03] group-hover:text-white/10 transition-all tracking-tighter tabular-nums leading-none block mb-6">0{item.id.replace('0', '')}</span>
                                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter group-hover:pl-4 group-hover:italic transition-all duration-700 leading-none">{item.title}</h3>
                                    <p className="text-white/30 text-[13px] font-bold uppercase tracking-widest leading-loose max-w-sm group-hover:text-white/60 transition-colors uppercase">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12">
                            <Link href="/signup" className="group block">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">NEW_OPERATIVE_ENROLLMENT</span>
                                <span className="text-4xl font-black text-white flex items-center gap-8 uppercase tracking-tighter group-hover:pl-8 group-hover:italic transition-all duration-700 leading-none">
                                    {t('auth.login.createAccount')} <ArrowRight className="w-12 h-12 group-hover:translate-x-6 transition-transform text-white/40" />
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Login Box */}
                    <div className="p-10 md:p-16 bg-zinc-950/40 rounded-[64px] border border-white/5 shadow-2xl backdrop-blur-3xl relative overflow-hidden group hover:border-white/10 transition-all duration-1000">
                        <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white/10" /></div>}>
                            <div className="space-y-24">
                                <div className="flex justify-between items-center pb-8 border-b border-white/5">
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter group-hover:pl-6 group-hover:italic transition-all duration-700 leading-none">Access_Port_Link</h2>
                                    <div className="px-6 py-3 bg-white/5 rounded-full flex items-center gap-4 border border-white/10 group-hover:border-white/30 transition-all">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black text-emerald-500 tracking-[0.6em] uppercase">SECURE_ENCRYPTION_ACTIVE</span>
                                    </div>
                                </div>
                                <LoginForm />
                            </div>
                        </Suspense>
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">SECURE_BY_DESIGN_DOMAIN</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">Phoenix OS.</h2>
                </div>
            </div>
        </main>
    );
}
