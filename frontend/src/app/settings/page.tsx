'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, ChevronLeft, User, Building2, Phone, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/visuals/Avatar'
import { apiFetch } from '@/lib/config'
import Navbar from '@/components/layout/Navbar'
import { useT } from '@/lib/i18n/t'

export default function SettingsPage() {
    const t = useT()
    const { user: authUser, loading: authLoading, refreshProfile } = useAuth()
    const router = useRouter()

    const [fullName, setFullName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (!authLoading && !authUser) { router.push('/login'); return }
        if (authUser) {
            setFullName(authUser.name || '')
            setCompanyName(authUser.company_name || '')
            setPhoneNumber(authUser.phone_number || '')
            setAvatarUrl(authUser.avatar_url || '')
        }
    }, [authUser, authLoading, router])

    const handleSaveProfile = async () => {
        setProfileLoading(true)
        setProfileMsg(null)
        try {
            const token = localStorage.getItem('token')
            const res = await apiFetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    full_name: fullName,
                    company_name: companyName,
                    phone_number: phoneNumber,
                    avatar_url: avatarUrl,
                }),
            })
            if (!res.ok) throw new Error('Update failed')
            await refreshProfile()
            setProfileMsg({ type: 'success', text: t('settings.success') })
        } catch {
            setProfileMsg({ type: 'error', text: t('settings.error') })
        } finally {
            setProfileLoading(false)
        }
    }

    if (authLoading) return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#080808] text-white">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">

                {/* Back */}
                <Link href="/profile" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group mb-8">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-medium">{t('settings.back.profile')}</span>
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center">
                        <SettingsIcon className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">{t('settings.title')}</h1>
                        <p className="text-xs text-zinc-500">{t('settings.profile')}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Profile Section */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">{t('settings.profile.info')}</h2>

                        {/* Avatar preview */}
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar src={avatarUrl} name={fullName} size="lg" className="border-white/10 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-white mb-0.5">{fullName || t('settings.your.name')}</p>
                                <p className="text-xs text-zinc-500">{authUser?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('settings.fullname')}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder={t('settings.ph.name')}
                                        className="w-full bg-black border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('settings.company')}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        placeholder={t('settings.ph.company')}
                                        className="w-full bg-black border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-zinc-500 mb-1.5">{t('settings.phone')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        placeholder={t('settings.ph.phone')}
                                        className="w-full bg-black border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                        </div>

                        {profileMsg && (
                            <div className={`flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-xs font-medium ${profileMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                                {profileMsg.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                {profileMsg.text}
                            </div>
                        )}

                        <button
                            onClick={handleSaveProfile}
                            disabled={profileLoading}
                            className="mt-4 px-6 py-2.5 bg-white text-black rounded-xl text-xs font-semibold hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {profileLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {profileLoading ? t('settings.saving') : t('settings.save')}
                        </button>
                    </div>

                    {/* Account Info */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">{t('settings.account.info')}</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                                <span className="text-xs text-zinc-500">{t('settings.email')}</span>
                                <span className="text-xs font-medium text-white">{authUser?.email}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                                <span className="text-xs text-zinc-500">{t('settings.account.id')}</span>
                                <span className="text-xs font-mono text-zinc-400">{authUser?.sovereign_id}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs text-zinc-500">{t('settings.role')}</span>
                                <span className="text-xs font-medium text-white capitalize">{authUser?.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
