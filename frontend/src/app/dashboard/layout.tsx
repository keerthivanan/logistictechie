'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, CreditCard, Settings, LogOut, Bell } from 'lucide-react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Shipments', href: '/dashboard/shipments', icon: Package },
        { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-black text-white font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 fixed h-full bg-black z-10 hidden md:block">
                <div className="flex items-center h-16 px-6 border-b border-white/10">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-4 bg-white rounded-sm"></div>
                            <div className="w-2 h-4 bg-white/70 rounded-sm"></div>
                            <div className="w-2 h-4 bg-white/40 rounded-sm"></div>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">OMEGO</span>
                    </Link>
                </div>

                <nav className="p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-white text-black font-bold'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                    <Link href="/login" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black sticky top-0 z-10">
                    <h1 className="text-xl font-bold">Dashboard</h1>
                    <div className="flex items-center space-x-6">
                        <button className="text-gray-400 hover:text-white">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center font-bold border border-white/20">
                            JD
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
