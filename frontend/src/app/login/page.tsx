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
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/auth/social-sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: tokenResponse.access_token,
                        provider: "google"
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    login(data.access_token, data.user_name, data.onboarding_completed, data.sovereign_id, data.avatar_url, data.user_id);

                    if (returnUrl) {
                        router.push(decodeURIComponent(returnUrl));
                    } else {
                        router.push('/');
                    }
                } else {
                    throw new Error(data.detail || "Google Sign-In failed");
                }
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError('Google Sign-In Failed');
        }
    });

    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <Prism />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none"></div>

            <div className="w-full max-w-sm p-8 relative z-10">

                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center space-x-2 group mb-10">
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-4 bg-white rounded-sm"></div>
                            <div className="w-1.5 h-4 bg-white/70 rounded-sm"></div>
                            <div className="w-1.5 h-4 bg-white/40 rounded-sm"></div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white font-outfit uppercase">Omego</span>
                    </Link>
                    <h1 className="text-4xl font-bold mb-3 font-outfit uppercase tracking-tight">Access Protocol</h1>
                    <p className="text-zinc-500 font-medium font-inter text-sm">Enter the global knowledge network.</p>
                </div>


                <div className="bg-zinc-950 border border-white/5 p-10 rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/10">
                    <div className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center font-inter">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-full flex justify-center">
                                <button
                                    onClick={() => googleLogin()}
                                    disabled={isLoading}
                                    className="relative group w-full flex items-center justify-center gap-4 px-6 py-4 bg-white text-black rounded-2xl hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95"
                                >
                                    {/* Google G Logo SVG */}
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="font-bold text-black text-xs uppercase tracking-[0.2em] font-inter">
                                        {isLoading ? 'Connecting...' : 'Authorize Client'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest leading-loose">
                            By accessing the network, you agree to <br />
                            <Link href="#" className="text-zinc-400 hover:text-white transition-colors underline decoration-white/5">Sovereign Data Protocols</Link>
                        </p>
                    </div>
                </div >
            </div >
        </div >
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Initializing Secure Link...</div>}>
            <LoginContent />
        </Suspense>
    )
}
