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
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
            isScrolled
                ? "bg-black/95 backdrop-blur-md border-b border-white/5 py-4"
                : "bg-transparent py-8"
        )}>
            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="flex items-center justify-between">

                    {/* Branding */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-7 h-7 border border-white/20 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
                            <Ship className="h-3.5 w-3.5" />
                        </div>
                        <h1 className="text-base font-bold text-white uppercase tracking-[0.15em] leading-none">
                            PHOENIX <span className="text-zinc-600 font-light">LOGISTICS</span>
                        </h1>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden xl:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 py-1.5",
                                    pathname === link.href ? "text-white" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                {t(`nav.${link.label.toLowerCase()}`)}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                            className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {language === 'en' ? 'Arabic' : 'English'}
                        </button>

                        <div className="w-[1px] h-3 bg-white/10" />

                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="flex items-center gap-3 group">
                                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white uppercase tracking-wider transition-all">
                                        {session.user?.name?.split(' ')[0]}
                                    </span>
                                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 group-hover:border-white/40 transition-all">
                                        {session.user?.image ? (
                                            <Image src={session.user.image} alt="Avatar" width={28} height={28} />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900" />
                                        )}
                                    </div>
                                </Link>
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-zinc-600 hover:text-white transition-colors">
                                    <LogOut className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <button className="h-8 px-4 border border-white/10 text-zinc-500 hover:text-white hover:border-white text-[10px] font-bold uppercase tracking-widest transition-all">
                                    {t('nav.signIn')}
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Command Toggle */}
                    <div className="xl:hidden">
                        <button
                            className="text-white p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
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
