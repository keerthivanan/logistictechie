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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
            <div className="w-10 h-10 border-2 border-white/5 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 px-4 pb-40">
            <div className="max-w-4xl mx-auto">

                {/* 1. Back to Profile Link */}
                <Link
                    href="/profile"
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-widest uppercase">Back to Profile</span>
                </Link>

                {/* 2. Page Header */}
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <SettingsIcon className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-1">Settings</h1>
                        <p className="text-zinc-500 font-medium tracking-tight">Manage your preferences & identity</p>
                    </div>
                </div>

                {/* 2.5 Profile Intel Update */}
                <section className="bg-[#0d1117] border border-white/5 rounded-[28px] p-8 mb-8">
                    <div className="flex items-center gap-3 mb-10">
                        <Monitor className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold">Profile Intel</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative group">
                                <Avatar
                                    src={avatarUrl}
                                    name={name}
                                    size="xl"
                                    className="border-white/10 shadow-2xl"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-white/10 p-2 rounded-full cursor-help">
                                    <SettingsIcon className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Authenticated Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Identity Visual (URL)</label>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => {
                                            setAvatarUrl(e.target.value)
                                            setImageError(false)
                                        }}
                                        placeholder="Avatar Image URL (e.g. https://...)"
                                        className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateIdentity}
                                    disabled={isUpdating}
                                    className="bg-emerald-500 text-black px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                                >
                                    {isUpdating ? 'Synchronizing...' : 'Update Identity'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Appearance Section */}
                <section className="bg-[#0d1117] border border-white/5 rounded-[28px] p-8 mb-8">
                    <div className="flex items-center gap-3 mb-10">
                        <Moon className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold">Appearance</h2>
                    </div>

                    <div className="space-y-10">
                        {/* Theme Tool */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-[15px] mb-1">Theme</p>
                                <p className="text-sm text-zinc-500">System theme</p>
                            </div>
                            <button className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 transition-transform active:scale-95">
                                <Moon className="w-4 h-4" />
                                Dark Mode
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5 w-full" />

                        {/* Language Tool */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-[15px] mb-1">Language</p>
                                <p className="text-sm text-zinc-500">Choose your preferred language</p>
                            </div>
                            <div className="flex bg-[#161b22] p-1.5 rounded-2xl border border-white/5">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${language === 'en'
                                        ? 'bg-emerald-500 text-white shadow-lg'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    <Globe className="w-4 h-4" />
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('ar')}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${language === 'ar'
                                        ? 'bg-emerald-500 text-white shadow-lg'
                                        : 'text-zinc-400 hover:text-zinc-300'
                                        }`}
                                >
                                    العربية
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Notifications Section */}
                <section className="bg-[#0d1117] border border-white/5 rounded-[28px] p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <Bell className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold">Notifications</h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-[15px] mb-1">Email Notifications</p>
                            <p className="text-sm text-zinc-500">Receive updates about your account</p>
                        </div>

                        {/* Custom Toggle Switch */}
                        <button
                            onClick={() => setEmailNotifications(!emailNotifications)}
                            className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${emailNotifications ? 'bg-emerald-500' : 'bg-[#161b22]'
                                }`}
                        >
                            <motion.div
                                animate={{ x: emailNotifications ? 24 : 0 }}
                                className="w-6 h-6 bg-white rounded-full shadow-md"
                            />
                        </button>
                    </div>
                </section>

                {/* Action Bar (Optional but good for UX) */}
                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-zinc-600 font-medium">Synchronized with Sovereign Identity L-14 System</p>
                    <button className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                        Restore Defaults
                    </button>
                </div>
            </div>
        </div>
    )
}
