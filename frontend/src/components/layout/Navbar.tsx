'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // Handle Scroll Effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Text-Only Nav Structure (Professional)
    const navItems = [
        {
            label: "Services",
            children: [
                { label: "Ocean Freight", href: "/services/ocean-freight", desc: "Global FCL & LCL" },
                { label: "Air Freight", href: "/services/air-freight", desc: "Express Cargo" },
                { label: "Road Freight", href: "/services/road-freight", desc: "FTL & LTL Network" },
                { label: "Warehousing", href: "/services/smart-warehousing", desc: "3PL Solutions" },
                { label: "Customs", href: "/services/customs-compliance", desc: "Clearance & Brokerage" },
            ]
        },
        {
            label: "Tools",
            children: [
                { label: "Freight Calculator", href: "/tools/calculator", desc: "Instant Estimates" },
                { label: "HS Code Lookup", href: "/tools/hs-codes", desc: "Classification Engine" },
                { label: "Container Tracking", href: "/tracking", desc: "Real-time Visibility" },
            ]
        },
        {
            label: "Company",
            children: [
                { label: "About Us", href: "/about", desc: "Our Mission" },
                { label: "Contact", href: "/contact", desc: "24/7 Support" }
            ]
        }
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${scrolled ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 z-50 group">
                        <div className="h-8 w-8 bg-white text-black flex items-center justify-center font-bold text-xl rounded-md group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            O
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">OMEGO</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* 1. Services Dropdown */}
                        <div
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setActiveDropdown('Services')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Services <ChevronDown className="w-3 h-3 text-gray-500" />
                            </button>
                            <AnimatePresence>
                                {activeDropdown === 'Services' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-64"
                                    >
                                        <div className="bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-2 overflow-hidden">
                                            {navItems[0].children.map(child => (
                                                <Link
                                                    key={child.label}
                                                    href={child.href}
                                                    className="block px-4 py-3 hover:bg-white/5 rounded-lg group/item"
                                                >
                                                    <div className="text-sm font-bold text-gray-200 group-hover/item:text-white">{child.label}</div>
                                                    <div className="text-xs text-gray-500">{child.desc}</div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link href="/search" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Instant Search
                        </Link>
                        <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Dashboard
                        </Link>

                        {/* 3. Tools Dropdown */}
                        <div
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setActiveDropdown('Tools')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Tools <ChevronDown className="w-3 h-3 text-gray-500" />
                            </button>
                            <AnimatePresence>
                                {activeDropdown === 'Tools' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-64"
                                    >
                                        <div className="bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-2 overflow-hidden">
                                            {navItems[1].children.map(child => (
                                                <Link
                                                    key={child.label}
                                                    href={child.href}
                                                    className="block px-4 py-3 hover:bg-white/5 rounded-lg group/item"
                                                >
                                                    <div className="text-sm font-bold text-gray-200 group-hover/item:text-white">{child.label}</div>
                                                    <div className="text-xs text-gray-500">{child.desc}</div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/request-quote"
                            className="text-sm font-bold text-white hover:text-blue-400 transition-colors"
                        >
                            Get a Quote
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <Link
                                    href="/dashboard/settings"
                                    className="relative group transition-transform active:scale-95"
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="w-9 h-9 rounded-full border border-white/20 object-cover group-hover:border-white transition-colors"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-white transition-colors">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                </Link>
                                <div className="hidden lg:flex flex-col">
                                    <span className="text-[9px] uppercase tracking-tighter text-zinc-500 font-black leading-none mb-1">Authenticated</span>
                                    <span className="text-[10px] font-black text-white tracking-widest">{user.sovereign_id}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-transform hover:scale-105"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <Link
                            href="/request-quote"
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                            QUOTE
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-zinc-950 fixed top-16 left-0 right-0 z-40 overflow-y-auto"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {/* Mobile Links */}
                            <div className="space-y-4">
                                <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-white">Instant Search</Link>
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-white">Dashboard</Link>
                                <div className="h-px bg-white/10 my-4" />
                                {navItems[0].children.map(child => (
                                    <Link key={child.label} href={child.href} onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white py-1">
                                        {child.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="h-px bg-white/10 my-4" />

                            {/* Mobile Auth */}
                            {user ? (
                                <div className="space-y-4">
                                    <div className="text-center text-gray-500 font-mono text-xs">Logged In</div>
                                    <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-bold py-3 border border-white/10 rounded-xl">
                                        Settings
                                    </Link>
                                    <button onClick={logout} className="block w-full text-center text-red-500 font-bold py-3 border border-red-900/30 rounded-xl">Log Out</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center border border-white/10 rounded-xl text-white font-bold">Log In</Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center bg-white text-black rounded-xl font-bold">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
