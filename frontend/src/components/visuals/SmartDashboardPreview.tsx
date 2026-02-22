import { LayoutGrid, ClipboardList, Activity, Package, Zap, Users, User, ArrowUpRight, Share2, Info } from 'lucide-react';

export default function SmartDashboardPreview() {
    return (
        <div className="relative w-full max-w-6xl mx-auto aspect-[16/7.5] bg-black border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-56 bg-black border-r border-white-[0.05] p-6 flex flex-col gap-8 z-20">
                <div className="space-y-4">
                    <div className="px-4 py-2.5 bg-white text-black rounded-xl flex items-center gap-3 font-bold text-xs shadow-xl transition-all">
                        <LayoutGrid className="w-4 h-4" />
                        Dashboard
                    </div>

                    {[
                        { icon: ClipboardList, label: 'Tasks' },
                        { icon: Activity, label: 'Activity' },
                        { icon: Package, label: 'Shipments' }
                    ].map((item) => (
                        <div key={item.label} className="px-4 py-2.5 text-zinc-500 hover:text-white flex items-center gap-3 text-xs font-bold transition-all cursor-pointer">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </div>
                    ))}

                    <div className="pt-6 pb-2">
                        <span className="px-4 text-[10px] font-black text-zinc-700 tracking-[0.2em] uppercase">Ecosystem</span>
                    </div>

                    {[
                        { icon: Zap, label: 'Marketplace' },
                        { icon: Users, label: 'Forwarders' }
                    ].map((item) => (
                        <div key={item.label} className="px-4 py-2.5 text-zinc-500 hover:text-white flex items-center gap-3 text-xs font-bold transition-all cursor-pointer">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/5">SC</div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white">Sovereign Citizen</span>
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">OMEGO - 0001</span>
                    </div>
                </div>
            </div>

            {/* Main Command Center */}
            <div className="absolute left-56 top-0 right-0 bottom-0 bg-black p-8 overflow-hidden">
                {/* Top Identity Bar */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-4">
                            COMMAND <span className="text-zinc-600">CENTER</span>
                        </h2>
                        <div className="h-4 w-[1px] bg-zinc-800"></div>
                        <div className="px-3 py-1 bg-zinc-900/50 rounded-full border border-white/5 flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Node: Sovereign Citizen</span>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live Signal</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {[
                            { label: 'Active Loads', value: '0' },
                            { label: 'On-Time', value: '100.0%', icon: true },
                            { label: 'Teu Volume', value: '0' }
                        ].map((metric, i) => (
                            <div key={i} className="px-6 py-4 bg-zinc-900/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[120px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg font-bold text-white">{metric.value}</span>
                                </div>
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">{metric.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tactical Layout */}
                <div className="grid grid-cols-3 gap-10">
                    {/* Activity Feed */}
                    <div className="col-span-1 bg-zinc-900/30 rounded-3xl border border-white/5 p-6 flex flex-col h-[320px]">
                        <div className="flex items-center gap-2 mb-8">
                            <Activity className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Command Feed</span>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="p-4 bg-zinc-900/50 border border-white/[0.03] rounded-2xl flex items-center justify-between group cursor-pointer transition-all hover:border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-white uppercase tracking-wider">Social Link</div>
                                        <div className="text-[8px] font-bold text-zinc-600">11:01 AM</div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-3 h-3 text-zinc-700 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        <button className="w-full mt-auto py-3 bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest transition-all">
                            Access Audit Logs
                        </button>
                    </div>

                    {/* Sovereign Flow */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-6 mb-8 pt-2">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Sovereign Flow</h3>
                            <div className="px-2 py-0.5 bg-zinc-900 rounded border border-white/5 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                0 Active Vectors
                            </div>
                        </div>

                        <div className="flex justify-between items-start pt-4 relative">
                            {/* Step Separators */}
                            <div className="absolute top-[42px] left-0 right-0 h-[1px] bg-zinc-900"></div>

                            {[
                                { label: 'Processing', color: 'bg-blue-500' },
                                { label: 'In Transit', color: 'bg-emerald-500' },
                                { label: 'Customs', color: 'bg-amber-500' },
                                { label: 'Delivered', color: 'bg-purple-500' }
                            ].map((step, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 relative">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${step.color}`}></div>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{step.label}</span>
                                        <span className="text-[9px] font-bold text-zinc-600">0</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty Workspace Indicator */}
                        <div className="mt-20 flex flex-col items-center justify-center opacity-10">
                            <Package className="w-12 h-12 text-white mb-4" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Standby</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
