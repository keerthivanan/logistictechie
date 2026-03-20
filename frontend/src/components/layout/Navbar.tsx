'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon,
    Ship, Plane, Truck, Warehouse, FileCheck,
    Store, Users, UserPlus, Search as SearchIcon,
    Calculator, BookOpen,
    Info, MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '@/components/visuals/Avatar';

const navItems = [
    {
        label: 'Services',
        children: [
            { label: 'Ocean Freight', href: '/services/ocean-freight', desc: 'Global FCL & LCL', icon: Ship },
            { label: 'Air Freight', href: '/services/air-freight', desc: 'Express Cargo', icon: Plane },
            { label: 'Road Freight', href: '/services/road-freight', desc: 'FTL & LTL Network', icon: Truck },
            { label: 'Warehousing', href: '/services/smart-warehousing', desc: '3PL Solutions', icon: Warehouse },
            { label: 'Customs', href: '/services/customs-compliance', desc: 'Clearance & Brokerage', icon: FileCheck },
        ],
    },
    {
        label: 'Ecosystem',
        children: [
            { label: 'CargoLink Marketplace', href: '/marketplace', desc: 'Live Freight Tendering', icon: Store },
            { label: 'Partner Directory', href: '/forwarders', desc: 'Global Logistics Network', icon: Users },
            { label: 'Carrier Registration', href: '/forwarders/register', desc: 'Join the CargoLink Network', icon: UserPlus },
            { label: 'Shipper Tools', href: '/search', desc: 'Search & Book Shipments', icon: SearchIcon },
        ],
    },
    {
        label: 'Tools',
        children: [
            { label: 'Freight Calculator', href: '/tools/calculator', desc: 'Instant Cost Estimates', icon: Calculator },
            { label: 'HS Code Lookup', href: '/tools/hs-codes', desc: 'Classification Engine', icon: BookOpen },
        ],
    },
    {
        label: 'Company',
        children: [
            { label: 'About Us', href: '/about', desc: 'Our Mission & Team', icon: Info },
            { label: 'Contact', href: '/contact', desc: '24/7 Support', icon: MessageSquare },
        ],
    },
];

