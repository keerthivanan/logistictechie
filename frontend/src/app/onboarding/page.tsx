'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight, Loader2, HelpCircle, Shield, Lock } from 'lucide-react'
import Prism from '@/components/visuals/Prism'

export default function OnboardingPage() {
    const { user, refreshProfile } = useAuth()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        user_name: '',
        discovery_source: '',
        goals: ''
    })

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, user_name: user.name }))
            if (user.onboarding_completed) {
                router.push('/dashboard')
            }
        }
    }, [user])

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/auth/onboarding-submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                await refreshProfile()
                router.push('/dashboard')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Prism />
            </div>

            <div className="max-w-xl w-full p-8 relative z-10">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center space-x-2 mb-6">
                        <div className="w-1.5 h-6 bg-white rounded-full"></div>
                        <span className="text-xl font-black tracking-[0.3em] uppercase">Enrollment</span>
                    </div>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-white' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900/80 border border-white/10 p-10 rounded-3xl backdrop-blur-2xl"
                        >
                            <h2 className="text-3xl font-black mb-4 italic">Welcome to the Network.</h2>
                            <p className="text-zinc-400 text-sm mb-8">Confirm your Sovereign Identity handle for the OMEGO ledger.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={formData.user_name}
                                        onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-xl font-bold focus:border-white outline-none transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="relative p-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-blue-500" />
                                            Permanent Network Identity
                                        </p>
                                        <p className="text-2xl font-black text-white tracking-[0.3em] font-mono italic">
                                            {user?.sovereign_id}
                                        </p>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <Lock className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-scan"></div>
                                </div>
                                <button
                                    onClick={nextStep}
                                    className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
                                >
                                    CONTINUE <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900/80 border border-white/10 p-10 rounded-3xl backdrop-blur-2xl"
                        >
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <HelpCircle className="text-white w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 italic">Discovery.</h2>
                            <p className="text-zinc-400 text-sm mb-8">How did you initiate contact with the OMEGO Logistics Network?</p>

                            <div className="space-y-4">
                                {[
                                    'Google Search / Organic',
                                    'Industry Reference',
                                    'Social Intelligence (LinkedIn/X)',
                                    'Sovereign Marketing Node',
                                    'Other Intelligence Source'
                                ].map(option => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setFormData({ ...formData, discovery_source: option })
                                            nextStep()
                                        }}
                                        className={`w-full text-left p-5 rounded-xl border transition-all font-bold ${formData.discovery_source === option ? 'bg-white text-black border-white' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                                <button onClick={prevStep} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-colors">Go Back</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-zinc-900/80 border border-white/10 p-10 rounded-3xl backdrop-blur-2xl"
                        >
                            <h2 className="text-3xl font-black mb-4 italic">Operational Goals.</h2>
                            <p className="text-zinc-400 text-sm mb-8">What is your primary objective within the OMEGO ecosystem?</p>

                            <div className="space-y-6">
                                <textarea
                                    value={formData.goals}
                                    onChange={e => setFormData({ ...formData, goals: e.target.value })}
                                    className="w-full bg-black border border-white/10 p-6 rounded-xl text-lg font-medium focus:border-white outline-none transition-all h-32 resize-none"
                                    placeholder="e.g. Optimizing trans-pacific corridor costs, carbon neutrality tracking..."
                                />

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !formData.goals}
                                    className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : <>FINALIZE ENROLLMENT <CheckCircle2 className="w-4 h-4" /></>}
                                </button>
                                <button onClick={prevStep} className="w-full text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-colors">Go Back</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
