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

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const firstName = formData.get('firstName') as string
        const lastName = formData.get('lastName') as string
        const full_name = `${firstName} ${lastName}`

        const data = {
            full_name: full_name,
            email: formData.get('email'),
            password: password,
            confirm_password: password, // Auto-confirming for simplicity
            company_name: formData.get('company') || 'New User Organization'
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.detail || 'Signup failed')
            }

            // Success -> Go to Login
            router.push('/login?registered=true')
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
                    <h1 className="text-3xl font-bold mb-2">Create an account</h1>
                    <p className="text-gray-400">Join the Sovereign Logistics Network.</p>
                </div>

                <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <form className="space-y-6" onSubmit={handleSignup}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">First Name</label>
                                <input name="firstName" type="text" required className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-white transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">Last Name</label>
                                <input name="lastName" type="text" required className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-white transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">Work Email</label>
                            <input name="email" type="email" required className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-white transition-colors" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">Company Name</label>
                            <input name="company" type="text" className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-white transition-colors" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">Password</label>
                            <input name="password" type="password" required className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:border-white transition-colors" />
                        </div>

                        <div className="flex items-center">
                            <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-black focus:ring-white" />
                            <span className="ml-2 text-sm text-gray-400">I agree to the <Link href="/legal/terms" className="text-white hover:underline">Terms</Link> and <Link href="/legal/privacy" className="text-white hover:underline">Privacy Policy</Link></span>
                        </div>

                        <button type="submit" disabled={isLoading} className="block w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-all text-center disabled:opacity-50">
                            {isLoading ? 'Creating Account...' : 'Create Account'}
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
                                            throw new Error(data.detail || "Google Sign-Up failed");
                                        }
                                    } catch (e: any) {
                                        setError(e.message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                onError={() => {
                                    setError('Google Sign-Up Failed');
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
                            Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div >
            </div >
        </div >
    )
}
