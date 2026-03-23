'use client'

import Navbar from '@/components/layout/Navbar'
import { useT } from '@/lib/i18n/t'

export default function TermsPage() {
    const t = useT()

    const sections = [
        { num: '01', title: t('legal.terms.s1.title'), body: t('legal.terms.s1.body') },
        { num: '02', title: t('legal.terms.s2.title'), body: t('legal.terms.s2.body') },
        { num: '03', title: t('legal.terms.s3.title'), body: t('legal.terms.s3.body') },
        { num: '04', title: t('legal.terms.s4.title'), body: t('legal.terms.s4.body') },
        { num: '05', title: t('legal.terms.s5.title'), body: t('legal.terms.s5.body') },
        { num: '06', title: t('legal.terms.s6.title'), body: t('legal.terms.s6.body') },
        { num: '07', title: t('legal.terms.s7.title'), body: t('legal.terms.s7.body') },
        { num: '08', title: t('legal.terms.s8.title'), body: t('legal.terms.s8.body') },
    ]

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                <div className="mb-10">
                    <h1 className="text-2xl font-semibold font-outfit uppercase tracking-tight text-white mb-2">
                        {t('legal.terms.title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter">{t('legal.terms.sub')}</p>
                    <p className="text-xs text-zinc-700 font-mono mt-2">{t('legal.updated')}</p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                    {sections.map(({ num, title, body }) => (
                        <div key={num} className="p-6">
                            <div className="flex items-start gap-4">
                                <span className="text-[10px] font-mono text-zinc-700 mt-0.5 flex-shrink-0">{num}</span>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-inter mb-2">{title}</p>
                                    <p className="text-sm text-zinc-400 font-inter leading-relaxed">{body}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-zinc-700 font-inter text-center mt-8">
                    {t('legal.questions')}{' '}
                    <a href="mailto:legal@cargolink.io" className="text-zinc-500 hover:text-white transition-colors underline">legal@cargolink.io</a>
                </p>
                <div className="flex justify-center mt-8">
                    <img src="/cargolink.png" alt="CargoLink" className="h-10 w-auto object-contain opacity-30" />
                </div>
            </div>
        </div>
    )
}
