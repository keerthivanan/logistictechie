'use client'

import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { User, Shield, Globe, ChevronLeft, Mail, Fingerprint, Building2 } from 'lucide-react'
import Link from 'next/link'
import Avatar from '@/components/visuals/Avatar'

export default function StandaloneProfilePage() {
    const { user } = useAuth()

    if (!user) return null

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Clean Navigation */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-inter">Return to Terminal</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Professional Intel Card */}
                    <div className="md:col-span-12 lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-950 border border-white/5 rounded-[24px] p-1 overflow-hidden relative group shadow-2xl"
                        >
                            <div className="bg-zinc-900/50 rounded-[22px] p-6 flex flex-col items-center justify-center text-center relative z-10 backdrop-blur-sm">
                                <div className="relative mb-6">
                                    <Avatar
                                        src={user.avatar_url}
                                        name={user.name}
                                        size="xl"
                                        className="border-white/5 shadow-2xl"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 px-2 py-0.5 rounded-full border-2 border-zinc-900 text-[6px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.4)]">Live</div>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-outfit mb-1">{user.name}</h1>
                                <p className="text-emerald-500 font-medium text-[10px] tracking-[0.3em] font-inter uppercase">{user.sovereign_id}</p>

                                <div className="mt-6 pt-6 border-t border-white/5 w-full space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Network Clearance</span>
                                        <span className="text-[8px] font-bold text-white uppercase tracking-widest font-inter">L-14 Global</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Identity Status</span>
                                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest font-inter">Verified</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-black pointer-events-none" />
                        </motion.div>
                    </div>

                    {/* Operational Intel Feed */}
                    <div className="md:col-span-12 lg:col-span-7 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] font-outfit">Sovereign Intel Protocol</h2>
                            <p className="text-lg font-medium text-zinc-400 leading-snug font-inter">
                                The encrypted profile for <span className="text-white font-bold">{user.name}</span> represents a permanent node within the Sovereign Logistics OS.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/[0.02] rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/[0.04] transition-all"
                            >
                                <div className="p-3 bg-black rounded-lg border border-white/5">
                                    <Mail className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5 font-inter">Communication Node</p>
                                    <p className="text-xs font-semibold text-white uppercase font-inter">{user.email}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/[0.02] rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/[0.04] transition-all"
                            >
                                <div className="p-3 bg-black rounded-lg border border-white/5">
                                    <User className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5 font-inter">Registry Identity</p>
                                    <p className="text-xs font-semibold text-white uppercase font-inter">{user.name}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10 flex items-center gap-4 hover:bg-emerald-500/[0.08] transition-all"
                            >
                                <div className="p-3 bg-black rounded-lg border border-emerald-500/20 text-emerald-500">
                                    <Fingerprint className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5 font-inter">Master Node Index</p>
                                    <p className="text-xs font-bold text-emerald-500 tracking-wider uppercase font-inter">{user.sovereign_id}</p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <Link
                                href="/settings"
                                className="flex-1 bg-white text-black text-center py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-inter active:scale-95"
                            >
                                Modify Intel
                            </Link>
                            <div className="px-4 flex items-center border border-white/10 rounded-xl bg-white/5 group hover:border-white/20 transition-all cursor-help">
                                <Shield className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
