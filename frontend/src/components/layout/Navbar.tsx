'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useT } from '@/lib/i18n/t';
import {
    Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon,
    Ship, Plane, Truck, Warehouse, FileCheck,
    Store,
    Calculator, BookOpen,
    Info, MessageSquare,
    LayoutDashboard, Package, Search, ArrowRight,
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
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
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

    const mobileAccordionSections = [
        ...(user?.role !== 'forwarder' ? [{ key: 'services', label: t('nav.services'), icon: Ship, items: navItems[0].children }] : []),
        { key: 'tools', label: t('nav.tools'), icon: Calculator, items: navItems[1].children },
        { key: 'company', label: t('nav.company'), icon: Info, items: navItems[2].children },
    ];

    return (
        <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${scrolled ? 'scale-[0.97]' : 'scale-100'}`}>
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-full px-4 md:px-20 h-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between w-[calc(100vw-32px)] md:w-max md:min-w-[1100px]">
                {/* Logo Area */}
                <div className="w-auto md:w-[220px] shrink-0">
                    <Link href="/" className="flex items-center group">
                        <img src="/cargolink.png" alt="CargoLink" className="h-9 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
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

                            <Link href="/marketplace" className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                                {t('nav.search')}
                            </Link>
                        </>
                    )}

                    {user && (
                        <Link href={user?.role === 'forwarder' ? '/forwarders/portal' : '/dashboard'} className={`text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${user?.role === 'forwarder' ? 'text-white/70 hover:text-white' : 'text-zinc-400 hover:text-white'}`}>
                            {user?.role === 'forwarder' ? t('nav.partner.dashboard') : t('nav.dashboard')}
                        </Link>
                    )}

                    {/* Partner Registration / F2F Request — direct link */}
                    {user?.role === 'forwarder' ? (
                        <Link href="/forwarders/f2f" className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                            F2F Request
                        </Link>
                    ) : (
                        <Link href="/forwarders/register" className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-white transition-colors">
                            {t('nav.carrier.reg')}
                        </Link>
                    )}

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
                                    <DropdownMenu items={navItems[1].children} />
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
                                    <DropdownMenu items={navItems[2].children} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Auth & Mobile Toggle Section */}
                <div className="flex items-center justify-end shrink-0 gap-2 md:gap-4 pl-2 md:pl-10">
                    <button
                        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                        className="hidden md:block text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-inter px-2"
                    >
                        {lang === 'en' ? 'عربي' : 'EN'}
                    </button>
                    {user ? (
                        <div className="hidden md:block relative">
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'User' ? null : 'User')}
                                className="relative group transition-transform active:scale-95 flex items-center gap-2 md:gap-4 py-1.5"
                            >
                                <div className="relative">
                                    <Avatar
                                        src={user.avatar_url}
                                        name={user.name}
                                        size="md"
                                        className="border-white/10 group-hover:border-white/40 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white border-2 border-black rounded-full" />
                                </div>
                                <div className="hidden md:flex flex-col items-start translate-y-[-1px]">
                                    <span className="text-sm font-black text-white leading-none mb-1.5 tracking-tight">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono leading-none tracking-tighter uppercase opacity-80">{user.sovereign_id || ''}</span>
                                </div>
                                <ChevronDown className={`hidden md:block w-4 h-4 text-zinc-600 transition-all duration-500 ${activeDropdown === 'User' ? 'rotate-180 text-white shadow-[0_0_10px_white]' : ''}`} />
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
                                                <Link href="/forwarders/portal" onClick={() => setActiveDropdown(null)} className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.06] rounded-xl text-zinc-300 hover:text-white transition-all">
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
                        <div className="hidden md:flex items-center justify-end gap-4">
                            <Link href="/login" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-white transition-all duration-200 px-4 py-2 rounded-full hover:bg-white/10">{t('nav.login')}</Link>
                            <Link href="/signup" className="bg-white text-black px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95 whitespace-nowrap">{t('nav.signup')}</Link>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button onClick={() => { setMobileMenuOpen(v => { if (v) setExpandedSection(null); return !v; }); }} className="md:hidden text-white hover:text-zinc-300 transition-colors ml-4">
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu — Dizilo-style dropdown card */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="md:hidden fixed inset-0 z-[55]" onClick={() => { setMobileMenuOpen(false); setExpandedSection(null); }} />

                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="md:hidden absolute top-full left-0 right-0 mt-3 z-[60] bg-[#0f0f0f] border border-white/[0.09] rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.95)]"
                        >
                            <div className="px-5 pt-4 pb-5 max-h-[75vh] overflow-y-auto">

                                {/* User row */}
                                {user && (
                                    <div className="flex items-center gap-3 pb-4 mb-1 border-b border-white/[0.06]">
                                        <Avatar src={user.avatar_url} name={user.name} size="sm" className="shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-bold text-white truncate">{user.name}</p>
                                            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider mt-0.5">{user.sovereign_id}</p>
                                        </div>
                                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-zinc-600 border border-white/[0.07] rounded-lg px-2 py-1">
                                            {user.role === 'forwarder' ? 'Partner' : user.role === 'admin' ? 'Admin' : 'Shipper'}
                                        </span>
                                    </div>
                                )}

                                {/* Nav items — accordion */}
                                <div className="divide-y divide-white/[0.05]">

                                    {/* Role-based quick links */}
                                    {user && (
                                        <>
                                            <Link href={user.role === 'forwarder' ? '/forwarders/portal' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-4 py-4 text-[15px] font-medium text-zinc-300 active:text-white transition-colors">
                                                <LayoutDashboard className="w-[17px] h-[17px] text-zinc-600 shrink-0" />
                                                {user.role === 'forwarder' ? t('nav.partner.dashboard') : 'Dashboard'}
                                            </Link>
                                            {user.role !== 'forwarder' && (
                                                <Link href="/dashboard/shipments" onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-4 py-4 text-[15px] font-medium text-zinc-300 active:text-white transition-colors">
                                                    <Package className="w-[17px] h-[17px] text-zinc-600 shrink-0" />
                                                    My Shipments
                                                </Link>
                                            )}
                                            <Link href="/dashboard/messages" onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-4 py-4 text-[15px] font-medium text-zinc-300 active:text-white transition-colors">
                                                <MessageSquare className="w-[17px] h-[17px] text-zinc-600 shrink-0" />
                                                Messages
                                            </Link>
                                        </>
                                    )}

                                    {/* Instant Search — direct link (not for forwarders) */}
                                    {user?.role !== 'forwarder' && (
                                        <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-4 py-4 text-[15px] font-medium text-zinc-300 active:text-white transition-colors">
                                            <Search className="w-[17px] h-[17px] text-zinc-600 shrink-0" />
                                            {t('nav.search')}
                                        </Link>
                                    )}

                                    {/* Partner Registration / F2F — direct link */}
                                    {user?.role === 'forwarder' ? (
                                        <Link href="/forwarders/f2f" onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-4 py-4 text-[15px] font-medium text-zinc-300 active:text-white transition-colors">
                                            <Store className="w-[17px] h-[17px] text-zinc-600 shrink-0" />
                                            F2F Request
                                        </Link>
                                    ) : (
                                        <Link href="/forwarders/register" onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-4 py-4 text-[15px] font-medium text-zinc-300 active:text-white transition-colors">
                                            <Store className="w-[17px] h-[17px] text-zinc-600 shrink-0" />
                                            {t('nav.carrier.reg')}
                                        </Link>
                                    )}

                                    {/* Expandable sections: Services / Ecosystem / Tools / Company */}
                                    {mobileAccordionSections.map(({ key, label, icon: Icon, items }) => {
                                        const isOpen = expandedSection === key;
                                        return (
                                            <div key={key}>
                                                <button
                                                    onClick={() => setExpandedSection(isOpen ? null : key)}
                                                    className="w-full flex items-center gap-4 py-4 text-[15px] font-medium text-zinc-300 transition-colors"
                                                >
                                                    <Icon className="w-[17px] h-[17px] text-zinc-600 shrink-0" />
                                                    <span className="flex-1 text-left">{label}</span>
                                                    <ChevronDown className={`w-4 h-4 text-zinc-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.18, ease: 'easeInOut' }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pl-9 pb-2">
                                                                {items.map((child: NavChild) => (
                                                                    <Link key={child.href} href={child.href} onClick={() => setMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-3 text-sm text-zinc-500 active:text-zinc-200 transition-colors">
                                                                        <child.icon className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                                                                        {child.label}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Auth actions */}
                                <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-2.5">
                                    {user ? (
                                        <>
                                            <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-black font-bold text-sm rounded-2xl active:bg-zinc-200 transition-colors">
                                                Get a Quote <ArrowRight className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                                                className="w-full py-2.5 text-sm font-medium text-zinc-600 active:text-red-400 transition-colors text-center">
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                                                className="py-3.5 text-center border border-white/[0.1] rounded-2xl text-white font-semibold text-sm active:bg-white/5 transition-colors">
                                                Log In
                                            </Link>
                                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}
                                                className="py-3.5 text-center bg-white text-black rounded-2xl font-bold text-sm active:bg-zinc-200 transition-colors">
                                                Sign Up
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
