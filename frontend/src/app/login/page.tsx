'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || 'Login failed')
            }

            // Store Token
            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user_name', data.user_name)

            // Redirect to Dashboard
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center space-x-2 group mb-8">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-4 bg-white rounded-sm"></div>
                            <div className="w-2 h-4 bg-white/70 rounded-sm"></div>
                            <div className="w-2 h-4 bg-white/40 rounded-sm"></div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">FREIGHTOS</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                    <p className="text-gray-400">Enter your credentials to access your dashboard.</p>
                </div>

                <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-300">Password</label>
                                <Link href="#" className="text-sm text-gray-500 hover:text-white">Forgot password?</Link>
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="block w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-all text-center disabled:opacity-50"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-gray-500 font-bold tracking-tighter">Identity Sync Protocol</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    // SIMULATED SOCIAL SYNC (Hits the actual backend social-sync endpoint)
                                    const dev_email = "keerthivanan.ds.ai@gmail.com";
                                    const res = await fetch(`${API_URL}/api/auth/social-sync`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            email: dev_email,
                                            name: "Keerthivanan (Social)",
                                            provider: "google"
                                        })
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        localStorage.setItem('token', data.access_token);
                                        localStorage.setItem('user_name', data.user_name);
                                        router.push('/dashboard');
                                    } else {
                                        throw new Error(data.detail || "Social sync failed");
                                    }
                                } catch (e: any) {
                                    setError(e.message);
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            className="w-full bg-black border border-white/10 text-white py-3 rounded-lg font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account? <Link href="/signup" className="text-white font-bold hover:underline">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
