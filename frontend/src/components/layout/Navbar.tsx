'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '@/components/visuals/Avatar';

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
            label: "Ecosystem",
            children: [
                { label: "Sovereign Marketplace", href: "/marketplace", desc: "Live Freight Tendering" },
                { label: "Forwarder Directory", href: "/forwarders", desc: "Verified Partner Network" },
                { label: "Partner Registration", href: "/forwarder/register", desc: "Join the Sovereign Network" },
                { label: "Vessel Tracker", href: "/vessels", desc: "Global Asset Telemetry" },
                { label: "Container Tracking", href: "/tracking", desc: "Real-time Visibility" },
            ]
        },
        {
            label: "Tools",
            children: [
                { label: "Freight Calculator", href: "/tools/calculator", desc: "Instant Estimates" },
                { label: "HS Code Lookup", href: "/tools/hs-codes", desc: "Classification Engine" },
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
                        {user && (
                            <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                        )}

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
                        {!user && (
                            <Link
                                href="/request-quote"
                                className="text-sm font-bold text-white hover:text-blue-400 transition-colors"
                            >
                                Get a Quote
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === 'User' ? null : 'User')}
                                        className="relative group transition-transform active:scale-95 flex items-center gap-3"
                                    >
                                        <div className="relative">
                                            <Avatar
                                                src={user.avatar_url}
                                                name={user.name}
                                                size="md"
                                                className="border-white/10 group-hover:border-white/40 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-black rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] font-black text-white tracking-widest leading-none mb-1 uppercase opacity-80 group-hover:opacity-100">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                                            <span className="text-[7px] font-black text-green-500 tracking-[0.2em] leading-none uppercase mb-1">LOGGED IN</span>
                                            <span className="text-[8px] font-black text-blue-500 tracking-[0.2em] leading-none uppercase">{user.sovereign_id}</span>
                                        </div>
                                        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${activeDropdown === 'User' ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {activeDropdown === 'User' && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-[-1]"
                                                    onClick={() => setActiveDropdown(null)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full right-0 mt-4 w-72 bg-[#0a0c10] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[100]"
                                                >
                                                    {/* Image-Style Header */}
                                                    <div className="p-5 border-b border-white/5 bg-[#11141a]">
                                                        <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">ACTIVE PROTOCOL: LOGGED IN</p>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated Citizen</p>
                                                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                                    </div>

                                                    <div className="p-2 py-3">
                                                        <Link
                                                            href="/profile"
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group/item"
                                                        >
                                                            <UserIcon className="w-5 h-5 text-gray-500 group-hover/item:text-white" />
                                                            <span className="text-sm font-bold">Profile</span>
                                                        </Link>
                                                        <Link
                                                            href="/settings"
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all group/item"
                                                        >
                                                            <SettingsIcon className="w-5 h-5 text-gray-500 group-hover/item:text-white" />
                                                            <span className="text-sm font-bold">Settings</span>
                                                        </Link>
                                                    </div>

                                                    <div className="p-2 border-t border-white/5">
                                                        <button
                                                            onClick={() => {
                                                                setActiveDropdown(null);
                                                                logout();
                                                                router.push('/login');
                                                            }}
                                                            className="flex w-full items-center gap-4 px-4 py-3 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-500 transition-all group/item"
                                                        >
                                                            <LogOut className="w-5 h-5 group-hover/item:rotate-12 transition-transform" />
                                                            <span className="text-sm font-bold">Sign Out</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6 relative z-[60]">
                                <Link
                                    href="/login"
                                    className="text-sm font-bold text-gray-300 hover:text-white transition-colors py-2 px-1"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-black hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
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
                                {user && (
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-white">Dashboard</Link>
                                )}
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
                                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-bold py-3 border border-white/10 rounded-xl text-sm">
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                            router.push('/login');
                                        }}
                                        className="block w-full text-center text-red-500 font-bold py-3 border border-red-900/30 rounded-xl text-sm"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center border border-white/10 rounded-xl text-white font-bold text-sm">Log In</Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center bg-white text-black rounded-xl font-bold text-sm">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
