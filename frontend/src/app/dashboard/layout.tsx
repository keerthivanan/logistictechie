'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    CreditCard,
    Settings,
    LogOut,
    Bell,
    ClipboardList,
    Activity as ActivityIcon,
    Users,
    Zap,
    Search,
    Plus
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/components/visuals/Avatar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { user } = useAuth()

    const mainNav = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardList, badge: '2' },
        { name: 'Activity', href: '/dashboard/activity', icon: ActivityIcon },
        { name: 'Shipments', href: '/dashboard/shipments', icon: Package },
    ]

    const ecosystemNav = [
        { name: 'Marketplace', href: '/marketplace', icon: Zap },
        { name: 'Forwarders', href: '/forwarders', icon: Users },
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 fixed h-full bg-[#050505] z-50 hidden md:flex flex-col">
                {/* Logo Section */}
                <div className="flex items-center h-20 px-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black rounded-lg group-hover:bg-blue-500 transition-colors">S</div>
                        <span className="text-xl font-black tracking-tighter text-white">SOVEREIGN</span>
                    </Link>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 px-4 py-6 space-y-10 overflow-y-auto custom-scrollbar">
                    {/* Main Menu */}
                    <div>
                        <nav className="space-y-1">
                            {mainNav.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                                            ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                            : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`} />
                                            <span className="text-sm tracking-tight">{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-black text-white' : 'bg-white/10 text-zinc-400'}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Ecosystem */}
                    <div>
                        <h3 className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Ecosystem</h3>
                        <nav className="space-y-1">
                            {ecosystemNav.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
                                >
                                    <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                                    <span className="text-sm tracking-tight">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Account Section - User Center */}
                <div className="p-4 border-t border-white/5">
                    <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group">
                        <Avatar src={user?.avatar_url} name={user?.name} size="sm" className="border-zinc-800" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">{user?.sovereign_id}</p>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Global Dashboard Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-[40]">
                    <div className="flex items-center gap-8 flex-1 max-w-2xl text-zinc-500">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search shipments, vessels, or forwarders..."
                                className="w-full bg-white/5 border border-white/5 rounded-full py-2.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 ml-8">
                        <div className="hidden lg:flex items-center gap-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-r border-white/5 pr-6">
                            <button className="hover:text-white transition-colors">Sort by</button>
                            <button className="hover:text-white transition-colors">Filters</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors group">
                                <Bell className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505]"></span>
                            </button>
                            <Link href="/marketplace" className="bg-white text-black text-xs font-black px-6 py-3 rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Plus className="w-4 h-4" /> NEW SHIPMENT
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
