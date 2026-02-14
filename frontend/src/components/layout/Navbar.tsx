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
    const { language, setLanguage, t } = useLanguage();

    const isLoggedIn = status === "authenticated";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: '/quote', label: 'WORK' },
        { href: '/services', label: 'SERVICES' },
        { href: '/company', label: 'ABOUT' },
        { href: '/market', label: 'INTEL' },
        { href: '/contact', label: 'CONTACT' },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
            isScrolled
                ? "bg-black/95 backdrop-blur-xl border-b border-white/5 py-4 shadow-2xl shadow-black"
                : "bg-transparent py-8"
        )}>
            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="flex items-center justify-between">

                    {/* Branding - High Contrast */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-all group-hover:scale-110">
                                <Ship className="h-5 w-5 text-black" />
                            </div>
                            <div className="absolute -inset-1 bg-white/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                            PHOENIX <br /><span className="text-white/20 italic font-medium text-sm tracking-[0.2em]">LOGISTICS</span>
                        </h1>
                    </Link>

                    {/* Tactical Navigation */}
                    <div className="hidden xl:flex items-center gap-12">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-300 py-2 relative group",
                                    pathname === link.href ? "text-white" : "text-white/40 hover:text-white"
                                )}
                            >
                                {t(`nav.${link.label.toLowerCase()}`)}
                                <span className={cn(
                                    "absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                                    pathname === link.href && "scale-x-100"
                                )} />
                            </Link>
                        ))}
                    </div>

                    {/* Actions - Command Tier */}
                    <div className="hidden lg:flex items-center gap-10">
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                            className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.4em]"
                        >
                            {language === 'en' ? 'AR' : 'EN'}
                        </button>

                        <div className="w-[1px] h-4 bg-white/10" />

                        {isLoggedIn ? (
                            <div className="flex items-center gap-6">
                                <Link href="/profile" className="flex items-center gap-4 group">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">
                                            {session.user?.name?.split(' ')[0]}
                                        </p>
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] mt-1">
                                            COMMANDER
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/5 group-hover:border-white transition-all">
                                        {session.user?.image ? (
                                            <Image src={session.user.image} alt="Avatar" width={40} height={40} />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white/40">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-white/20 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-xl">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <button className="h-12 px-10 bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95">
                                    {t('nav.signIn')}
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="xl:hidden">
                        <button
                            className="text-white p-3 hover:bg-white/10 rounded-2xl transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Architectural Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-[101] flex flex-col p-12"
                    >
                        <div className="flex justify-between items-center mb-48">
                            <span className="text-xl font-bold tracking-[0.6em] text-white">PHOENIX</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="w-10 h-10 text-white" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-12 mt-24">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-6xl font-light text-zinc-800 hover:text-white transition-all tracking-tighter"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
