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

                <div className="bg-zinc-900 border border-white/10 p-10 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="space-y-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="text-center space-y-4">
                            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white">Sovereign Access</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed">Identity verification required to access the OMEGO logistics network.</p>
                        </div>

                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-full flex justify-center py-4 bg-white/5 rounded-xl border border-white/10 group hover:border-white/20 transition-all">
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
                                    use_fedcm_for_prompt={true}
                                />
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Encrypted Identity Vault Active</span>
                                </div>
                                <span className="text-[9px] text-zinc-600 font-medium">OMEGO OS v4.2 Deployment (Social Only)</span>
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
