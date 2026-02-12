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
        <footer className="bg-black text-white border-t border-white/5 pt-48 pb-24">
            <div className="container max-w-[1400px] mx-auto px-8">

                {/* Structural Foundation Grid */}
                <div className="grid lg:grid-cols-4 gap-32 mb-48">

                    {/* Brand Node */}
                    <div className="space-y-12">
                        <div className="w-12 h-12 border border-white flex items-center justify-center">
                            <Ship className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold tracking-[0.6em] text-white">PHOENIX</h2>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-800 leading-loose uppercase">
                            NEOM_OPERATIONAL_HUB<br />
                            SAUDI_ARABIA_UNIT_1<br />
                            CORE_ARCHITECTURE_FIRM
                        </p>
                    </div>

                    {/* Links Matrix */}
                    {sections.map((section, idx) => (
                        <div key={idx} className="arch-detail-line">
                            <span className="arch-label mb-12 block">{section.title}</span>
                            <div className="flex flex-col gap-6">
                                {section.links.map((link, lIdx) => (
                                    <Link
                                        key={lIdx}
                                        href={link.href}
                                        className="text-[10px] font-bold tracking-[0.4em] text-zinc-700 hover:text-white transition-colors uppercase"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sub-terrain Footer */}
                <div className="mt-48 pt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 text-[9px] font-bold tracking-[0.8em] text-zinc-900 uppercase">
                    <div className="flex items-center gap-6">
                        <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                        <span>SYSTEM_ID: PHOENIX_OS_V4.1.0</span>
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
