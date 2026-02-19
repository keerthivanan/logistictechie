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
        <div className="min-h-screen bg-black text-white pt-32 px-4">
            <div className="max-w-4xl mx-auto space-y-12 pb-32">
                {/* Back Link */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group mb-4">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                    {/* Visual Profile Card */}
                    <div className="md:col-span-5 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-950 border border-white/10 rounded-[32px] p-1 overflow-hidden relative group"
                        >
                            <div className="bg-zinc-900 rounded-[30px] p-8 aspect-[4/5] flex flex-col items-center justify-center text-center relative z-10">
                                <div className="relative mb-8">
                                    <Avatar
                                        src={user.avatar_url}
                                        name={user.name}
                                        size="2xl"
                                        className="border-white/10 shadow-2xl"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 px-3 py-1 rounded-full border-4 border-zinc-900 text-[8px] font-black uppercase tracking-widest">Live</div>
                                </div>
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{user.name}</h1>
                                <p className="text-emerald-500 font-mono text-sm font-black tracking-[0.2em]">{user.sovereign_id}</p>

                                <div className="mt-8 pt-8 border-t border-white/5 w-full space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Network Access</span>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">L-14 Global</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Identity Lock</span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-zinc-900/50 pointer-events-none" />
                        </motion.div>
                    </div>

                    {/* Detailed Intel */}
                    <div className="md:col-span-7 space-y-8">
                        <div>
                            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">Sovereign Intel Brief</h2>
                            <p className="text-xl font-bold text-zinc-300 leading-relaxed italic">
                                "The encrypted profile for <span className="text-white">{user.name}</span> represents a unique permanent node within the Omego Logistics OS, enabling friction-less global trade access."
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center gap-6"
                            >
                                <div className="p-4 bg-black rounded-xl">
                                    <Mail className="w-5 h-5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Primary Communication</p>
                                    <p className="text-sm font-bold text-white uppercase">{user.email}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center gap-6"
                            >
                                <div className="p-4 bg-black rounded-xl">
                                    <User className="w-5 h-5 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Authenticated Name</p>
                                    <p className="text-sm font-bold text-white uppercase">{user.name}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 flex items-center gap-6"
                            >
                                <div className="p-4 bg-black rounded-xl text-emerald-500">
                                    <Fingerprint className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Permanent Node Address</p>
                                    <p className="text-sm font-bold text-emerald-500 tracking-[0.1em] uppercase">{user.sovereign_id}</p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-8 border-t border-white/10 flex gap-4">
                            <Link
                                href="/settings"
                                className="flex-1 bg-white text-black text-center py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
                            >
                                Edit Intel
                            </Link>
                            <div className="px-6 flex items-center border border-white/10 rounded-xl">
                                <Shield className="w-4 h-4 text-zinc-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
