'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon, ShieldCheck } from 'lucide-react';
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
                { label: "Partner Directory", href: "/forwarders", desc: "Verified Partner Network" },
                { label: "Carrier Registration", href: "/forwarders/register", desc: "Join the Sovereign Network" },
                { label: "Shipper Portal", href: "/shippers", desc: "Tactical Cargo Orchestration" },
                { label: "Live Telemetry", href: "/vessels", desc: "Global Asset Tracking" },
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
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-fit ${scrolled ? 'scale-95' : 'scale-100'
                }`}
        >
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-12">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="h-7 w-7 bg-white text-black flex items-center justify-center font-bold text-lg rounded-full group-hover:bg-blue-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                        S
                    </div>
                    <span className="text-sm font-black tracking-widest text-white font-outfit">SOVEREIGN</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-12 whitespace-nowrap">
                    {/* HIDE SHIPPER TOOLS FOR FORWARDERS */}
                    {user?.role !== 'forwarder' && (
                        <>
                            {/* 1. Services Dropdown */}
                            <div
                                className="relative group h-full flex items-center"
                                onMouseEnter={() => setActiveDropdown('Services')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                                    Services <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'Services' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-64"
                                        >
                                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden">
                                                {navItems[0].children.map(child => (
                                                    <Link
                                                        key={child.label}
                                                        href={child.href}
                                                        className="block px-4 py-3 hover:bg-white/5 rounded-xl group/item"
                                                    >
                                                        <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover/item:text-white transition-colors">{child.label}</div>
                                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{child.desc}</div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Link href="/search" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                                Instant Search
                            </Link>
                        </>
                    )}

                    {user && (
                        <Link href="/dashboard" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${user?.role === 'forwarder' ? 'text-emerald-400 hover:text-white' : 'text-zinc-400 hover:text-white'}`}>
                            {user?.role === 'forwarder' ? 'Partner Dashboard' : 'Dashboard'}
                        </Link>
                    )}

                    {user?.role === 'forwarder' && (
                        <Link href="/forwarders/portal" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 hover:text-white transition-colors flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" /> Secure Portal
                        </Link>
                    )}

                    {/* HIDE TOOLS FOR FORWARDERS */}
                    {user?.role !== 'forwarder' && (
                        <div
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setActiveDropdown('Tools')}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                                Tools <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                            <AnimatePresence>
                                {activeDropdown === 'Tools' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-64"
                                    >
                                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden">
                                            {navItems[1].children.map(child => (
                                                <Link
                                                    key={child.label}
                                                    href={child.href}
                                                    className="block px-4 py-3 hover:bg-white/5 rounded-xl group/item"
                                                >
                                                    <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover/item:text-white transition-colors">{child.label}</div>
                                                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{child.desc}</div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-8 shrink-0">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'User' ? null : 'User')}
                                className="relative group transition-transform active:scale-95 flex items-center gap-3"
                            >
                                <div className="relative">
                                    <Avatar
                                        src={user.avatar_url}
                                        name={user.name}
                                        size="sm"
                                        className="border-white/10 group-hover:border-white/40 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[9px] font-black text-white tracking-widest leading-none mb-0.5 uppercase">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                                    <span className="text-[6px] font-black text-zinc-500 tracking-[0.2em] leading-none uppercase">{user.sovereign_id || 'ALPHA-1'}</span>
                                </div>
                                <ChevronDown className={`w-3 h-3 text-zinc-600 transition-transform duration-300 ${activeDropdown === 'User' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {activeDropdown === 'User' && (
                                    <>
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setActiveDropdown(null)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-6 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-3xl p-2 overflow-hidden z-[100]"
                                        >
                                            <div className="p-4 border-b border-white/5 mb-1">
                                                {user?.sovereign_id?.startsWith('REG-') ? (
                                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Sovereign Partner</p>
                                                ) : (
                                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Authenticated Citizen</p>
                                                )}
                                                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                                            </div>
                                            {user?.sovereign_id?.startsWith('REG-') && (
                                                <Link href="/forwarders/portal" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-500/10 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all group/item">
                                                    <ShieldCheck className="w-4 h-4 opacity-70 group-hover/item:opacity-100" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Partner Portal</span>
                                                </Link>
                                            )}
                                            <Link href="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all group/item">
                                                <UserIcon className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                                            </Link>
                                            <Link href="/settings" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all group/item">
                                                <SettingsIcon className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                                            </Link>
                                            <div className="h-px bg-white/5 my-2 mx-2" />
                                            <button onClick={() => { logout(); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all group/item">
                                                <LogOut className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Log In</Link>
                            <Link href="/signup" className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]">Sign Up</Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black fixed top-16 left-0 right-0 z-40 overflow-y-auto"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {/* Mobile Links */}
                            <div className="space-y-4">
                                {user?.role !== 'forwarder' && (
                                    <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-white">Instant Search</Link>
                                )}
                                {user && (
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-white">
                                        {user?.role === 'forwarder' ? 'Partner Dashboard' : 'Dashboard'}
                                    </Link>
                                )}
                                {user?.role === 'forwarder' && (
                                    <Link href="/forwarders/portal" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-emerald-400">Partner Portal</Link>
                                )}

                                {user?.role !== 'forwarder' && (
                                    <>
                                        <div className="h-px bg-white/10 my-4" />
                                        {navItems[0].children.map(child => (
                                            <Link key={child.label} href={child.href} onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white py-1">
                                                {child.label}
                                            </Link>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="h-px bg-white/10 my-4" />

                            {/* Mobile Auth */}
                            {user ? (
                                <div className="space-y-4">
                                    <div className="text-center text-gray-800 font-black tracking-widest text-[10px] uppercase mb-4">CITIZEN PROTOCOL: ACTIVE</div>
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-bold py-3 border border-white/10 rounded-xl text-sm">
                                        Profile
                                    </Link>
                                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-bold py-3 border border-white/10 rounded-xl text-sm">
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-center text-red-500 font-bold py-3 border border-red-500/20 bg-red-500/5 rounded-xl text-sm"
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
