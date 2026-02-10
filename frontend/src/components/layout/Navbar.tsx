"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { Menu, X, Globe, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchMe = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.get(`${apiUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserName(res.data.full_name || "User");
            setAvatarUrl(res.data.avatar_url || "");
            setIsLoggedIn(true);
        } catch (e) {
            setIsLoggedIn(false);
        }
    };

    useEffect(() => {
        fetchMe();
        window.addEventListener('storage', fetchMe);
        window.addEventListener('auth-change', fetchMe);
        return () => {
            window.removeEventListener('storage', fetchMe);
            window.removeEventListener('auth-change', fetchMe);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('auth-change'));
        setIsLoggedIn(false);
        setUserName("");
        router.push("/");
    };

    const navLinks = [
        { href: '/quote', label: t('nav.quote') },
        { href: '/tracking', label: t('tracking.title') }, // or proper key
        { href: '/services', label: t('nav.services') },
        { href: '/pricing', label: t('nav.pricing') },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/95 backdrop-blur-lg border-b border-zinc-800 py-4" : "bg-transparent py-6"
            }`}>
            <div className="container max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-xl">P</span>
                        </div>
                        <span className="text-xl font-semibold text-white tracking-tight">
                            Phoenix<span className="text-zinc-500">OS</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors duration-200 hover:text-white ${pathname === link.href ? "text-white" : "text-zinc-400"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                            className="flex items-center space-x-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{language === 'en' ? 'AR' : 'EN'}</span>
                        </button>

                        {isLoggedIn ? (
                            <>
                                <Link href="/profile">
                                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full h-10 w-10 p-0 flex items-center justify-center border border-zinc-700 overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg h-10 px-4 font-medium text-sm">
                                        {t('dashboard.title') || "Dashboard"}
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg h-10 px-4 font-medium text-sm"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t('nav.signIn').replace('Sign In', 'Logout') === 'Sign In' ? 'Logout' : 'تسجيل خروج'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg h-10 px-4 font-medium text-sm">
                                        {t('nav.signIn')}
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="bg-white text-black hover:bg-zinc-200 rounded-lg h-10 px-6 font-semibold text-sm transition-all">
                                        {t('nav.getQuote')}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 bg-black border-b border-zinc-800 p-6 lg:hidden"
                    >
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-lg font-medium text-white py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-zinc-800 space-y-3">
                                {isLoggedIn ? (
                                    <>
                                        <Link href="/dashboard" className="block">
                                            <Button className="w-full bg-zinc-800 text-white rounded-lg h-12 font-semibold">
                                                {t('dashboard.title') || "Dashboard"}
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={handleLogout}
                                            variant="outline"
                                            className="w-full border-zinc-700 text-zinc-400 rounded-lg h-12"
                                        >
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="block">
                                            <Button variant="outline" className="w-full border-zinc-700 text-white rounded-lg h-12">
                                                {t('nav.signIn')}
                                            </Button>
                                        </Link>
                                        <Link href="/signup" className="block">
                                            <Button className="w-full bg-white text-black rounded-lg h-12 font-semibold">
                                                {t('nav.getQuote')}
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