function DropdownMenu({ items }: { items: typeof navItems[0]['children'] }) {
    return (
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 min-w-[220px]">
            {items.map((child) => (
                <Link
                    key={child.label}
                    href={child.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] group/item transition-colors"
                >
                    <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover/item:border-white/[0.12] transition-colors">
                        <child.icon className="w-3.5 h-3.5 text-zinc-500 group-hover/item:text-white transition-colors" />
                    </div>
                    <div>
                        <div className="text-xs font-black text-zinc-300 group-hover/item:text-white transition-colors font-inter leading-tight">{child.label}</div>
                        <div className="text-[10px] text-zinc-600 font-inter mt-0.5">{child.desc}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-fit max-w-[calc(100vw-2rem)] ${scrolled ? 'scale-95' : 'scale-100'}`}>
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className="h-7 w-7 bg-white text-black flex items-center justify-center font-black text-sm rounded-full group-hover:bg-zinc-200 transition-all">
                        C
                    </div>
                    <span className="text-sm font-black tracking-widest text-white font-outfit">CARGOLINK</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-5 whitespace-nowrap">

                    {user?.role !== 'forwarder' && (
                        <>
                            {/* Services */}
                            <div
                                className="relative flex items-center"
                                onMouseEnter={() => setActiveDropdown('Services')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                                    Services <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Services' ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'Services' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 pt-5"
                                        >
                                            <DropdownMenu items={navItems[0].children} />
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
                        <Link href="/forwarders/portal" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                            Portal
                        </Link>
                    )}

                    {/* Ecosystem */}
                    <div
                        className="relative flex items-center"
                        onMouseEnter={() => setActiveDropdown('Ecosystem')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                            Ecosystem <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Ecosystem' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'Ecosystem' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 pt-5"
                                >
                                    <DropdownMenu items={navItems[1].children} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Tools */}
                    <div
                        className="relative flex items-center"
                        onMouseEnter={() => setActiveDropdown('Tools')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                            Tools <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Tools' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'Tools' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 pt-5"
                                >
                                    <DropdownMenu items={navItems[2].children} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Company */}
                    <div
                        className="relative flex items-center"
                        onMouseEnter={() => setActiveDropdown('Company')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                            Company <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Company' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'Company' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 pt-5"
                                >
                                    <DropdownMenu items={navItems[3].children} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Right side */}
                <div className="flex items-center gap-5 shrink-0">
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
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs font-semibold text-white leading-none mb-0.5">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono leading-none">{user.sovereign_id || ''}</span>
                                </div>
                                <ChevronDown className={`w-3 h-3 text-zinc-600 transition-transform duration-300 ${activeDropdown === 'User' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {activeDropdown === 'User' && (
                                    <>
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setActiveDropdown(null)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full right-0 mt-5 w-60 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 z-[100]"
                                        >
                                            <div className="px-3 py-3 border-b border-white/[0.05] mb-1">
                                                {user?.sovereign_id?.startsWith('REG-') ? (
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 font-inter">CargoLink Partner</p>
                                                ) : (
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 font-inter">CargoLink Member</p>
                                                )}
                                                <p className="text-xs font-bold text-white font-inter truncate">{user.name}</p>
                                            </div>
                                            {user?.sovereign_id?.startsWith('REG-') && (
                                                <Link href="/forwarders/portal" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-500/10 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all group/item">
                                                    <Store className="w-4 h-4 opacity-60 group-hover/item:opacity-100" />
                                                    <span className="text-xs font-semibold font-inter">Partner Portal</span>
                                                </Link>
                                            )}
                                            <Link href="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all group/item">
                                                <UserIcon className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                                                <span className="text-xs font-semibold font-inter">Profile</span>
                                            </Link>
                                            <Link href="/settings" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all group/item">
                                                <SettingsIcon className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                                                <span className="text-xs font-semibold font-inter">Settings</span>
                                            </Link>
                                            <div className="h-px bg-white/[0.05] my-2 mx-2" />
                                            <button onClick={() => { logout(); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all group/item">
                                                <LogOut className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                                                <span className="text-xs font-semibold font-inter">Sign Out</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Log In</Link>
                            <Link href="/signup" className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">Sign Up</Link>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black fixed top-16 left-0 right-0 z-40 overflow-y-auto"
                    >
                        <div className="px-6 py-8 space-y-6">
                            <div className="space-y-4">
                                {user?.role !== 'forwarder' && (
                                    <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-black text-white font-inter">Instant Search</Link>
                                )}
                                {user && (
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-black text-white font-inter">
                                        {user?.role === 'forwarder' ? 'Partner Dashboard' : 'Dashboard'}
                                    </Link>
                                )}
                                {user?.role === 'forwarder' && (
                                    <Link href="/forwarders/portal" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-black text-emerald-400 font-inter">Partner Portal</Link>
                                )}
                                {user?.role !== 'forwarder' && (
                                    <>
                                        <div className="h-px bg-white/10 my-4" />
                                        {navItems[0].children.map(child => (
                                            <Link key={child.label} href={child.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-zinc-400 hover:text-white py-1 font-inter text-sm">
                                                <child.icon className="w-4 h-4" /> {child.label}
                                            </Link>
                                        ))}
                                    </>
                                )}
                            </div>
                            <div className="h-px bg-white/10" />
                            {user ? (
                                <div className="space-y-3">
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-black py-3 border border-white/10 rounded-xl text-sm font-inter">Profile</Link>
                                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-black py-3 border border-white/10 rounded-xl text-sm font-inter">Settings</Link>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-center text-red-500 font-black py-3 border border-red-500/20 bg-red-500/5 rounded-xl text-sm font-inter">Sign Out</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center border border-white/10 rounded-xl text-white font-black text-sm font-inter">Log In</Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center bg-white text-black rounded-xl font-black text-sm font-inter">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
