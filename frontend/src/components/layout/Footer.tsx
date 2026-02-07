"use client";

import Link from "next/link";
import { Globe, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="relative border-t border-white/10 bg-black text-sm">
            {/* Minimalist Separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

            <div className="container max-w-7xl mx-auto px-6 py-20">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">

                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-4 mb-8 group">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:rotate-[360deg]">
                                <Globe className="h-6 w-6 text-black" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white uppercase italic group-hover:not-italic transition-all duration-500">
                                LOGI<span className="text-gray-500">TECH</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-8">
                            High-Resolution Logistics. Optimized for the 2026 Global Terminal Network. Built for the standard-bearers of industry.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-600 hover:text-white transition-all transform hover:scale-110">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-white transition-all transform hover:scale-110">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-white transition-all transform hover:scale-110">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-white font-black mb-6 text-[10px] uppercase tracking-[0.3em]">Network</h4>
                        <ul className="space-y-4">
                            <li><Link href="/quote" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Instant Quotes</Link></li>
                            <li><Link href="/tracking" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Global Track</Link></li>
                            <li><Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Command Center</Link></li>
                            <li><Link href="/tools" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Logic Tools</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-black mb-6 text-[10px] uppercase tracking-[0.3em]">Identity</h4>
                        <ul className="space-y-4">
                            <li><Link href="/company" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Protocol</Link></li>
                            <li><Link href="/services" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Core Assets</Link></li>
                            <li><Link href="/pricing" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Unit Price</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-black mb-6 text-[10px] uppercase tracking-[0.3em]">Security</h4>
                        <ul className="space-y-4">
                            <li><Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Terms</Link></li>
                            <li><Link href="/privacy" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Vault</Link></li>
                            <li><Link href="#" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">Status: 100%</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-700 text-[9px] font-black uppercase tracking-[0.4em]">
                        © 2026 LOGITECH® SYSTEM. {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-widest text-gray-700">
                        <span className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            Secure Link Established
                        </span>
                        <span className="text-gray-800">BUILD_ID: 2.6.0_FINAL</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
