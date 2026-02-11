"use client";

import Link from "next/link";
import { Twitter, Linkedin, Mail, Ship, Zap, Globe, Shield, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    const sections = [
        {
            title: "OPERATIONAL_TOOLS",
            links: [
                { href: "/quote", label: "QUOTE_ENGINE" },
                { href: "/tracking", label: "LIVE_TELEMETRY" },
                { href: "/market", label: "MARKET_INTELLIGENCE" },
                { href: "/schedules", label: "VESSEL_SCHEDULES" },
            ]
        },
        {
            title: "NETWORK_NODE",
            links: [
                { href: "/company", label: "ORIGIN_STORY" },
                { href: "/services", label: "CAPABILITIES" },
                { href: "/pricing", label: "INVESTMENT_PLANS" },
                { href: "/careers", label: "JOIN_COLLECTIVE" },
            ]
        },
        {
            title: "PROTOCOL_SUPPORT",
            links: [
                { href: "/contact", label: "CRISIS_LINK" },
                { href: "/help", label: "KNOWLEDGE_BASE" },
                { href: "/terms", label: "LEGAL_TERMS" },
                { href: "/privacy", label: "DATA_PRIVACY" },
            ]
        }
    ];

    return (
        <footer className="border-t border-white/5 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-premium opacity-10 pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 relative z-10">

                {/* Tactical Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-0 border-x border-white/5">

                    {/* Brand Manifest */}
                    <div className="lg:col-span-3 p-12 lg:p-16 border-b border-white/5 lg:border-r">
                        <Link href="/" className="flex items-center gap-6 mb-12 group">
                            <div className="w-14 h-14 bg-white flex items-center justify-center relative transition-all duration-700 group-hover:bg-emerald-500 group-hover:rotate-12">
                                <Ship className="h-8 w-8 text-black" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic tracking-[0.2em] uppercase">
                                PHOENIX<span className="text-zinc-900 font-bold not-italic">OS</span>
                            </h2>
                        </Link>
                        <p className="text-zinc-700 text-[11px] font-black uppercase tracking-[0.4em] leading-loose max-w-xl mb-12">
                            A global engineering collective dedicated to neutralizing the fundamental complexity of international trade.
                            Architecting the future of velocity through autonomous logistics.
                        </p>

                        <div className="flex gap-8">
                            {[
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Mail, href: "mailto:ops@phoenix.io" }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="h-12 w-12 border border-white/5 flex items-center justify-center text-zinc-800 hover:text-white hover:border-white/20 transition-all duration-500"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Clusters */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="lg:col-span-1 p-12 border-b border-white/5 border-r last:border-r-0">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.6em] mb-12">{section.title}</h4>
                            <ul className="space-y-6">
                                {section.links.map((link, li) => (
                                    <li key={li}>
                                        <Link
                                            href={link.href}
                                            className="text-[9px] font-black text-zinc-800 hover:text-emerald-500 uppercase tracking-[0.4em] transition-all flex items-center group"
                                        >
                                            {link.label}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* System Status & Ledger Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-x border-b border-white/5">
                    <div className="p-8 border-b md:border-b-0 md:border-r border-white/5 flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.6em]">ALL_SYSTEMS_OPERATIONAL</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/5" />
                        <span className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.4em]">SYNC_DELAY: 14MS</span>
                    </div>

                    <div className="p-8 flex items-center justify-between">
                        <p className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.6em]">
                            © 2026 PHOENIX_OS_OPERATIONS. ALL_RIGHTS_RESERVED.
                        </p>
                        <div className="flex items-center gap-4 text-[9px] font-black text-zinc-950 uppercase tracking-[0.4em]">
                            <span>V4.1.0_STABLE</span>
                            <Shield className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cinematic Gradient Finish */}
            <div className="h-24 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
        </footer>
    );
}
