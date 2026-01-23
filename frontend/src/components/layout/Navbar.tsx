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
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.05]'
                    : 'bg-transparent'
                }`}>
                <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-6">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Globe className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Logi<span className="text-blue-400">Tech</span>
                        </span>
                    </Link>

                    {/* Navigation Links (Desktop) */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="text-xs font-medium text-gray-500 hover:text-white transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
                        >
                            {language === 'en' ? 'العربية' : 'EN'}
                        </button>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                {t('nav.signIn')}
                            </Link>
                            <Link href="/quote">
                                <Button className="bg-white text-black hover:bg-gray-100 h-9 px-5 font-medium shadow-lg">
                                    {t('nav.getQuote')}
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
                    <div className="absolute top-16 left-0 right-0 bg-black border-b border-white/10 p-6 animate-in slide-in-from-top-2">
                        <nav className="flex flex-col gap-4 mb-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className="text-lg font-medium text-gray-300 hover:text-white py-2 border-b border-white/5"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex gap-3">
                            <Link href="/login" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5">
                                    {t('nav.signIn')}
                                </Button>
                            </Link>
                            <Link href="/quote" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                                <Button className="w-full bg-white text-black hover:bg-gray-100">
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
