"use client";

import Link from "next/link";
import { Ship, Linkedin, Twitter, Github } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    const sections = [
        {
            title: t('footer.strategic'),
            links: [
                { label: t('footer.labels.quoteEngine'), href: "/quote" },
                { label: t('footer.labels.marketIntel'), href: "/market" },
                { label: t('footer.labels.capabilities'), href: "/services" },
                { label: t('footer.labels.globalNodes'), href: "/schedules" }
            ]
        },
        {
            title: t('footer.operational'),
            links: [
                { label: t('footer.labels.trackMission'), href: "/tracking" },
                { label: t('footer.labels.documentation'), href: "/docs" },
                { label: t('footer.labels.systemStatus'), href: "/health" },
                { label: t('footer.labels.supportLink'), href: "/contact" }
            ]
        },
        {
            title: t('footer.architecture'),
            links: [
                { label: t('footer.labels.designPhilosophy'), href: "/company" },
                { label: t('footer.labels.coreLegal'), href: "/terms" },
                { label: t('footer.labels.dataPrivacy'), href: "/privacy" },
                { label: t('footer.labels.securityProto'), href: "/security" }
            ]
        }
    ];

    return (
        <footer className="bg-black text-white border-t border-white/5 pt-20 pb-12">
            <div className="container max-w-[1400px] mx-auto px-6">

                {/* Grid */}
                <div className="grid lg:grid-cols-4 gap-16 mb-20">

                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                            <Ship className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold tracking-widest text-white">PHOENIX</h2>
                        <p className="text-[12px] font-medium text-zinc-600 leading-relaxed uppercase tracking-wider">
                            Strategic Operations Hub<br />
                            Saudi Arabia, Riyadh<br />
                            Enterprise Logistics Node
                        </p>
                    </div>

                    {/* Links */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="arch-detail-line">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-zinc-500 mb-6 block">{section.title}</span>
                            <div className="flex flex-col gap-4">
                                {section.links.map((link, lIdx) => (
                                    <Link
                                        key={lIdx}
                                        href={link.href}
                                        className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sub-footer */}
                <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-medium text-zinc-700 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span>System Active: v4.2.0</span>
                    </div>
                    <span>© 2026 {t('footer.rights')}</span>
                    <div className="flex gap-8">
                        <Linkedin className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
                        <Twitter className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
                        <Github className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
