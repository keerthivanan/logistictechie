'use client'
import { useState, useEffect } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    Bell,
    ClipboardList,
    Activity as ActivityIcon,
    Users,
    Zap,
    Search,
    Plus,
    ShieldCheck,
    MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/components/visuals/Avatar'
import { apiFetch } from '@/lib/config'
import { useT } from '@/lib/i18n/t'


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const t = useT()
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading } = useAuth()
    const [stats, setStats] = useState<any>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([])
    const [notifUnread, setNotifUnread] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOpen, setSortOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)

    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const res = await apiFetch(`/api/dashboard/stats/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch {
                // silently ignore
            }
        }

        if (user) fetchDashboardSummary()
    }, [user])

    // Poll structured notifications every 15s
    useEffect(() => {
        if (!user) return
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const res = await apiFetch('/api/dashboard/notifications/', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setNotifications(data.notifications || [])
                    setNotifUnread(data.unread_count || 0)
                }
            } catch {}
        }
        fetchNotifications()
        const iv = setInterval(fetchNotifications, 15000)
        return () => clearInterval(iv)
    }, [user])

    // Auth guard — redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Sync unread count from initial stats fetch
    useEffect(() => {
        if (stats?.unread_messages_count !== undefined) {
            setUnreadCount(stats.unread_messages_count)
        }
    }, [stats])

    // Poll unread count every 10 seconds — keeps badge live without full stats refetch
    useEffect(() => {
        if (!user) return
        const poll = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const res = await apiFetch('/api/conversations/unread-count', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setUnreadCount(data.unread_count)
                }
            } catch {}
        }
        const interval = setInterval(poll, 10000)
        return () => clearInterval(interval)
    }, [user])

    const mainNav = [
        { name: t('dash.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        {
            name: t('dash.tasks'),
            href: '/dashboard/tasks',
            icon: ClipboardList,
            badge: stats?.pending_tasks_count > 0 ? stats.pending_tasks_count.toString() : null
        },
        { name: t('dash.activity'), href: '/dashboard/activity', icon: ActivityIcon },
        { name: t('dash.shipments'), href: '/dashboard/shipments', icon: Package },
        {
            name: t('dash.messages'),
            href: '/dashboard/messages',
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount.toString() : null
        },
    ]

    const ecosystemNav = [
        { name: t('dash.marketplace'), href: '/marketplace', icon: Zap },
        { name: t('dash.forwarders'), href: '/forwarders', icon: Users },
    ]

    const partnerNav = [
        { name: t('dash.partner'), href: '/dashboard/partner', icon: Zap },
    ]

    return (
        <div dir="ltr" className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/[0.04] fixed h-full bg-[#080808] z-50 hidden md:flex flex-col">
                {/* Logo Section */}
                <div className="flex items-center justify-center h-20 px-6 border-b border-white/[0.04]">
                    <Link href="/" className="flex items-center group">
                        <img src="/cargolink.png" alt="CargoLink" className="h-12 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 px-3 py-5 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* Main Menu */}
                    <div className="space-y-0.5">
                        {mainNav.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-white text-black font-bold shadow-[0_2px_16px_rgba(255,255,255,0.08)]'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-black/10' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'}`}>
                                            <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`} />
                                        </div>
                                        <span className="text-[13px] font-semibold tracking-tight">{item.name}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Ecosystem — shippers only, not forwarders */}
                    {user?.role !== 'forwarder' && (
                    <div>
                        <p className="px-3 text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.25em] mb-2">{t('dash.ecosystem')}</p>
                        <div className="space-y-0.5">
                            {ecosystemNav.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-black/10' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'}`}>
                                            <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`} />
                                        </div>
                                        <span className="text-[13px] font-semibold tracking-tight">{item.name}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                    )}

                    {/* Partner Section — forwarders only */}
                    {user?.role === 'forwarder' && (
                        <div>
                            <p className="px-3 text-[9px] font-semibold text-emerald-500/70 uppercase tracking-[0.25em] mb-2">{t('dash.partner.center')}</p>
                            <div className="space-y-0.5">
                                {partnerNav.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                                ? 'bg-emerald-500 text-white font-bold shadow-[0_2px_16px_rgba(16,185,129,0.2)]'
                                                : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/[0.06]'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-white/20' : 'bg-emerald-500/[0.08] group-hover:bg-emerald-500/[0.15]'}`}>
                                                <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-400'}`} />
                                            </div>
                                            <span className="text-[13px] font-semibold tracking-tight">{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Admin Section — backend gates via ADMIN_EMAIL */}
                    {user?.role === 'admin' && (
                        <div>
                            <p className="px-3 text-[9px] font-semibold text-zinc-700 uppercase tracking-[0.25em] mb-2">{t('dash.system')}</p>
                            <div className="space-y-0.5">
                                <Link
                                    href="/admin"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${pathname === '/admin' ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'}`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${pathname === '/admin' ? 'bg-black/10' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'}`}>
                                        <ShieldCheck className={`w-3.5 h-3.5 ${pathname === '/admin' ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`} />
                                    </div>
                                    <span className="text-[13px] font-semibold tracking-tight">{t('dash.admin.panel')}</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Section - User Center */}
                <div className="p-4 border-t border-white/5">
                    <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group">
                        <Avatar src={user?.avatar_url} name={user?.name} size="sm" className="border-zinc-800" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-[11px] text-zinc-500 font-mono truncate">{user?.email}</p>
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
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                                    }
                                }}
                                placeholder={t('dash.search.placeholder')}
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 ml-8">
                        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest border-r border-white/5 pr-6 relative">
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
                                    {t('dash.sort.by')}
                                </button>
                                <AnimatePresence>
                                    {sortOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-4 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]"
                                        >
                                            {[t('dash.sort.newest'), t('dash.sort.oldest'), t('dash.sort.priority.high'), t('dash.sort.priority.low')].map((opt) => (
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
                                    {t('dash.filters')}
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
                                                <span className="text-[11px] text-zinc-600">{t('dash.filter.status')}</span>
                                            </div>
                                            {[t('dash.filter.all'), t('dash.filter.transit'), t('dash.filter.pending'), t('dash.filter.critical')].map((opt) => (
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
                                    {notifUnread > 0 && (
                                        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-emerald-500 rounded-full border-2 border-[#050505] flex items-center justify-center text-[9px] font-bold text-black px-0.5">
                                            {notifUnread > 9 ? '9+' : notifUnread}
                                        </span>
                                    )}
                                    {notifUnread === 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-zinc-700 rounded-full border-2 border-[#050505]" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {notifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute top-full right-0 mt-4 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl z-[60]"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] font-outfit">{t('dash.alerts')}</h3>
                                                {notifUnread > 0 && (
                                                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                        {notifUnread} new
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                                {notifications.length > 0 ? notifications.map((n: any, i: number) => (
                                                    <Link
                                                        key={i}
                                                        href={n.type === 'NEW_QUOTE' ? '/dashboard/shipments' : n.link ? n.link : '/dashboard/messages'}
                                                        onClick={() => setNotifOpen(false)}
                                                        className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all"
                                                    >
                                                        <span className="text-base flex-shrink-0">{n.type === 'NEW_QUOTE' ? '📦' : '💬'}</span>
                                                        <div className="min-w-0 space-y-0.5">
                                                            <p className="text-xs font-semibold text-white leading-snug">
                                                                {n.type === 'NEW_QUOTE' ? 'New quote received' : n.title || 'New message'}
                                                            </p>
                                                            {n.body && <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{n.body}</p>}
                                                            <p className="text-[9px] text-zinc-700">{n.time_ago || (n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : '')}</p>
                                                        </div>
                                                        <span className="text-[9px] text-emerald-400 font-semibold flex-shrink-0 self-center">View →</span>
                                                    </Link>
                                                )) : (
                                                    <div className="py-10 text-center opacity-30">
                                                        <Bell className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
                                                        <p className="text-xs text-zinc-500">{t('dash.no.alerts')}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <Link href="/dashboard/activity" onClick={() => setNotifOpen(false)} className="block mt-4 pt-4 border-t border-white/5 text-center text-xs text-zinc-500 hover:text-white transition-colors">
                                                {t('dash.view.activity')}
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {user?.role !== 'forwarder' && (
                            <Link href="/search" className="bg-white text-black text-xs font-semibold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Plus className="w-4 h-4" /> {t('dash.book')}
                            </Link>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 h-[calc(100vh-80px)]">
                    {children}
                </main>
            </div>
        </div>
    )
}
