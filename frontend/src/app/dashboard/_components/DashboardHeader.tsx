'use client'

export default function DashboardHeader({ userName }: { userName?: string }) {
    return (
        <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase font-outfit leading-none">
                {userName ? `${userName}'s Dashboard` : 'Dashboard'}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase font-inter">Online</span>
            </div>
        </div>
    )
}
