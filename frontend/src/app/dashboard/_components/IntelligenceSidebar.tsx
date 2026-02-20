'use client'

import Link from 'next/link'
import { Activity as ActivityIcon, Search, CheckCircle2, History, Clock, ArrowUpRight, AlertCircle } from 'lucide-react'
import { Activity } from './types'

export default function IntelligenceSidebar({ activities }: { activities: Activity[] }) {
    return (
        <div className="bg-black border border-white/5 rounded-3xl p-6 h-full flex flex-col shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <ActivityIcon className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-black text-white italic tracking-tighter uppercase">Activity Feed</h3>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act) => (
                        <Link
                            key={act.id}
                            href={act.url}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group/act"
                        >
                            <div className="flex-shrink-0">
                                {act.action === 'SEARCH' ? <Search className="w-3.5 h-3.5 text-blue-500" /> :
                                    act.action === 'BOOKING_CREATED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> :
                                        <History className="w-3.5 h-3.5 text-zinc-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-white mb-1 group-hover/act:text-emerald-400 transition-colors uppercase tracking-tight truncate">
                                    {act.action === 'SEARCH' ? 'Search' :
                                        act.action === 'BOOKING_CREATED' ? 'Booking' :
                                            act.action.replace('_', ' ')}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-zinc-700" />
                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            <ArrowUpRight className="w-3 h-3 text-zinc-800 group-hover/act:text-white transition-colors" />
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-20 py-10">
                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Silence</p>
                    </div>
                )}
            </div>

            <button className="mt-6 w-full py-3 border border-white/5 rounded-xl text-[8px] font-black text-zinc-600 uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all">
                Full Log
            </button>
        </div>
    )
}
