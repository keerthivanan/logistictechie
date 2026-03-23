'use client'

import { motion } from 'framer-motion'
import { useT } from '@/lib/i18n/t'

export default function ComparisonChart() {
    const t = useT()

    const metrics = [
        {
            label: t('chart.metric1'),
            cargolink: { value: t('chart.realtime'), pct: 97 },
            industry: { value: t('chart.6hrs'), pct: 18 },
        },
        {
            label: t('chart.metric2'),
            cargolink: { value: '99.9%', pct: 98 },
            industry: { value: '45%', pct: 45 },
        },
        {
            label: t('chart.metric3'),
            cargolink: { value: t('chart.signals200'), pct: 92 },
            industry: { value: t('chart.signals40'), pct: 22 },
        },
        {
            label: t('chart.metric4'),
            cargolink: { value: t('chart.saving'), pct: 82 },
            industry: { value: t('chart.none'), pct: 4 },
        },
    ]

    return (
        <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-semibold tracking-tight font-outfit text-white mb-1">
                            {t('chart.title')}
                        </h3>
                        <p className="text-xs text-zinc-500 font-inter">
                            {t('chart.cargolink')} <span className="text-zinc-700 mx-1.5">vs</span> {t('chart.industry.label')}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-[10px] font-medium text-white font-inter uppercase tracking-widest">{t('chart.cargolink')}</span>
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-[10px] font-medium text-zinc-600 font-inter uppercase tracking-widest">{t('chart.avg')}</span>
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        </div>
                    </div>
                </div>

                {/* Metric rows */}
                <div className="space-y-6">
                    {metrics.map((m, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.15em] font-inter">{m.label}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-zinc-700 font-inter line-through">{m.industry.value}</span>
                                    <span className="text-xs font-semibold text-white font-inter">{m.cargolink.value}</span>
                                </div>
                            </div>

                            {/* CargoLink bar — clean white */}
                            <div className="h-2.5 bg-zinc-900 rounded-full mb-1.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${m.cargolink.pct}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: i * 0.12 }}
                                    className="h-full rounded-full bg-white"
                                />
                            </div>

                            {/* Industry bar — thin, gray */}
                            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${m.industry.pct}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.12 + 0.3 }}
                                    className="h-full rounded-full bg-zinc-700"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom note */}
                <p className="text-[10px] text-zinc-700 font-inter mt-8 border-t border-white/[0.04] pt-4">
                    {t('chart.note')}
                </p>
            </div>
        </div>
    )
}
