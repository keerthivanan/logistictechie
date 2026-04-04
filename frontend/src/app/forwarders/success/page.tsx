'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function PartnerSuccessPage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();
    const [status, setStatus] = useState<'loading' | 'approved' | 'pending'>('loading');

    // Refresh profile on mount to get latest role/sovereign_id from backend
    useEffect(() => {
        refreshProfile();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Derive status from user state (re-runs after refreshProfile updates context)
    useEffect(() => {
        if (!user) return;
        if (user.role === 'forwarder') {
            setStatus('approved');
        } else {
            setStatus('pending');
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />
            <div className="max-w-xl mx-auto px-4 pt-48 pb-20 text-center">

                {status === 'loading' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-8" />
                        <h1 className="text-3xl font-bold font-outfit uppercase tracking-wider mb-4">Checking Status</h1>
                        <p className="text-zinc-400 font-inter">Please wait a moment...</p>
                    </motion.div>
                )}

                {status === 'approved' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold font-inter tracking-[0.2em] uppercase mb-6">
                            Partner Activated
                        </div>

                        <h1 className="text-4xl font-bold font-outfit uppercase tracking-tight mb-4">Welcome Aboard</h1>

                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full mb-8 text-left">
                            <p className="text-zinc-400 font-inter text-sm mb-2 uppercase tracking-widest font-bold text-[10px]">Your Partner ID</p>
                            <p className="text-2xl font-mono text-emerald-400 font-bold">{user?.sovereign_id}</p>
                            <div className="h-px bg-white/5 my-4" />
                            <p className="text-zinc-400 font-inter text-sm leading-relaxed">
                                Your partner account is active. Use your Partner ID to log into the forwarder portal and start quoting on freight requests.
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/forwarders/portal')}
                            className="bg-white text-black font-bold h-14 px-8 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center text-xs tracking-widest font-inter uppercase w-full"
                        >
                            Enter Portal <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </motion.div>
                )}

                {status === 'pending' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                            <Clock className="w-12 h-12 text-amber-400" />
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold font-inter tracking-[0.2em] uppercase mb-6">
                            Application Under Review
                        </div>

                        <h1 className="text-4xl font-bold font-outfit uppercase tracking-tight mb-4">Application Submitted</h1>

                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full mb-8 text-left">
                            <p className="text-zinc-400 font-inter text-sm leading-relaxed">
                                Your forwarder application has been received. Our team will review your credentials and notify you by email within 1–2 business days.
                            </p>
                            <div className="h-px bg-white/5 my-4" />
                            <p className="text-zinc-500 font-inter text-sm">
                                Registered as: <span className="text-white">{user?.email}</span>
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-white text-black font-bold h-14 px-8 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center text-xs tracking-widest font-inter uppercase w-full"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
