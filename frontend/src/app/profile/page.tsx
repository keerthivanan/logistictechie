'use client'

import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Activity,
    Check,
    ChevronLeft,
    Cpu,
    CreditCard,
    Monitor,
    Shield
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
                    <div className="w-10 h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-zinc-400 font-bold" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight font-outfit uppercase">Client Dossier</h1>
                        <p className="text-[10px] text-zinc-600 font-medium tracking-wide font-inter">Synchronizing verified identity protocols</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Profile Identity */}
                    <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-zinc-500" />
                                    <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit text-white">ID Protocol: Active</h2>
                                </div>
                                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                                    Verified
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar
                                            src={user.avatar_url}
                                            name={user.company_name || user.name}
                                            size="lg"
                                            className="border-white/5 shadow-xl"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-black border border-white/10 p-1 rounded-full">
                                            <Shield className="w-2.5 h-2.5 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-sm font-black font-outfit text-white uppercase tracking-tighter">
                                            {user.name}
                                        </h3>
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-inter">
                                            {user.role === 'forwarder' ? 'Sovereign Partner' : 'Registered Citizen'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Master Node ID</label>
                                        <p className="text-[10px] font-black text-white font-mono tracking-tighter uppercase">
                                            {user.sovereign_id}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Clearance Level</label>
                                            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide font-inter">L-14 ARCHITECT</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Registry Epoch</label>
                                            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide font-inter">JAN 2026</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/settings"
                            className="w-full bg-white text-black py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-inter active:scale-95 flex items-center justify-center gap-2 mt-6"
                        >
                            Modify Operational Config
                        </Link>
                    </section>

                    {/* Right Column: Performance & Ledger */}
                    <div className="space-y-4">
                        {/* Performance Ledger Section */}
                        <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit text-white">Performance Ledger</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="font-bold text-[11px] mb-0.5 font-inter text-white">Active Signals</p>
                                    <p className="text-[9px] text-zinc-600 font-medium font-inter tracking-tight mb-2">Current active requests</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black font-outfit text-white">0</span>
                                        <div className="w-1 h-1 bg-zinc-500 rounded-full" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[11px] mb-0.5 font-inter text-white">Closed Nodes</p>
                                    <p className="text-[9px] text-zinc-600 font-medium font-inter tracking-tight mb-2">Historical completions</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black font-outfit text-white">0</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Financial Telemetry Section */}
                        <section className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <CreditCard className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest font-outfit text-white">Financial Telemetry</h2>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-[11px] mb-0.5 font-inter text-white uppercase tracking-tight">Protocol Throughput</p>
                                    <p className="text-[9px] text-zinc-600 font-medium font-inter tracking-tight uppercase">Lifetime Node Volume</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black font-outfit text-white">$0</p>
                                </div>
                            </div>
                        </section>

                        {/* Audit Status Bar */}
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

            <footer className="fixed bottom-8 left-0 right-0 pointer-events-none opacity-20">
                <p className="text-[10px] text-center font-black uppercase tracking-[1em] text-zinc-500">Sovereign Logistics OS</p>
            </footer>
        </div>
    )
}
