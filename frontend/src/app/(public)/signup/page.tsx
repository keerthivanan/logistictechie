"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, Loader2, ArrowLeft, Mail, User, Lock } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async () => {
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await axios.post(`${apiUrl}/api/auth/register`, {
                full_name: name,
                email: email,
                password: password
            });

            if (response.data.success) {
                router.push('/login');
            }
        } catch (error: any) {
            console.error("Signup Failed", error);
            setError(error.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black px-6 py-12">
            <div className="w-full max-w-md">
                <Card className="p-8 bg-zinc-900/50 border-zinc-800 rounded-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex h-14 w-14 items-center justify-center bg-white rounded-xl mb-4">
                            <UserPlus className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-zinc-500 text-sm">Get started with free access to shipping quotes</p>
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
                            <label className="text-sm font-medium text-zinc-300">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    placeholder="John Smith"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-zinc-500"
                                />
                            </div>
                        </div>
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
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-zinc-500"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSignup}
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-zinc-100 text-black h-12 rounded-lg font-semibold transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : "Create Account"}
                    </Button>

                    {/* Footer */}
                    <div className="text-center mt-8 pt-6 border-t border-zinc-800">
                        <span className="text-zinc-500 text-sm">Already have an account? </span>
                        <Link href="/login" className="text-white text-sm font-medium hover:underline">
                            Sign in
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
