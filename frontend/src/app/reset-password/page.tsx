'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch } from '@/lib/config'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { useT } from '@/lib/i18n/t'

function ResetPasswordContent() {
    const t = useT()
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') || ''

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!token) {
            setError(t('reset.err.invalid'))
            return
        }
        if (password !== confirm) {
            setError(t('reset.err.mismatch'))
            return
        }

        setLoading(true)
        try {
            const res = await apiFetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password }),
            })
            const data = await res.json()
            if (res.ok) {
                setDone(true)
                setTimeout(() => router.push('/login'), 2500)
            } else {
                setError(data.detail || t('reset.err.expired'))
            }
        } catch {
            setError(t('reset.err.network'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
            <div className="w-full max-w-sm p-8">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-8">
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-4 bg-white rounded-sm" />
                            <div className="w-1.5 h-4 bg-white/70 rounded-sm" />
                            <div className="w-1.5 h-4 bg-white/40 rounded-sm" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white font-outfit uppercase">CargoLink</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2 font-outfit uppercase tracking-tight">{t('reset.title')}</h1>
                    <p className="text-zinc-500 font-medium font-inter text-xs">{t('reset.sub')}</p>
                </div>

                <div className="bg-zinc-950 border border-white/5 p-8 rounded-3xl shadow-2xl">
                    {done ? (
                        <div className="flex flex-col items-center gap-4 py-4 text-center">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                            <p className="text-sm font-bold text-white font-outfit">{t('reset.done.title')}</p>
                            <p className="text-xs text-zinc-500 font-inter">{t('reset.done.sub')}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center font-inter">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-inter">{t('reset.new.password')}</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={t('reset.placeholder')}
                                    className="w-full bg-black border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors font-inter"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-inter">{t('reset.confirm')}</label>
                                <input
                                    type="password"
                                    required
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder={t('reset.confirm.placeholder')}
                                    className="w-full bg-black border border-white/5 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:border-white/20 outline-none transition-colors font-inter"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || !confirm}
                                className="w-full bg-white text-black font-bold text-xs py-3.5 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-30 flex items-center justify-center gap-2 font-inter uppercase tracking-widest mt-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('reset.cta')}
                            </button>

                            <p className="text-center text-[10px] text-zinc-600 font-inter mt-2">
                                <Link href="/login" className="hover:text-white transition-colors">{t('reset.back')}</Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<FullPageSpinner />}>
            <ResetPasswordContent />
        </Suspense>
    )
}
