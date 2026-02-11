"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Menu, X, Globe, LogOut, User, Ship, ChevronRight, Zap, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { language, setLanguage } = useLanguage();

    const isLoggedIn = status === "authenticated";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: '/quote', label: 'QUOTE_ENGINE' },
        { href: '/tracking', label: 'LIVE_TRACKING' },
        { href: '/market', label: 'MARKET_DATA' },
        { href: '/services', label: 'CAPABILITIES' },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-1000",
            isScrolled
                ? "bg-black/95 backdrop-blur-3xl border-b border-white/5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                : "bg-transparent py-10"
        )}>
            <div className="container max-w-[1400px] mx-auto px-8">
                <div className="flex items-center justify-between">

                    {/* Sovereign Branding */}
                    <Link href="/" className="flex items-center gap-6 group">
                        <div className="w-12 h-12 bg-white flex items-center justify-center relative transition-all duration-700 group-hover:bg-emerald-500 group-hover:rotate-12">
                            <Ship className="h-6 w-6 text-black" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-black animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-white italic tracking-[0.2em] leading-none mb-1">
                                PHOENIX<span className="text-zinc-800 font-bold not-italic">OS</span>
                            </h1>
                            <div className="h-[1px] w-full bg-zinc-950 group-hover:bg-emerald-500/30 transition-all duration-700" />
                        </div>
                    </Link>

                    {/* Tactical Navigation Links */}
                    <div className="hidden xl:flex items-center gap-14">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.6em] transition-all duration-700 relative group py-2",
                                    pathname === link.href ? "text-white" : "text-zinc-700 hover:text-white"
                                )}
                            >
                                {link.label}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 h-[1.5px] bg-emerald-500 transition-all duration-700",
                                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                                )} />
                                {pathname === link.href && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Operational Actions */}
                    <div className="hidden lg:flex items-center gap-10">
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                            className="flex items-center gap-4 group cursor-pointer"
                        >
                            <span className="text-[9px] font-black text-zinc-800 group-hover:text-emerald-500 transition-colors uppercase tracking-[0.4em]">
                                {language === 'en' ? 'AR_PROTOCOL' : 'EN_PROTOCOL'}
                            </span>
                            <div className="w-1.5 h-1.5 bg-zinc-900 group-hover:bg-emerald-500 transition-all" />
                        </button>

                        <div className="w-[1px] h-6 bg-white/5" />

                        {isLoggedIn ? (
                            <div className="flex items-center gap-8">
                                <Link href="/dashboard" className="group flex items-center gap-6">
                                    <div className="flex flex-col text-right">
                                        <span className="text-[11px] font-black text-white uppercase tracking-[0.1em] leading-none mb-2 group-hover:text-emerald-500 transition-colors">
                                            {session.user?.name?.toUpperCase()}
                                        </span>
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-zinc-900 uppercase tracking-[0.4em] leading-none">
                                                OPERATOR_ACTIVE
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 border border-white/5 bg-zinc-950 p-0.5 transition-all duration-700 group-hover:border-emerald-500/50">
                                        <div className="relative w-full h-full overflow-hidden">
                                            {session.user?.image ? (
                                                <Image src={session.user.image} alt="Avatar" width={48} height={48} className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                    <User className="w-5 h-5 text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-zinc-900 hover:text-white hover:bg-zinc-950 rounded-none h-12 w-12 p-0 border border-transparent hover:border-white/5"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-zinc-800 hover:text-white hover:bg-zinc-950 transition-all text-[10px] font-black uppercase tracking-[0.4em] px-8 h-12 rounded-none">
                                        ACCESS_PORTAL
                                    </Button>
                                </Link>
                                <Link href="/quote">
                                    <Button className="bg-white text-black hover:bg-emerald-500 h-12 px-10 rounded-none font-black text-[10px] uppercase tracking-[0.6em] transition-all duration-700 shadow-[0_20px_40px_rgba(255,255,255,0.05)]">
                                        INITIALIZE_MISSION
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Command Overwrite Toggles */}
                    <div className="xl:hidden flex items-center gap-6">
                        <button className="p-3 bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white transition-all" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tactical Mobile Overdrive Layer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 bg-black z-[101] flex flex-col p-12 bg-grid-premium"
                    >
                        <div className="flex justify-between items-center mb-32">
                            <div className="flex items-center gap-4">
                                <Ship className="w-8 h-8 text-white" />
                                <span className="text-xl font-black italic tracking-widest text-white">PHOENIX_OS</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-zinc-950 border border-white/5">
                                <X className="w-8 h-8 text-white" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-12">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-5xl font-black italic text-zinc-900 hover:text-emerald-500 uppercase tracking-tighter transition-all duration-500 flex items-center justify-between group"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                    <div className="h-10 w-10 border border-emerald-500/0 group-hover:border-emerald-500/50 flex items-center justify-center transition-all">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto pt-16 border-t border-white/5 flex flex-col gap-8">
                            <div className="flex justify-between items-center text-[10px] font-black text-zinc-800 uppercase tracking-[0.6em]">
                                <span>SYSTEM_STATUS</span>
                                <span className="text-emerald-500">OPERATIONAL_OK</span>
                            </div>
                            {isLoggedIn ? (
                                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                                    <Button className="w-full h-24 bg-white text-black text-[11px] font-black uppercase tracking-[0.8em] rounded-none italic shadow-[0_40px_100px_rgba(255,255,255,0.05)]">
                                        ENTER_MISSION_CONTROL
                                    </Button>
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-20 border-white/5 text-zinc-600 font-black text-[10px] uppercase tracking-[0.4em] rounded-none">
                                            PORTAL_ACCESS
                                        </Button>
                                    </Link>
                                    <Link href="/quote" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full h-20 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-none">
                                            INIT_MISSION
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
