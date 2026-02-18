'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'
import Prism from '@/components/visuals/Prism'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
    const { login } = useAuth()
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

            // Store Token via Unified Context (G.O.A.T. Standard)
            login(data.access_token, data.user_name)

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
            <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen pointer-events-none">
                <Prism />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-zinc-950 pointer-events-none"></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center space-x-2 group mb-8">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-4 bg-white rounded-sm"></div>
                            <div className="w-2 h-4 bg-white/70 rounded-sm"></div>
                            <div className="w-2 h-4 bg-white/40 rounded-sm"></div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">OMEGO</span>
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

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-gray-500 font-bold tracking-tighter">Enter the Sovereign Network</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    setIsLoading(true);
                                    try {
                                        if (!credentialResponse.credential) throw new Error("No Google Token received");

                                        const res = await fetch(`${API_URL}/api/auth/social-sync`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                id_token: credentialResponse.credential,
                                                provider: "google"
                                            })
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            login(data.access_token, data.user_name);
                                            router.push('/dashboard');
                                        } else {
                                            throw new Error(data.detail || "Google Sign-In failed");
                                        }
                                    } catch (e: any) {
                                        setError(e.message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                onError={() => {
                                    setError('Google Sign-In Failed');
                                }}
                                theme="filled_black"
                                shape="rectangular"
                                width="350px"
                                use_fedcm_for_prompt={true}
                            />
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account? <Link href="/signup" className="text-white font-bold hover:underline">Sign up</Link>
                        </p>
                    </div>
                </div >
            </div >
        </div >
    )
}
