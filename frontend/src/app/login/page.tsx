'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_URL } from '@/lib/config'
import Prism from '@/components/visuals/Prism'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'

function LoginContent() {
    const { login } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnUrl = searchParams.get('returnUrl')

    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Login form state
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    // Signup form state
    const [signupName, setSignupName] = useState('')
    const [signupEmail, setSignupEmail] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [signupConfirm, setSignupConfirm] = useState('')

    const handleRedirect = () => {
        if (returnUrl) {
            const decoded = decodeURIComponent(returnUrl)
            const safeUrl = decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/'
            router.push(safeUrl)
        } else {
            router.push('/')
        }
    }

    // ── Google OAuth ──────────────────────────────────────────────────────────
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_URL}/api/auth/social-sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token, provider: 'google' })
                })
                const data = await res.json()
                if (res.ok) {
                    login(data.access_token, data.user_name, data.onboarding_completed, data.sovereign_id, data.role, data.avatar_url, data.user_id, data.user_email)
                    handleRedirect()
                } else {
                    throw new Error(data.detail || 'Google Sign-In failed')
                }
            } catch (e: any) {
                setError(e.message)
            } finally {
                setIsLoading(false)
            }
        },
        onError: () => setError('Google Sign-In failed. Try again.'),
    })

    // ── Manual Login ──────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!loginEmail || !loginPassword) { setError('Enter your email and password.'); return }
        setIsLoading(true)
        setError('')
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword })
            })
            const data = await res.json()
            if (res.ok) {
                login(data.access_token, data.user_name, data.onboarding_completed, data.sovereign_id, data.role, data.avatar_url, data.user_id, data.user_email)
                handleRedirect()
            } else {
                throw new Error(data.detail || 'Login failed')
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    // ── Manual Signup ─────────────────────────────────────────────────────────
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!signupName.trim()) { setError('Full name is required.'); return }
        if (!signupEmail.trim()) { setError('Email is required.'); return }
        if (signupPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
        if (!/[A-Z]/.test(signupPassword) || !/[a-z]/.test(signupPassword) || !/[0-9]/.test(signupPassword)) { setError('Password must contain uppercase, lowercase, and a number.'); return }
        if (signupPassword !== signupConfirm) { setError('Passwords do not match.'); return }

        setIsLoading(true)
        try {
            // Step 1: Register
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: signupName.trim(),
                    email: signupEmail.trim().toLowerCase(),
                    password: signupPassword,
                    confirm_password: signupConfirm,
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Registration failed')

            // Step 2: Auto-login with the same credentials
            const loginRes = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupEmail.trim().toLowerCase(), password: signupPassword })
            })
            const loginData = await loginRes.json()
            if (loginRes.ok) {
                login(loginData.access_token, loginData.user_name, loginData.onboarding_completed, loginData.sovereign_id, loginData.role, loginData.avatar_url, loginData.user_id, loginData.user_email)
                handleRedirect()
            } else {
                // Registration worked but auto-login failed — send to login page
                setSuccess('Account created! Please sign in.')
                setMode('login')
                setLoginEmail(signupEmail)
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    const switchMode = (next: 'login' | 'signup') => {
        setMode(next)
        setError('')
        setSuccess('')
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <Prism />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />

            <div className="w-full max-w-sm p-8 relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center space-x-2 group mb-8">
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-4 bg-white rounded-sm" />
                            <div className="w-1.5 h-4 bg-white/70 rounded-sm" />
                            <div className="w-1.5 h-4 bg-white/40 rounded-sm" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white font-outfit uppercase">CargoLink</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2 font-outfit uppercase tracking-tight">
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </h1>
                    <p className="text-zinc-500 font-medium font-inter text-xs">
                        {mode === 'login' ? 'Access the global freight network.' : 'Join the CargoLink platform.'}
                    </p>
                </div>

                <div className="bg-zinc-950 border border-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                    {/* Error / Success */}
                    {error && (
                        <div className="mb-5 p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center font-inter">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center font-inter">
                            {success}
                        </div>
                    )}

                    {/* Google Button */}
                    <button
                        onClick={() => googleLogin()}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black rounded-2xl hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95 mb-5"
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="font-bold text-black text-xs uppercase tracking-[0.15em] font-inter">
                            {isLoading ? 'Connecting...' : `Continue with Google`}
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">or</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* ── LOGIN FORM ── */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition font-inter"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition font-inter"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.15em] font-inter hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-1"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                    )}

                    {/* ── SIGNUP FORM ── */}
                    {mode === 'signup' && (
                        <form onSubmit={handleSignup} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Full name"
                                value={signupName}
                                onChange={e => setSignupName(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition font-inter"
                            />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={signupEmail}
                                onChange={e => setSignupEmail(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition font-inter"
                            />
                            <input
                                type="password"
                                placeholder="Password (min 8 characters)"
                                value={signupPassword}
                                onChange={e => setSignupPassword(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition font-inter"
                            />
                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={signupConfirm}
                                onChange={e => setSignupConfirm(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition font-inter"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.15em] font-inter hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-1"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        {mode === 'login' ? (
                            <p className="text-zinc-600 text-[10px] font-inter">
                                No account?{' '}
                                <Link href="/signup" className="text-zinc-300 hover:text-white transition-colors font-bold underline decoration-white/10">
                                    Create one
                                </Link>
                            </p>
                        ) : (
                            <p className="text-zinc-600 text-[10px] font-inter">
                                Already have an account?{' '}
                                <button onClick={() => switchMode('login')} className="text-zinc-300 hover:text-white transition-colors font-bold underline decoration-white/10">
                                    Sign in
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest leading-loose font-inter">
                            By continuing, you agree to{' '}
                            <Link href="/legal/terms" className="text-zinc-500 hover:text-white transition-colors underline decoration-white/5">Sovereign Data Protocols</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white text-xs font-inter uppercase tracking-widest">Initializing Secure Link...</div>}>
            <LoginContent />
        </Suspense>
    )
}
