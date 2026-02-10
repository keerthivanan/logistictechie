"use client";

import Link from "next/link";
import { Twitter, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-zinc-900 bg-black">
            <div className="container max-w-7xl mx-auto px-6 py-16">

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-black font-bold text-xl">P</span>
                            </div>
                            <span className="text-xl font-semibold text-white tracking-tight">
                                Phoenix<span className="text-zinc-500">OS</span>
                            </span>
                        </Link>
                        <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                            {t('company.mission_text1')}
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="mailto:hello@phoenixos.com" className="text-zinc-500 hover:text-white transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">{t('nav.tools')}</h4>
                        <ul className="space-y-3">
                            <li><Link href="/quote" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('nav.quote')}</Link></li>
                            <li><Link href="/tracking" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('tracking.title')}</Link></li>
                            <li><Link href="/tools" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('nav.tools')}</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">{t('nav.company')}</h4>
                        <ul className="space-y-3">
                            <li><Link href="/company" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('nav.company')}</Link></li>
                            <li><Link href="/services" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('nav.services')}</Link></li>
                            <li><Link href="/pricing" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('nav.pricing')}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-3">
                            <li><Link href="/help" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('footer.contact')}</Link></li>
                            <li><Link href="/contact" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('footer.contact')}</Link></li>
                            <li><Link href="/terms" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('legal.terms.title')}</Link></li>
                            <li><Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors text-sm">{t('legal.privacy.title')}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-sm">
                        © 2026 Phoenix Logistics. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-zinc-600">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
