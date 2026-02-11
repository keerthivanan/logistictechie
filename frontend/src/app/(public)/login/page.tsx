"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, Mail, ShieldCheck, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam === "CredentialsSignin") {
            setError("INVALID_PROTOCOL: Access Denied.");
        } else if (errorParam) {
            setError("SECURITY_BREACH: Authentication failure.");
        }
    }, [searchParams]);

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
                setError("DENIED: Credentials Mismatch.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("SYSTEM_OFFLINE: Connection failure.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="elite-card p-10 md:p-16 relative overflow-hidden group">
            {/* Status Line */}
            <div className="flex items-center justify-between mb-16 opacity-50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Node_Secure</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">V2.0.48_ALPHA</span>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-10 p-5 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-4"
                    >
                        <Zap className="w-4 h-4 fill-black" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OAuth Protocol */}
            <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-16 rounded-none bg-white text-black hover:bg-emerald-500 transition-all duration-700 font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-6 mb-12"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" />
                </svg>
                AUTH_VIA_GOOGLE
            </Button>

            <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center text-white/5"><div className="w-full border-t border-current"></div></div>
                <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.8em] text-zinc-800 bg-black px-8">SECURE_CREDENTIALS</div>
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-10">
                <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-focus-within:text-emerald-500 transition-colors">Neural_Identity</label>
                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-white transition-colors" />
                        <Input
                            type="email"
                            required
                            placeholder="EMAIL_ADDR"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-16 pl-16 bg-zinc-950/40 border-white/5 rounded-none text-[11px] font-black uppercase tracking-[0.4em] placeholder:text-zinc-900 focus:border-white/20 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-focus-within:text-emerald-500 transition-colors">Access_Key</label>
                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-white transition-colors" />
                        <Input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-16 pl-16 bg-zinc-950/40 border-white/5 rounded-none text-[11px] font-black uppercase tracking-[0.4em] placeholder:text-zinc-900 focus:border-white/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 border border-zinc-800" />
                        <span>Stay_Linked</span>
                    </div>
                    <Link href="/forgot-password" title="Recover Access" className="hover:text-white transition-colors">
                        Lost_Key?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-20 rounded-none bg-emerald-500 text-black hover:bg-white transition-all duration-700 font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_20px_60px_rgba(16,185,129,0.1)]"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-4">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            VERIFYING...
                        </div>
                    ) : (
                        "INITIATE_SESSION"
                    )}
                </Button>
            </form>

            <div className="mt-16 pt-12 border-t border-white/5 flex flex-col items-center gap-8">
                <Link href="/signup" className="group flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 group-hover:text-zinc-400 transition-colors">Unauthorized?</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white py-3 px-8 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">CREATE_ACCOUNT</span>
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black px-8 py-24 selection:bg-emerald-500/30 overflow-hidden relative bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black pointer-events-none" />

            <div className="w-full max-w-[540px] relative z-10">
                {/* Branding Focus */}
                <div className="flex flex-col items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-24 h-24 bg-white flex items-center justify-center mb-12 shadow-[0_0_80px_rgba(255,255,255,0.1)]"
                    >
                        <ShieldCheck className="w-12 h-12 text-black" />
                    </motion.div>
                    <div className="text-center group">
                        <span className="text-[10px] font-black uppercase tracking-[1em] text-emerald-500 mb-6 block">SECURE_AUTHENTICATION_NODE</span>
                        <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                            Phoenix<span className="text-zinc-900 group-hover:text-white transition-colors duration-1000">Logistics</span>
                        </h1>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="elite-card h-[600px] flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-white/10" />
                    </div>
                }>
                    <LoginForm />
                </Suspense>

                {/* Tactical Footer */}
                <div className="flex justify-center mt-20 gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800">
                    <Link href="/" className="hover:text-white transition-colors flex items-center gap-4">
                        <Globe className="w-4 h-4" /> LOCAL_HOME
                    </Link>
                    <button className="hover:text-white transition-colors">LEGAL_CORE</button>
                    <button className="hover:text-white transition-colors">NODE_SUPPORT</button>
                </div>
            </div>
        </main>
    );
}
