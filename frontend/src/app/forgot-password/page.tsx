'use client'

import Link from 'next/link'
import { useState } from 'react'
import { apiFetch } from '@/lib/config'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await apiFetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            })
            if (res.ok) {
                setDone(true)
            } else {
                const data = await res.json().catch(() => ({}))
                setError(data.detail || 'Something went wrong. Please try again.')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
            <div className="w-full max-w-sm p-8">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-8">
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-4 bg-white rounded-sm" />
                            <div className="w-1.5 h-4 bg-white/70 rounded-sm" />
                            <div className="w-1.5 h-4 bg-white/40 rounded-sm" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white font-outfit uppercase">CargoLink</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2 font-outfit uppercase tracking-tight">Forgot Password</h1>
                    <p className="text-zinc-500 font-medium font-inter text-xs">Enter your email to receive a reset link.</p>
                </div>

                <div className="bg-zinc-950 border border-white/5 p-8 rounded-3xl shadow-2xl">
                    {done ? (
                        <div className="flex flex-col items-center gap-4 py-4 text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            <p className="text-sm font-bold text-white font-outfit">Check your inbox</p>
                            <p className="text-xs text-zinc-500 font-inter">If this email is registered, a reset link has been sent. Check your spam folder too.</p>
                            <Link href="/login" className="text-[10px] text-zinc-600 hover:text-white transition-colors font-inter mt-2">Back to login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center font-inter">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-inter">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-black border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors font-inter"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-white text-black font-bold text-xs py-3.5 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-30 flex items-center justify-center gap-2 font-inter uppercase tracking-widest mt-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                            </button>
                            <p className="text-center text-[10px] text-zinc-600 font-inter mt-2">
                                <Link href="/login" className="hover:text-white transition-colors">Back to login</Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
