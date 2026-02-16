'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
            const res = await fetch('http://localhost:8000/api/auth/login', {
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
