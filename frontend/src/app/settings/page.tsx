'use client'

import { useState, useEffect } from 'react'
import {
    Settings as SettingsIcon,
    ChevronLeft,
    Moon,
    Globe,
    Bell,
    Mail,
    Monitor,
    Check
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/visuals/Avatar'

export default function RebuiltSettingsPage() {
    const { user: authUser, loading: authLoading } = useAuth()
    const router = useRouter()

    // UI States
    const [language, setLanguage] = useState('en')
    const [emailNotifications, setEmailNotifications] = useState(true)

    // Identity States
    const [name, setName] = useState(authUser?.name || '')
    const [avatarUrl, setAvatarUrl] = useState(authUser?.avatar_url || '')
    const [imageError, setImageError] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/login')
            return
        }
        if (authUser) {
            setName(authUser.name)
            setAvatarUrl(authUser.avatar_url || '')
        }
    }, [authUser, authLoading])

    const handleUpdateIdentity = async () => {
        setIsUpdating(true)
        try {
            // Local state first for instant UX
            localStorage.setItem('user_name', name)
            localStorage.setItem('avatar_url', avatarUrl)

            // In a real app, we'd call the backend /api/auth/update-profile here
            // For now, we refresh the page to force the AuthContext to re-hydrate from localStorage
            window.location.reload()
        } catch (err) {
            console.error("Identity Sync Failure:", err)
        } finally {
            setIsUpdating(false)
        }
    }

    if (authLoading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="w-6 h-6 border-2 border-white/5 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 overflow-hidden">
            <div className="max-w-4xl w-full">
                {/* 1. Precise Navigation */}
                <div className="mb-6">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase font-inter">Return to Intel</span>
                    </Link>
                </div>

                {/* 2. Page Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center">
                        <SettingsIcon className="w-5 h-5 text-zinc-400 font-bold" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight font-outfit uppercase">Operational Config</h1>
                        <p className="text-[10px] text-zinc-600 font-medium tracking-wide font-inter">Synchronizing node preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Profile Intel */}
                    <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Monitor className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit">Profile Identity</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <Avatar
                                            src={avatarUrl}
                                            name={name}
                                            size="lg"
                                            className="border-white/5 shadow-xl"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-black border border-white/10 p-1 rounded-full cursor-help">
                                            <SettingsIcon className="w-2.5 h-2.5 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-1">
                                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Node Identifier</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold focus:border-emerald-500/50 outline-none transition-colors font-inter"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Visual Protocol (URL)</label>
                                            <input
                                                type="text"
                                                value={avatarUrl}
                                                onChange={(e) => {
                                                    setAvatarUrl(e.target.value)
                                                    setImageError(false)
                                                }}
                                                className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold focus:border-emerald-500/50 outline-none transition-colors font-inter"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUpdateIdentity}
                            disabled={isUpdating}
                            className="w-full bg-white text-black py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-inter active:scale-95 disabled:opacity-50 mt-4"
                        >
                            {isUpdating ? 'Indexing...' : 'Commit Changes'}
                        </button>
                    </section>

                    {/* Right Column: Preferences */}
                    <div className="space-y-4">
                        {/* Appearance section */}
                        <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Moon className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit">Appearance</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-[11px] mb-0.5 font-inter">Interface Language</p>
                                        <p className="text-[9px] text-zinc-600 font-medium font-inter tracking-tight">Primary terminal dialect</p>
                                    </div>
                                    <div className="flex bg-black p-1 rounded-xl border border-white/5">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${language === 'en'
                                                ? 'bg-zinc-800 text-white'
                                                : 'text-zinc-600 hover:text-zinc-400'
                                                } font-inter`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => setLanguage('ar')}
                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${language === 'ar'
                                                ? 'bg-zinc-800 text-white'
                                                : 'text-zinc-600 hover:text-zinc-400'
                                                } font-inter`}
                                        >
                                            العربية
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Notifications section */}
                        <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Bell className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit">Telemetry</h2>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-[11px] mb-0.5 font-inter">Signal Alerts</p>
                                    <p className="text-[9px] text-zinc-600 font-medium font-inter tracking-tight">Email frequency status</p>
                                </div>

                                <button
                                    onClick={() => setEmailNotifications(!emailNotifications)}
                                    className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${emailNotifications ? 'bg-emerald-500' : 'bg-zinc-900'
                                        }`}
                                >
                                    <motion.div
                                        animate={{ x: emailNotifications ? 20 : 0 }}
                                        className="w-4 h-4 bg-white rounded-full shadow-md"
                                    />
                                </button>
                            </div>
                        </section>

                        {/* Audit Info */}
                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest font-inter">Sync Status: Optimal</p>
                            </div>
                            <p className="text-[8px] text-zinc-700 font-bold font-inter">L-14 PROTOCOL</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
