'use client'

export default function DashboardHeader({ userName }: { userName?: string }) {
    return (
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-8">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold tracking-tight text-white uppercase font-outfit">
                    Command <span className="text-zinc-600">Center</span>
                </h1>
                <div className="h-4 w-px bg-white/10" />
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] font-inter">
                    Node: {userName || 'Master'}
                </p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-1.5 opacity-50 hover:opacity-100 transition-all">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[8px] font-bold text-white tracking-widest uppercase font-inter">Live Signal</span>
            </div>
        </div>
    )
}
