"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, Mail, ShieldCheck, User, Building2, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function SignupPage() {
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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
        <main className="min-h-screen w-full flex items-center justify-center bg-black px-8 py-24 selection:bg-emerald-500/30 overflow-hidden relative bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black pointer-events-none" />

            <div className="w-full max-w-[580px] relative z-10">
                {/* Branding Focus */}
                <div className="flex flex-col items-center mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 mb-8"
                    >
                        <div className="w-8 h-[1px] bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">INITIATE_ENROLLMENT</span>
                        <div className="w-8 h-[1px] bg-emerald-500" />
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none mb-6">
                        Join the<span className="text-zinc-900">Sovereign.</span>
                    </h1>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] max-w-sm leading-loose">
                        Synchronizing global logistics nodes via encrypted neural link.
                    </p>
                </div>

                <div className="elite-card p-10 md:p-16 relative overflow-hidden group">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-12 text-center"
                            >
                                <div className="h-24 w-24 bg-white flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(255,255,255,0.1)]">
                                    <ShieldCheck className="h-12 w-12 text-black" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">DEPLOYMENT_SUCCESSFUL</h3>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Redirecting to authentication node...</p>
                            </motion.div>
                        ) : (
                            <>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="mb-10 p-5 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-4"
                                    >
                                        <Zap className="w-4 h-4 fill-black" />
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSignup} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-focus-within:text-emerald-500 transition-colors">Commander_Name</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                                                <Input
                                                    required
                                                    placeholder="NAME"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="h-14 pl-16 bg-zinc-950/40 border-white/5 rounded-none text-[10px] font-black uppercase tracking-[0.4em] placeholder:text-zinc-900 focus:border-white/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-focus-within:text-emerald-500 transition-colors">Entity_ID</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                                                <Input
                                                    placeholder="ENTITY"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="h-14 pl-16 bg-zinc-950/40 border-white/5 rounded-none text-[10px] font-black uppercase tracking-[0.4em] placeholder:text-zinc-900 focus:border-white/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 group">
                                        <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-focus-within:text-emerald-500 transition-colors">Neural_Link</label>
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                                            <Input
                                                type="email"
                                                required
                                                placeholder="EMAIL_ADDR"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-14 pl-16 bg-zinc-950/40 border-white/5 rounded-none text-[10px] font-black uppercase tracking-[0.4em] placeholder:text-zinc-900 focus:border-white/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-focus-within:text-emerald-500 transition-colors">Access_Key</label>
                                            <div className="relative">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                                                <Input
                                                    type="password"
                                                    required
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="h-14 pl-16 bg-zinc-950/40 border-white/5 rounded-none text-[10px] font-black uppercase tracking-[0.4em] placeholder:text-zinc-900 focus:border-white/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] group-focus-within:text-emerald-500 transition-colors">Verify_Key</label>
                                            <div className="relative">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                                                <Input
                                                    type="password"
                                                    required
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="h-14 pl-16 bg-zinc-950/40 border-white/5 rounded-none text-[10px] font-black uppercase tracking-[0.4em] placeholder:text-zinc-900 focus:border-white/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-20 rounded-none bg-white text-black hover:bg-emerald-500 transition-all duration-700 font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_20px_60px_rgba(255,255,255,0.05)] mt-8"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-black" />
                                        ) : "EXECUTE_ENROLLMENT"}
                                    </Button>
                                </form>

                                <div className="mt-16 pt-12 border-t border-white/5 text-center">
                                    <Link href="/login" className="group flex items-center justify-center gap-6">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-zinc-400 transition-colors">Existing_Identity?</span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white py-3 px-8 border border-white/10 group-hover:bg-emerald-500 group-hover:text-black transition-all">SIGN_IN</span>
                                    </Link>
                                </div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-center mt-20 gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800">
                    <button className="hover:text-white transition-colors">TERMS_CORE</button>
                    <button className="hover:text-white transition-colors">PRIVACY_PROTOCOL</button>
                    <button className="hover:text-white transition-colors flex items-center gap-4">
                        <Globe className="w-4 h-4" /> SECURE_OS
                    </button>
                </div>
            </div>
        </main>
    );
}
