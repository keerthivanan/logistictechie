'use client'

import Link from 'next/link'
import { Activity as ActivityIcon, Search, CheckCircle2, History, Clock, ArrowUpRight, AlertCircle } from 'lucide-react'
import { Activity } from './types'

export default function CommandFeed({ activities }: { activities: Activity[] }) {
    return (
        <div className="bg-black border border-white/5 rounded-3xl p-6 h-full flex flex-col shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <ActivityIcon className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-bold text-white tracking-widest uppercase font-outfit">Command Feed</h3>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {activities.length > 0 ? (
                    activities.map((act) => (
                        <Link
                            key={act.id}
                            href={act.url}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all group/act bg-white/[0.01]"
                        >
                            <div className="flex-shrink-0">
                                {act.action === 'SEARCH' ? <Search className="w- 3.5 h-3.5 text-blue-400" /> :
                                    act.action === 'BOOKING_CREATED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                                        <History className="w-3.5 h-3.5 text-zinc-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold text-white mb-0.5 group-hover/act:text-emerald-400 transition-colors uppercase tracking-wide font-inter">
                                    {act.action === 'SEARCH' ? 'Vector Search' :
                                        act.action === 'BOOKING_CREATED' ? 'Operational Booking' :
                                            act.action.replace('_', ' ')}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-2.5 h-2.5 text-zinc-600" />
                                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">
                                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            <ArrowUpRight className="w-3 h-3 text-zinc-700 group-hover/act:text-white transition-colors" />
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-10 py-10">
                        <AlertCircle className="w-4 h-4 text-zinc-500" />
                        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 font-inter">Standby</p>
                    </div>
                )}
            </div>

            <button className="mt-6 w-full py-3 border border-white/5 rounded-xl text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-inter hover:bg-white hover:text-black transition-all">
                Access Audit Logs
            </button>
        </div>
    )
}
