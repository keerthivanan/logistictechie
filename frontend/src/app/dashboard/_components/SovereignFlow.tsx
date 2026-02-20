'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ExternalLink, Calendar, MessageSquare, Plane, Ship, Plus } from 'lucide-react'
import { KanbanShipment } from './types'

export default function SovereignFlow({ shipments, activeCount }: { shipments: KanbanShipment[], activeCount: number }) {
    const router = useRouter()

    const columns = [
        { title: 'Processing', status: 'processing', color: 'bg-blue-500' },
        { title: 'In Transit', status: 'transit', color: 'bg-emerald-500' },
        { title: 'Customs', status: 'customs', color: 'bg-amber-500' },
        { title: 'Delivered', status: 'delivered', color: 'bg-purple-500' },
    ]

    return (
        <div className="space-y-8 pt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-white tracking-widest uppercase font-outfit">Sovereign Flow</h3>
                    <div className="bg-white/5 px-2 py-0.5 rounded text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-inter">
                        {activeCount} Active Vectors
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((col, i) => {
                    const colShipments = shipments.filter(s => s.status === col.status)
                    return (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-2 px-2 border-b border-white/5 pb-2">
                                <span className={`w-1 h-1 rounded-full ${col.color}`}></span>
                                <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-inter">
                                    {col.title}
                                </h3>
                                <div className="ml-auto text-[8px] font-bold text-zinc-600 font-inter">{colShipments.length}</div>
                            </div>

                            <div className="space-y-3 min-h-[300px] p-1">
                                {colShipments.map((shipment) => (
                                    <motion.div
                                        key={shipment.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => router.push(`/booking/confirmation?id=${shipment.id}`)}
                                        className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:border-white/20 transition-all cursor-pointer group shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-[11px] font-bold tracking-tight text-white truncate max-w-[80%] uppercase font-outfit">
                                                {shipment.company}
                                            </h4>
                                            <ExternalLink className="w-2.5 h-2.5 text-zinc-600 group-hover:text-white transition-colors" />
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                                                {shipment.mode?.toLowerCase() === 'air' ? <Plane className="w-3 h-3 text-white" /> : <Ship className="w-3 h-3 text-white" />}
                                            </div>
                                            <p className="text-[9px] font-medium text-zinc-500 truncate font-inter">
                                                {shipment.desc}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                                            <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {shipment.date}
                                            </div>
                                            {shipment.comments > 0 && (
                                                <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-600 font-inter">
                                                    <MessageSquare className="w-2.5 h-2.5" />
                                                    {shipment.comments}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {colShipments.length === 0 && (
                                    <div className="h-24 rounded-xl border border-dashed border-white/[0.02] flex items-center justify-center opacity-10 hover:opacity-30 transition-all cursor-pointer hover:bg-white/[0.01]">
                                        <Plus className="w-3 h-3 text-zinc-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
