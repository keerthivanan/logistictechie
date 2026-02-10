"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await axios.post(`${apiUrl}/api/auth/login`, {
                email: email,
                password: password
            });

            if (response.data.access_token) {
                localStorage.setItem("token", response.data.access_token);
                localStorage.setItem("user_id", response.data.user_id);
                localStorage.setItem("user_name", response.data.user_name);
                // Notify Navbar to update immediately
                window.dispatchEvent(new Event('auth-change'));
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error("Login Failed", error);
            setError(error.response?.data?.detail || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black px-6">
            <div className="w-full max-w-md">
                <Card className="p-8 bg-zinc-900/50 border-zinc-800 rounded-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex h-14 w-14 items-center justify-center bg-white rounded-xl mb-4">
                            <Lock className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-zinc-500 text-sm">Sign in to your account to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <div className="space-y-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-zinc-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-zinc-500 hover:text-white transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-zinc-100 text-black h-12 rounded-lg font-semibold transition-all mb-6"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : "Sign In"}
                    </Button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-zinc-900/50 px-4 text-zinc-500">or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        variant="outline"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 rounded-lg transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </Button>

                    {/* Footer */}
                    <div className="text-center mt-8 pt-6 border-t border-zinc-800">
                        <span className="text-zinc-500 text-sm">Don&apos;t have an account? </span>
                        <Link href="/signup" className="text-white text-sm font-medium hover:underline">
                            Sign up
                        </Link>
                    </div>
                </Card>

                <Link href="/" className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white text-sm mt-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to home
                </Link>
            </div>
        </main>
    );
}
