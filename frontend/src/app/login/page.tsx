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
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center relative overflow-hidden">
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


                <div className="bg-zinc-900 border border-white/10 p-10 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/20">
                    <div className="space-y-8">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-full flex justify-center">
                                <button
                                    onClick={() => googleLogin()}
                                    disabled={isLoading}
                                    className="relative group w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black border border-white/20 rounded-lg hover:bg-white/5 hover:border-white/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {/* Google G Logo SVG */}
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238510)">
                                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                        </g>
                                    </svg>
                                    <span className="font-medium text-white group-hover:text-white transition-colors text-sm">
                                        {isLoading ? 'Connecting...' : 'Continue with Google'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-zinc-500 text-[11px] leading-tight font-medium">
                            By accessing the network, you agree to the <br />
                            <Link href="#" className="text-zinc-300 hover:text-white transition-colors underline decoration-white/10">Sovereign Data Protocols</Link>
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
