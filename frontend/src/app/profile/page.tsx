'use client'

import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    User,
    Shield,
    Globe,
    ChevronLeft,
    Building2,
    Check,
    Monitor,
    Activity,
    CreditCard,
    Cpu
} from 'lucide-react'
import Link from 'next/link'
import Avatar from '@/components/visuals/Avatar'
import Navbar from '@/components/layout/Navbar'

export default function StandaloneProfilePage() {
    const { user } = useAuth()
    const router = useRouter()

    if (!user) return null

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 overflow-hidden selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-4xl w-full">
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
                    <div className="w-10 h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center shadow-2xl">
                        <Cpu className="w-5 h-5 text-zinc-400 font-bold" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight font-outfit uppercase">Client Dossier</h1>
                        <p className="text-[10px] text-zinc-600 font-medium tracking-wide font-inter">Synchronizing verified identity protocols</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Core Identity (Dossier Card) */}
                    <section className="bg-black border border-white/10 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,1)]">
                        {/* Holographic Accents */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-emerald-500" />
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] font-outfit text-white">ID Protocol: Active</h2>
                                </div>
                                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest animate-pulse">
                                    Verified
                                </div>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar
                                            src={user.avatar_url}
                                            name={user.company_name || user.name}
                                            size="xl"
                                            className="border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] scale-110"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-black border border-white/20 p-1.5 rounded-full shadow-xl">
                                            <Shield className="w-3 h-3 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black font-outfit text-white uppercase tracking-tighter leading-none">
                                            {user.name}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-inter">
                                            {user.role === 'forwarder' ? 'Sovereign Partner' : 'Registered Citizen'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5 border-l-2 border-emerald-500/20 pl-4">
                                        <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Master Node ID</label>
                                        <p className="text-[11px] font-black text-white font-mono tracking-tighter uppercase">
                                            {user.sovereign_id}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Clearance Level</label>
                                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-wide font-inter">L-14 ARCHITECT</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Registry Epoch</label>
                                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-wide font-inter">JAN 2026</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/settings"
                            className="relative z-10 w-full bg-white text-black py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all font-inter active:scale-[0.98] flex items-center justify-center gap-2 mt-12 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                        >
                            Modify Operational Config
                        </Link>
                    </section>

                    {/* Right Column: Performance & Ledger */}
                    <div className="space-y-4">
                        {/* Performance Ledger Section */}
                        <section className="bg-black border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/5 blur-3xl" />
                            <div className="flex items-center gap-2 mb-8 relative z-10">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] font-outfit text-white">Performance Ledger</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <p className="font-bold text-[9px] text-zinc-600 mb-2 font-inter uppercase tracking-widest">Active Signals</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black font-outfit text-white">02</span>
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_emerald]" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[9px] text-zinc-600 mb-2 font-inter uppercase tracking-widest">Closed Nodes</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black font-outfit text-white">25</span>
                                        <span className="text-[10px] text-emerald-500/50 font-black uppercase tracking-tighter font-inter leading-none">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Financial Telemetry Section */}
                        <section className="bg-black border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-500/5 blur-3xl" />
                            <div className="flex items-center gap-2 mb-8 relative z-10">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] font-outfit text-white">Financial Telemetry</h2>
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="font-bold text-[11px] mb-1 font-inter text-white uppercase tracking-tight">Protocol Throughput</p>
                                    <p className="text-[9px] text-zinc-600 font-medium font-inter tracking-tight uppercase">Lifetime Node Volume</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black font-outfit text-white">$57,800</p>
                                    <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1">Status: Optimal</p>
                                </div>
                            </div>
                        </section>

                        {/* Audit Status Bar */}
                        <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-emerald-500" />
                                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.3em] font-inter">Global Node Sync: Active</p>
                            </div>
                            <div className="flex gap-1.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1 h-3 bg-emerald-500/40 rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="fixed bottom-8 left-0 right-0 pointer-events-none opacity-20">
                <p className="text-[10px] text-center font-black uppercase tracking-[1em] text-zinc-500">Sovereign Logistics OS</p>
            </footer>
        </div>
    )
}
