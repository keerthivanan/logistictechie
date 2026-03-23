'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Navbar from '@/components/layout/Navbar';
import { apiFetch } from '@/lib/config';
import { useT } from '@/lib/i18n/t';

import { Suspense } from 'react';

function SuccessContent() {
    const t = useT();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshProfile } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        async function upgradeUserId() {
            if (!user) return; // Wait for auth
            if (!sessionId) {
                setStatus('error');
                return;
            }

            try {
                // 1. Upgrade the User ID to REG-OMEGO securely
                // (n8n will handle standard approval emails and logic later)
                const token = localStorage.getItem('token');
                const res = await apiFetch(`/api/forwarders/upgrade-id?email=${encodeURIComponent(user.email)}&session_id=${encodeURIComponent(sessionId)}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        // 2. Force the context to fetch the new REG-OMEGO ID so the UI updates globally
                        await refreshProfile();
                        setStatus('success');
                    }
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        }

        upgradeUserId();
    }, [searchParams, user, refreshProfile]);

    return (
        <div className="max-w-xl mx-auto px-4 pt-48 pb-20 text-center">
            {status === 'loading' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-8" />
                    <h1 className="text-3xl font-bold font-outfit uppercase tracking-wider mb-4">{t('success.upgrading')}</h1>
                    <p className="text-zinc-400 font-inter">{t('success.upgrading.sub')}</p>
                </motion.div>
            )}

            {status === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold font-inter tracking-[0.2em] uppercase mb-6">
                        {t('fwd.success.portal')}
                    </div>

                    <h1 className="text-4xl font-bold font-outfit uppercase tracking-tight mb-4">{t('success.welcome')}</h1>

                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full mb-8 text-left">
                        <p className="text-zinc-400 font-inter text-sm mb-2 uppercase tracking-widest font-bold text-[10px]">{t('success.badge.label')}</p>
                        <p className="text-2xl font-mono text-emerald-400 font-bold">{user?.sovereign_id?.startsWith('REG-') ? user.sovereign_id : `REG-${user?.sovereign_id}`}</p>
                        <div className="h-px bg-white/5 my-4" />
                        <p className="text-zinc-400 font-inter text-sm leading-relaxed">
                            {t('success.badge.desc')}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/forwarders/portal')}
                        className="bg-white text-black font-bold h-14 px-8 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center text-xs tracking-widest font-inter uppercase w-full"
                    >
                        {t('success.enter')} <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </motion.div>
            )}

            {status === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
                        <span className="text-[12px] font-semibold text-red-500 uppercase tracking-[0.2em]">ERROR</span>
                    </div>
                    <h1 className="text-3xl font-bold font-outfit uppercase tracking-wider mb-4">{t('success.error.title')}</h1>
                    <p className="text-zinc-400 font-inter mb-8">{t('success.error.sub')}</p>
                    <button
                        onClick={() => router.push('/forwarders/register')}
                        className="bg-white/5 border border-white/10 text-white font-bold h-14 px-8 rounded-xl hover:bg-white/10 transition-all flex items-center text-xs tracking-widest font-inter uppercase"
                    >
                        {t('success.error.btn')}
                    </button>
                </motion.div>
            )}
        </div>
    );
}

export default function PartnerSuccessPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />
            <Suspense fallback={<FullPageSpinner />}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
