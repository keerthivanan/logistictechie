'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plane, Ship, CheckCircle2, Zap } from 'lucide-react'
import { KanbanShipment } from './types'
import Link from 'next/link'

export default function SovereignFlow({
    shipments,
    activeCount,
    title = "My Bids"
}: {
    shipments: KanbanShipment[]
    activeCount: number
    title?: string
}) {
    const router = useRouter()
    const active = shipments.filter(s => s.status === 'processing')
    const completed = shipments.filter(s => s.status !== 'processing')

    return (
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-white tracking-widest uppercase font-outfit">{title}</h3>
                    {activeCount > 0 && (
                        <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                            <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">{activeCount} Active</span>
                        </span>
                    )}
                </div>
                <Link href="/dashboard/shipments" className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">
                    View All →
                </Link>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                {shipments.length === 0 ? (
                    <div className="h-40 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 opacity-30">
                        <Ship className="w-5 h-5 text-zinc-600" />
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">No bids yet</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {active.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] font-inter px-1">Active Bids</p>
                                {active.map((s, i) => (
                                    <BidRow key={s.id} shipment={s} index={i} onClick={() => router.push(`/marketplace/${s.id}`)} />
                                ))}
                            </div>
                        )}
                        {completed.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] font-inter px-1">Completed</p>
                                {completed.map((s, i) => (
                                    <BidRow key={s.id} shipment={s} index={i} onClick={() => router.push(`/marketplace/${s.id}`)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function BidRow({ shipment, index, onClick }: { shipment: KanbanShipment; index: number; onClick: () => void }) {
    const isAnswered = shipment.highlight
    const isCompleted = shipment.status !== 'processing'
    const bidStatus = typeof shipment.comments === 'string' ? shipment.comments : null

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={onClick}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border cursor-pointer transition-all group ${
                isAnswered
                    ? 'bg-white/[0.03] border-white/15 hover:border-white/25'
                    : isCompleted
                    ? 'bg-[#0a0a0a] border-white/[0.03] opacity-55 hover:opacity-80 hover:border-white/8'
                    : 'bg-[#0a0a0a] border-white/5 hover:border-white/12 hover:bg-[#0d0d0d]'
            }`}
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isCompleted ? 'bg-white/[0.03]' : 'bg-white/[0.04] border border-white/5'
            }`}>
                {isCompleted
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                    : shipment.mode?.toLowerCase().includes('air')
                    ? <Plane className="w-3.5 h-3.5 text-zinc-500" />
                    : <Ship className="w-3.5 h-3.5 text-zinc-500" />
                }
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold font-outfit truncate ${isCompleted ? 'text-zinc-500' : 'text-white'}`}>
                        {shipment.company}
                    </span>
                    {isAnswered && (
                        <span className="flex-shrink-0 flex items-center gap-1 text-[8px] font-bold text-white bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                            <Zap className="w-2.5 h-2.5" /> Answered
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-zinc-600 font-inter truncate">{shipment.mode}</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                    <p className="text-[9px] font-mono text-zinc-600">{shipment.date}</p>
                    {bidStatus && !isCompleted && (
                        <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-0.5">{bidStatus}</p>
                    )}
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-white transition-colors" />
            </div>
        </motion.div>
    )
}
