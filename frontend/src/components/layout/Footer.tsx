"use client";

import Link from "next/link";
import { Globe, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="relative border-t border-white/[0.05] bg-black text-sm">
            {/* Subtle gradient glow at top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="container max-w-7xl mx-auto px-6 py-16">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-6 group">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <Globe className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Logi<span className="text-blue-400">Tech</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            The world's most intelligent logistics platform. Real-time rates, instant tracking, and AI-powered supply chain management.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-500 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Products</h4>
                        <ul className="space-y-3">
                            <li><Link href="/quote" className="text-gray-500 hover:text-white transition-colors">Instant Quotes</Link></li>
                            <li><Link href="/tracking" className="text-gray-500 hover:text-white transition-colors">Container Tracking</Link></li>
                            <li><Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link href="/tools" className="text-gray-500 hover:text-white transition-colors">Logistics Tools</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Company</h4>
                        <ul className="space-y-3">
                            <li><Link href="/company" className="text-gray-500 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/services" className="text-gray-500 hover:text-white transition-colors">Services</Link></li>
                            <li><Link href="/pricing" className="text-gray-500 hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="text-gray-500 hover:text-white transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Legal</h4>
                        <ul className="space-y-3">
                            <li><Link href="/terms" className="text-gray-500 hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                            <li><Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                            <li><Link href="#" className="text-gray-500 hover:text-white transition-colors">{t('footer.contact')}</Link></li>
                            <li><Link href="#" className="text-gray-500 hover:text-white transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-xs">
                        © 2024 LogiTech. {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-6 text-xs text-gray-600">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                            All systems operational
                        </span>
                        <span>v2.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
