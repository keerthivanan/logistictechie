"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
    const { t, language, setLanguage } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    const navLinks = [
        { href: '/tools', label: t('nav.tools') },
        { href: '/services', label: t('nav.services') },
        { href: '/pricing', label: t('nav.pricing') },
        { href: '/company', label: t('nav.company') },
    ];

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-black/95 backdrop-blur-3xl border-b border-white/10 py-2'
                : 'bg-transparent py-4'
                }`}>
                <div className="container max-w-7xl mx-auto flex h-14 items-center justify-between px-6">

                    {/* Logo - Alpha Class Branding */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:rotate-[360deg]">
                            <Globe className="h-6 w-6 text-black" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white uppercase italic group-hover:not-italic transition-all duration-500">
                            LOGI<span className="text-gray-500">TECH</span>
                        </span>
                    </Link>

                    {/* Navigation Links (Desktop) */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 hover:text-white transition-all relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all duration-500 group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        {/* Language Toggle - Premium Pill */}
                        <button
                            onClick={toggleLanguage}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all px-4 py-2 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.02]"
                        >
                            {language === 'en' ? 'Arabic' : 'English'}
                        </button>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                                {t('nav.signIn')}
                            </Link>
                            <Link href="/quote">
                                <Button className="bg-white text-black hover:bg-gray-200 h-11 px-8 font-black uppercase tracking-tighter rounded-xl shadow-2xl transition-all active:scale-95">
                                    {t('nav.getQuote')}
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setIsMobileOpen(false)} />
                    <div className="absolute top-0 left-0 right-0 bg-black border-b border-white/10 pt-20 pb-10 px-8 animate-in slide-in-from-top-4 duration-500">
                        <nav className="flex flex-col gap-6 mb-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className="text-2xl font-black uppercase tracking-tighter text-gray-500 hover:text-white py-4 border-b border-white/5 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/login" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                                <Button variant="outline" className="w-full h-14 border-white/10 text-white hover:bg-white hover:text-black font-black uppercase tracking-tighter rounded-2xl">
                                    {t('nav.signIn')}
                                </Button>
                            </Link>
                            <Link href="/quote" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                                <Button className="w-full h-14 bg-white text-black hover:bg-gray-200 font-black uppercase tracking-tighter rounded-2xl">
                                    {t('nav.getQuote')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
