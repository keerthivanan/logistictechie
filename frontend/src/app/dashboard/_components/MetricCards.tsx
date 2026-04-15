'use client'

import { motion } from 'framer-motion'
import { Package, Clock, Truck, ClipboardList } from 'lucide-react'
import { DashboardStats } from './types'

export default function MetricCards({ stats }: { stats: DashboardStats | null }) {
    const cards = [
        {
            icon: Package,
            value: stats?.active_shipments ?? 0,
            label: 'Active Loads',
            accent: 'border-t-white/20',
        },
        {
            icon: Clock,
            value: stats?.total_shipments ?? 0,
            label: 'Total Shipments',
            accent: 'border-t-zinc-700/60',
        },
        {
            icon: ClipboardList,
            value: stats?.pending_tasks_count ?? 0,
            label: 'Active Tasks',
            accent: (stats?.pending_tasks_count ?? 0) > 0 ? 'border-t-amber-500/40' : 'border-t-zinc-700/60',
        },
        {
            icon: Truck,
            value: stats?.delivered_shipments ?? 0,
            label: 'Delivered',
            accent: 'border-t-zinc-700/60',
        },
    ]

    return (
        <div className="flex flex-wrap items-center gap-3">
            {cards.map((card, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white/[0.02] border border-white/5 border-t-2 ${card.accent} rounded-2xl px-5 py-3.5 flex items-center gap-3.5 hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-default`}
                >
                    <card.icon className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white leading-none font-inter tabular-nums">{card.value}</span>
                        <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-widest mt-1 font-inter whitespace-nowrap">{card.label}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
