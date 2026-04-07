'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useT } from '@/lib/i18n/t';
import {
    Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon,
    Ship, Plane, Truck, Warehouse, FileCheck,
    Store, Users, UserPlus,
    Calculator, BookOpen,
    Info, MessageSquare,
} from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '@/components/visuals/Avatar';


interface NavChild { label: string; href: string; desc: string; icon: React.ElementType }

function DropdownMenu({ items }: { items: NavChild[] }) {
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
                        <div className="text-xs font-semibold text-zinc-300 group-hover/item:text-white transition-colors font-inter leading-tight">{child.label}</div>
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
    const { lang, setLang } = useLanguage();
    const t = useT();

    const navItems = [
        {
            label: t('nav.services'),
            children: [
                { label: t('nav.ocean'), href: '/services/ocean-freight', desc: t('nav.ocean.desc'), icon: Ship },
                { label: t('nav.air'), href: '/services/air-freight', desc: t('nav.air.desc'), icon: Plane },
                { label: t('nav.road'), href: '/services/road-freight', desc: t('nav.road.desc'), icon: Truck },
                { label: t('nav.warehouse'), href: '/services/smart-warehousing', desc: t('nav.warehouse.desc'), icon: Warehouse },
                { label: t('nav.customs.svc'), href: '/services/customs-compliance', desc: t('nav.customs.desc'), icon: FileCheck },
            ],
        },
        {
            label: t('nav.ecosystem'),
            children: [
                { label: t('nav.marketplace'), href: '/marketplace', desc: t('nav.marketplace.desc'), icon: Store },
                { label: t('nav.partner.dir'), href: '/forwarders', desc: t('nav.partner.dir.desc'), icon: Users },
                { label: t('nav.carrier.reg'), href: '/forwarders/register', desc: t('nav.carrier.reg.desc'), icon: UserPlus },
            ],
        },
        {
            label: t('nav.tools'),
            children: [
                { label: t('nav.calculator'), href: '/tools/calculator', desc: t('nav.calculator.desc'), icon: Calculator },
                { label: t('nav.hs'), href: '/tools/hs-codes', desc: t('nav.hs.desc'), icon: BookOpen },
            ],
        },
        {
            label: t('nav.company'),
            children: [
                { label: t('nav.about'), href: '/about', desc: t('nav.about.desc'), icon: Info },
                { label: t('nav.contact'), href: '/contact', desc: t('nav.contact.desc'), icon: MessageSquare },
            ],
        },
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${scrolled ? 'scale-[0.97]' : 'scale-100'}`}>
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-full px-20 h-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between w-max min-w-[1100px] max-w-[95vw]">
                {/* Logo Area */}
                <div className="w-[220px] shrink-0">
                    <Link href="/" className="flex items-center group">
                        <img src="/cargolink.png" alt="CargoLink" className="h-14 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>

                {/* Primary Nav Links */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-10 whitespace-nowrap">

                    {user?.role !== 'forwarder' && (
                        <>
                            {/* Services */}
                            <div
                                className="relative flex items-center"
                                onMouseEnter={() => setActiveDropdown('Services')}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                                    {t('nav.services')} <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Services' ? 'rotate-180' : ''}`} />
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

                            <Link href="/search" className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                                {t('nav.search')}
                            </Link>
                        </>
                    )}

                    {user && (
                        <Link href="/dashboard" className={`text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${user?.role === 'forwarder' ? 'text-emerald-400 hover:text-white' : 'text-zinc-400 hover:text-white'}`}>
                            {user?.role === 'forwarder' ? t('nav.partner.dashboard') : t('nav.dashboard')}
                        </Link>
                    )}

                    {user?.role === 'forwarder' && (
                        <Link href="/forwarders/portal" className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                            {t('nav.portal')}
                        </Link>
                    )}

                    {/* Ecosystem */}
                    <div
                        className="relative flex items-center"
                        onMouseEnter={() => setActiveDropdown('Ecosystem')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <button className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                            {t('nav.ecosystem')} <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Ecosystem' ? 'rotate-180' : ''}`} />
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
                        <button className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                            {t('nav.tools')} <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Tools' ? 'rotate-180' : ''}`} />
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
                        <button className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                            {t('nav.company')} <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeDropdown === 'Company' ? 'rotate-180' : ''}`} />
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

                {/* Auth & Mobile Toggle Section */}
                <div className="flex items-center justify-end shrink-0 gap-4 pl-10">
                    <button
                        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                        className="hidden md:block text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-inter px-2"
                    >
                        {lang === 'en' ? 'عربي' : 'EN'}
                    </button>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'User' ? null : 'User')}
                                className="relative group transition-transform active:scale-95 flex items-center gap-4 py-1.5"
                            >
                                <div className="relative">
                                    <Avatar
                                        src={user.avatar_url}
                                        name={user.name}
                                        size="md"
                                        className="border-white/10 group-hover:border-white/40 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                                </div>
                                <div className="flex flex-col items-start translate-y-[-1px]">
                                    <span className="text-sm font-black text-white leading-none mb-1.5 tracking-tight">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono leading-none tracking-tighter uppercase opacity-80">{user.sovereign_id || ''}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-zinc-600 transition-all duration-500 ${activeDropdown === 'User' ? 'rotate-180 text-white shadow-[0_0_10px_white]' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {activeDropdown === 'User' && (
                                    <>
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setActiveDropdown(null)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                                            className="absolute top-full right-0 mt-4 w-52 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-1.5 z-[100]"
                                        >
                                            <div className="px-3 py-2.5 border-b border-white/[0.05] mb-1">
                                                <p className="text-xs font-semibold text-white font-inter truncate">{user.name}</p>
                                                <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{user.sovereign_id}</p>
                                            </div>
                                            {user?.role === 'forwarder' && (
                                                <Link href="/forwarders/portal" onClick={() => setActiveDropdown(null)} className="flex items-center gap-2.5 px-3 py-2 hover:bg-emerald-500/10 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all">
                                                    <Store className="w-3.5 h-3.5 opacity-70" />
                                                    <span className="text-xs font-semibold font-inter">{t('nav.partner.portal')}</span>
                                                </Link>
                                            )}
                                            <Link href="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
                                                <UserIcon className="w-3.5 h-3.5 opacity-60" />
                                                <span className="text-xs font-semibold font-inter">{t('nav.profile')}</span>
                                            </Link>
                                            <Link href="/settings" onClick={() => setActiveDropdown(null)} className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
                                                <SettingsIcon className="w-3.5 h-3.5 opacity-60" />
                                                <span className="text-xs font-semibold font-inter">{t('nav.settings')}</span>
                                            </Link>
                                            <div className="h-px bg-white/[0.05] my-1 mx-1" />
                                            <button onClick={() => { logout(); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-400 transition-all">
                                                <LogOut className="w-3.5 h-3.5 opacity-60" />
                                                <span className="text-xs font-semibold font-inter">{t('nav.signout')}</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end gap-4">
                            <Link href="/login" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-white transition-all duration-200 px-4 py-2 rounded-full hover:bg-white/10">{t('nav.login')}</Link>
                            <Link href="/signup" className="bg-white text-black px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95 whitespace-nowrap">{t('nav.signup')}</Link>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white hover:text-zinc-300 transition-colors ml-4">
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu — full width, positioned below h-16 bar */}
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
                                    <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-semibold text-white font-inter">{t('nav.search')}</Link>
                                )}
                                {user && (
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-semibold text-white font-inter">
                                        {user?.role === 'forwarder' ? t('nav.partner.dashboard') : t('nav.dashboard')}
                                    </Link>
                                )}
                                {user?.role === 'forwarder' && (
                                    <Link href="/forwarders/portal" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-semibold text-emerald-400 font-inter">{t('nav.partner.portal')}</Link>
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
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-semibold py-3 border border-white/10 rounded-xl text-sm font-inter">{t('nav.profile')}</Link>
                                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-white font-semibold py-3 border border-white/10 rounded-xl text-sm font-inter">{t('nav.settings')}</Link>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-center text-red-500 font-semibold py-3 border border-red-500/20 bg-red-500/5 rounded-xl text-sm font-inter">{t('nav.signout')}</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center border border-white/10 rounded-xl text-white font-semibold text-sm font-inter">{t('nav.login')}</Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="py-3 text-center bg-white text-black rounded-xl font-semibold text-sm font-inter">{t('nav.signup')}</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
