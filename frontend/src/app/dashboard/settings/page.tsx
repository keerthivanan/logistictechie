'use client'

import { useState, useEffect } from 'react'
import { User, Shield, Bell, Layout, CreditCard, Save, Loader2, Camera, Globe, Lock } from 'lucide-react'
import { API_URL } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const { user: authUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [preferences, setPreferences] = useState({ email: true, sms: false, marketing: false })
    const [activeTab, setActiveTab] = useState('profile')

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/login')
            return
        }
        if (authUser) fetchUser()
    }, [authUser, authLoading])

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setUser(data)
            if (data.preferences) {
                try {
                    setPreferences(JSON.parse(data.preferences))
                } catch (e) {
                    console.error('Failed to parse preferences', e)
                }
            }
        } catch (e) {
            console.error('Failed to fetch user', e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: user.full_name,
                    company_name: user.company_name,
                    phone_number: user.phone_number,
                    preferences: JSON.stringify(preferences)
                })
            })
            if (res.ok) {
                setMessage('Sovereign Profile Synchronized.')
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (e) {
            setMessage('Error saving profile.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin"></div>
            <div className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Accessing Identity Vault...</div>
        </div>
    )

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'notifications', label: 'Alerts', icon: Bell },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in">
            {/* Header section with User insight */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="w-24 h-24 rounded-2xl border-2 border-white/10 object-cover shadow-2xl transition-transform group-hover:scale-[1.02]"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-zinc-900 border-2 border-white/10 flex items-center justify-center text-4xl font-bold text-zinc-700">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <button className="absolute -bottom-2 -right-2 p-2 bg-white text-black rounded-lg shadow-xl hover:bg-zinc-200 transition-all active:scale-95">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{user?.full_name || 'Logistic Techie'}</h1>
                        <p className="text-zinc-500 font-medium">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                {user?.role || 'Sovereign User'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest text-green-500">
                                Verified
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-black'
                                : 'bg-transparent text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left side: Dynamic Content */}
                <div className="md:col-span-2 space-y-8">
                    {activeTab === 'profile' && (
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSave}
                            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 space-y-6 backdrop-blur-sm"
                        >
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[10px] font-bold mb-2 text-zinc-500 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.full_name || ''}
                                        onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                                        className="w-full bg-black border border-white/5 p-4 rounded-xl text-white focus:border-white transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[10px] font-bold mb-2 text-zinc-500 uppercase tracking-widest">Company</label>
                                    <input
                                        type="text"
                                        value={user?.company_name || ''}
                                        onChange={(e) => setUser({ ...user, company_name: e.target.value })}
                                        className="w-full bg-black border border-white/5 p-4 rounded-xl text-white focus:border-white transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold mb-2 text-zinc-500 uppercase tracking-widest">Email (Immutable)</label>
                                    <div className="w-full bg-zinc-950 border border-white/5 p-4 rounded-xl text-zinc-600 font-medium">
                                        {user?.email}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold mb-2 text-zinc-500 uppercase tracking-widest">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={user?.phone_number || ''}
                                        onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                                        className="w-full bg-black border border-white/5 p-4 rounded-xl text-white focus:border-white transition-all outline-none font-medium"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex items-center justify-between">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-white text-black px-10 py-4 rounded-xl font-black hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Sync Profile
                                </button>
                                {message && (
                                    <span className="text-sm text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                                        {message}
                                    </span>
                                )}
                            </div>
                        </motion.form>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <Lock className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Password management</p>
                                        <p className="text-xs text-zinc-500">Last changed 3 months ago</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 border border-white/10 rounded-lg text-sm font-bold hover:bg-white/5 transition-colors">Change</button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                        <Shield className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Two-factor authentication</p>
                                        <p className="text-xs text-zinc-500">Secure your account with 2FA</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 border border-blue-500/30 text-blue-500 rounded-lg text-sm font-bold hover:bg-blue-500/5 transition-colors">Enable</button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'billing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl border border-white/10">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Plan</p>
                                    <h3 className="text-2xl font-black italic">ENTERPRISE OS</h3>
                                    <p className="text-sm text-zinc-400 mt-2">Unlimited Routes • Priority AI Processing</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white">$499<span className="text-sm text-zinc-500">/mo</span></p>
                                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold rounded mt-2">ACTIVE</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 space-y-6"
                        >
                            <div className="space-y-4">
                                {Object.keys(preferences).map((key) => (
                                    <label key={key} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                                        <span className="font-bold text-zinc-300 capitalize group-hover:text-white transition-colors">{key} updates</span>
                                        <input
                                            type="checkbox"
                                            checked={(preferences as any)[key]}
                                            onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                                            className="w-6 h-6 accent-white cursor-pointer"
                                        />
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right side: Summary Stats */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Account Health</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Security Score</span>
                                <span className="font-bold text-green-500">98%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-[98%] text-white"></div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Identity Guard</span>
                                <span className="font-bold text-blue-500">Sovereign</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl p-6">
                        <Globe className="w-6 h-6 text-blue-400 mb-4" />
                        <h4 className="text-sm font-bold mb-2">Global Trade Network</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Your identity is encrypted across 14 sovereign data nodes for maximum logistics confidentiality.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
