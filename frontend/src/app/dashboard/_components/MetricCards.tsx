'use client'

import { motion } from 'framer-motion'
import { Package, Clock, Truck, TrendingUp, Zap } from 'lucide-react'
import { DashboardStats } from './types'

export default function MetricCards({ stats }: { stats: DashboardStats | null }) {
    const cards = [
        {
            icon: Package,
            value: stats?.active_shipments || 0,
            label: 'Active Loads',
            bgColor: 'bg-white/[0.02]'
        },
        {
            icon: Clock,
            value: stats?.on_time_rate || '100%',
            label: 'On-Time',
            bgColor: 'bg-white/[0.02]'
        },
        {
            icon: Truck,
            value: stats?.containers || 0,
            label: 'TEU Volume',
            bgColor: 'bg-white/[0.02]'
        }
    ]

    return (
        <div className="flex flex-wrap items-center gap-4">
            {cards.map((card, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`${card.bgColor} border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 hover:border-white/10 transition-all cursor-default`}
                >
                    <card.icon className="w-3.5 h-3.5 text-zinc-500" />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white leading-none font-inter">{card.value}</span>
                        <span className="text-[8px] font-medium text-zinc-600 uppercase tracking-widest mt-1 font-inter">{card.label}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
