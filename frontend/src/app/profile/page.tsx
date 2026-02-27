'use client'

import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { User, Shield, Globe, ChevronLeft, Mail, Fingerprint, Building2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Avatar from '@/components/visuals/Avatar'
import Navbar from '@/components/layout/Navbar'

export default function StandaloneProfilePage() {
    const { user } = useAuth()
    const router = useRouter()

    if (!user) return null

    const isForwarder = user.role === 'forwarder'

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 overflow-hidden selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-4xl w-full pt-10">
                {/* 1. Precise Navigation */}
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase font-inter">Return to Terminal</span>
                    </Link>
                </div>

                {/* 2. Page Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-400 font-bold" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight font-outfit uppercase">Sovereign Profile</h1>
                        <p className="text-[10px] text-zinc-600 font-medium tracking-wide font-inter">Synchronizing network identity</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Profile Card */}
                    <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <Shield className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit">Core Identity</h2>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative">
                                    <Avatar
                                        src={user.avatar_url}
                                        name={user.name}
                                        size="xl"
                                        shape="square"
                                        className="border-white/5 shadow-2xl"
                                    />
                                    <div className={`absolute -bottom-2 -right-2 bg-black border border-white/10 p-2 rounded-xl shadow-2xl`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${isForwarder ? 'bg-emerald-500' : 'bg-white'} animate-pulse`} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter">{user.name}</h3>
                                    <p className={`text-[10px] font-bold ${isForwarder ? 'text-emerald-500' : 'text-zinc-500'} uppercase tracking-[0.3em]`}>
                                        {isForwarder ? 'Sovereign Partner' : 'Global Node'}
                                    </p>
                                </div>

                                <div className="w-full pt-8 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest font-inter">Master Node ID</span>
                                        <span className="text-[10px] font-mono font-bold text-white uppercase">{user.sovereign_id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest font-inter">Registry Status</span>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl pointer-events-none" />
                    </section>

                    {/* Right Column: Operational Intel */}
                    <div className="space-y-4">
                        {/* Intel section */}
                        <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Globe className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit">Communication Hub</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1 font-inter">Primary Signal</p>
                                        <p className="text-[11px] font-bold text-white uppercase font-inter truncate max-w-[180px]">{user.email}</p>
                                    </div>
                                    <Mail className="w-4 h-4 text-zinc-800" />
                                </div>

                                {isForwarder && (
                                    <div className="pt-6 border-t border-white/5 space-y-6">
                                        <div>
                                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1 font-inter">Company Entity</p>
                                            <p className="text-[11px] font-bold text-white uppercase font-inter">{user.company_name || 'PENDING'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1 font-inter">Operational Email</p>
                                            <p className="text-[11px] font-bold text-white uppercase font-inter truncate max-w-[180px]">{user.company_email || 'PENDING'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Tactical Actions */}
                        <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Fingerprint className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit">Sovereign Control</h2>
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    href="/settings"
                                    className="flex-1 bg-white text-black py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-inter text-center active:scale-95"
                                >
                                    Refine Node
                                </Link>
                                <button className="px-5 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-zinc-600 hover:text-white">
                                    <Shield className="w-4 h-4" />
                                </button>
                            </div>
                        </section>

                        {/* Audit Info */}
                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest font-inter">Sync Status: Optimal</p>
                            </div>
                            <p className="text-[8px] text-zinc-700 font-bold font-inter tracking-[0.1em]">L-14 PROTOCOL</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
