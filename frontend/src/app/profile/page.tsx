'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Mail, Building2, Phone, Shield, Package, CheckCircle2, ChevronLeft, Settings } from 'lucide-react'
import Link from 'next/link'
import Avatar from '@/components/visuals/Avatar'
import Navbar from '@/components/layout/Navbar'
import { apiFetch } from '@/lib/config'
import { useT } from '@/lib/i18n/t'

export default function ProfilePage() {
    const t = useT()
    const { user } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [statsError, setStatsError] = useState(false)

    useEffect(() => {
        if (!user) { router.push('/login'); return }
        const token = localStorage.getItem('token')
        apiFetch('/api/dashboard/stats/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => setStats(d))
            .catch(() => setStatsError(true))
    }, [user, router])

    if (!user) return null

    const roleLabel = user.role === 'forwarder' ? t('profile.role.forwarder') : user.role === 'admin' ? t('profile.role.admin') : t('profile.role.shipper')
    const roleColor = user.role === 'forwarder' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : user.role === 'admin' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'

    return (
        <div className="min-h-screen bg-[#080808] text-white">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">

                {/* Back */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group mb-8">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-medium">{t('profile.back')}</span>
                </Link>

                {/* Profile Card */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 mb-4">
                    <div className="flex items-start gap-6">
                        <Avatar src={user.avatar_url} name={user.name} size="lg" className="border-white/10 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h1 className="text-xl font-bold text-white">{user.name || t('profile.no.name')}</h1>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${roleColor}`}>
                                    {roleLabel}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">{user.email}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-600 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-lg">
                                    ID: {user.sovereign_id}
                                </span>
                            </div>
                        </div>
                        <Link href="/settings"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white transition-all flex-shrink-0">
                            <Settings className="w-3.5 h-3.5" />
                            {t('profile.edit')}
                        </Link>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Account Details */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('profile.account.details')}</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-600 font-medium">{t('profile.full.name')}</p>
                                    <p className="text-sm font-medium text-white">{user.name || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-600 font-medium">{t('profile.email')}</p>
                                    <p className="text-sm font-medium text-white">{user.email}</p>
                                </div>
                            </div>
                            {user.company_name && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-600 font-medium">{t('profile.company')}</p>
                                        <p className="text-sm font-medium text-white">{user.company_name}</p>
                                    </div>
                                </div>
                            )}
                            {user.phone_number && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-600 font-medium">{t('profile.phone')}</p>
                                        <p className="text-sm font-medium text-white">{user.phone_number}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-600 font-medium">{t('profile.role.label')}</p>
                                    <p className="text-sm font-medium text-white capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                            {user.role === 'forwarder' ? t('profile.bid.summary') : t('profile.shipment.summary')}
                        </h2>
                        {statsError ? (
                            <p className="text-xs text-zinc-600 mt-2">{t('profile.stats.error')}</p>
                        ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[10px] text-zinc-500 font-medium">{t('profile.active')}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats?.active_shipments ?? '—'}</p>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-[10px] text-zinc-500 font-medium">{t('profile.completed')}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats?.delivered_shipments ?? '—'}</p>
                            </div>
                            <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] text-zinc-500 font-medium">{t('profile.total')}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stats?.total_shipments ?? '—'}</p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
