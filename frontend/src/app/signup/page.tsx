'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'
import Prism from '@/components/visuals/Prism'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
    const { login } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')


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
                    <h1 className="text-3xl font-bold mb-2">Create an account</h1>
                    <p className="text-gray-400">Join the Sovereign Logistics Network.</p>
                </div>

                <div className="bg-zinc-900 border border-white/10 p-10 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="space-y-8 text-center">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Enrollment Open</span>
                        </div>

                        <h2 className="text-2xl font-black italic">Sovereign Identity.</h2>
                        <p className="text-sm text-zinc-500 leading-relaxed">Join the most advanced logistics ecosystem in the world. Verify your identity with Google to begin.</p>

                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-full flex justify-center py-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
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
                                                login(data.access_token, data.user_name, data.onboarding_completed, data.sovereign_id);

                                                if (!data.onboarding_completed) {
                                                    router.push('/onboarding');
                                                } else {
                                                    router.push('/dashboard');
                                                }
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
                                    width="320px"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-center space-x-2">
                            <span className="text-zinc-600 text-[11px] font-bold uppercase tracking-tighter">Already a citizen?</span>
                            <Link href="/login" className="text-white text-[11px] font-black uppercase tracking-tighter hover:underline">Sign In</Link>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    )
}
