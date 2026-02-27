'use client'
import { useState, useEffect } from 'react'

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
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/components/visuals/Avatar'
import { API_URL } from '@/lib/config'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { user } = useAuth()
    const [stats, setStats] = useState<any>(null)
    const [sortOpen, setSortOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)

    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const res = await fetch(`${API_URL}/api/dashboard/stats/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (err) {
                console.error("Dashboard layout sync failed", err)
            }
        }

        if (user) fetchDashboardSummary()
    }, [user])

    const mainNav = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        {
            name: 'Tasks',
            href: '/dashboard/tasks',
            icon: ClipboardList,
            badge: stats?.pending_tasks_count > 0 ? stats.pending_tasks_count.toString() : null
        },
        { name: 'Activity', href: '/dashboard/activity', icon: ActivityIcon },
        { name: 'Shipments', href: '/dashboard/shipments', icon: Package },
    ]

    const ecosystemNav = [
        { name: 'Marketplace', href: '/marketplace', icon: Zap },
        { name: 'Forwarders', href: '/forwarders', icon: Users },
    ]

    const partnerNav = [
        { name: 'Partner Center', href: '/dashboard/partner', icon: Zap },
        { name: 'Service Profile', href: '/profile', icon: Settings },
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

                    {/* Partner Section (Dynamic) */}
                    {user?.role === 'forwarder' && (
                        <div>
                            <h3 className="px-4 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Partner Center</h3>
                            <nav className="space-y-1">
                                {partnerNav.map((item) => (
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
                    )}
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
                        <div className="hidden lg:flex items-center gap-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-r border-white/5 pr-6 relative">
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setSortOpen(!sortOpen)
                                        setFilterOpen(false)
                                        setNotifOpen(false)
                                    }}
                                    className={`hover:text-white transition-colors ${sortOpen ? 'text-white' : ''}`}
                                >
                                    Sort by
                                </button>
                                <AnimatePresence>
                                    {sortOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-4 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]"
                                        >
                                            {['Newest First', 'Oldest First', 'Priority: High', 'Priority: Low'].map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSortOpen(false)}
                                                    className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setFilterOpen(!filterOpen)
                                        setSortOpen(false)
                                        setNotifOpen(false)
                                    }}
                                    className={`hover:text-white transition-colors ${filterOpen ? 'text-white' : ''}`}
                                >
                                    Filters
                                </button>
                                <AnimatePresence>
                                    {filterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-4 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]"
                                        >
                                            <div className="px-4 py-2 border-b border-white/5 mb-1">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Entity Status</span>
                                            </div>
                                            {['All Active', 'In Transit', 'Pending Review', 'Critical Only'].map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setFilterOpen(false)}
                                                    className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Notification Popover */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setNotifOpen(!notifOpen)
                                        setSortOpen(false)
                                        setFilterOpen(false)
                                    }}
                                    className={`relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors group ${notifOpen ? 'bg-white/10 text-white' : ''}`}
                                >
                                    <Bell className={`w-5 h-5 ${notifOpen ? 'text-white' : 'text-zinc-500'} group-hover:text-white transition-colors`} />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505]"></span>
                                </button>
                                <AnimatePresence>
                                    {notifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute top-full right-0 mt-4 w-80 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl z-[60]"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] font-outfit">Sovereign Alerts</h3>
                                                <button className="text-[8px] font-bold text-zinc-600 hover:text-white uppercase tracking-widest">Clear All</button>
                                            </div>
                                            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                                {stats?.recent_activity?.slice(0, 5).map((act: any) => (
                                                    <div key={act.id} className="flex gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-white tracking-tight uppercase">{act.action.replace('_', ' ')}</p>
                                                            <p className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest leading-relaxed">
                                                                Vector: {act.entity || 'System'} detected status change.
                                                            </p>
                                                            <p className="text-[7px] font-black text-zinc-700 uppercase">{new Date(act.timestamp).toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
                                                    <div className="py-10 text-center opacity-20">
                                                        <Bell className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
                                                        <p className="text-[8px] font-bold uppercase tracking-widest">No Active Alerts</p>
                                                    </div>
                                                )}
                                            </div>
                                            <Link href="/dashboard/activity" onClick={() => setNotifOpen(false)} className="block mt-6 pt-4 border-t border-white/5 text-center text-[8px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.3em] transition-colors">
                                                Full Audit Record
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

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
