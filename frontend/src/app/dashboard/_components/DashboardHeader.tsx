'use client'

import { useT } from '@/lib/i18n/t'

export default function DashboardHeader({ userName }: { userName?: string }) {
    const t = useT()
    return (
        <div>
            <h1 className="text-lg font-semibold tracking-tight text-white uppercase font-outfit leading-none">
                {userName ? `${userName}${t('dash.header.suffix')}` : t('dash.dashboard')}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase font-inter">{t('dash.online')}</span>
            </div>
        </div>
    )
}
